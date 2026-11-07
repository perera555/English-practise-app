import Anthropic from "@anthropic-ai/sdk";
import { isPremiumUser } from "@/lib/premiumServer";
import { cors, preflight } from "@/lib/cors";
import { isAdminRequest } from "@/lib/adminAuth";

type InMsg = { role: "user" | "assistant"; content: string };

const STAGES: Record<string, string> = {
  warmup: "Stage: WARM-UP. Ask easy personal questions related to the topic to get the learner talking.",
  roleplay: "Stage: ROLE-PLAY. Stay fully in character and act out the situation realistically, one step at a time.",
  freetalk: "Stage: FREE TALK. Step slightly out of character and ask the learner open opinion questions about the topic (why / how / what do you think).",
  review:
    "Stage: REVIEW. The session is over. Do not continue the role-play. Give a short, warm feedback report: 3 things they did well, the 3 most important mistakes from this conversation with corrections, and 3 useful new phrases to remember. Use short bullet points.",
};

function clip(s: unknown, n: number) {
  return typeof s === "string" ? s.slice(0, n) : "";
}

export const OPTIONS = preflight;

export async function POST(req: Request) {
  return cors(req, await handle(req));
}

async function handle(req: Request): Promise<Response> {
  let body: { messages?: InMsg[]; robot?: string; topic?: string; level?: string; stage?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // The AI robot costs money per reply, so it is a Premium feature (unless FREE_AI=true).
  if (process.env.FREE_AI !== "true" && !isAdminRequest(req) && !(await isPremiumUser(body.userId))) {
    return Response.json({ offline: true, locked: true }, { status: 503 });
  }

  const robot = clip(body.robot, 200) || "a friendly English tutor";
  const topic = clip(body.topic, 200) || "everyday English";
  const level = body.level === "Advanced" ? "Advanced" : body.level === "Intermediate" ? "Intermediate" : "Beginner";
  const cefr =
    level === "Beginner"
      ? "A1-A2: use very simple words and short sentences"
      : level === "Intermediate"
        ? "B1-B2: natural everyday English, some idioms explained briefly"
        : "C1-C2: speak like a native speaker. Use idioms, phrasal verbs and natural informal expressions, and briefly explain an idiom in brackets the first time you use it";
  const stage = STAGES[clip(body.stage, 20)] ?? "";

  const history: Anthropic.Beta.BetaMessageParam[] = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-40)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (history.length === 0 || history[0].role !== "user") {
    history.unshift({ role: "user", content: "(The learner opened the chat. Start the conversation.)" });
  }
  if (history[history.length - 1].role !== "user") {
    history.push({ role: "user", content: "(continue)" });
  }

  const system = `You are an English speaking-practice partner inside a learning app. You play ${robot}. Topic: "${topic}".
The learner's level is ${level} (CEFR ${cefr}).

Rules:
- Keep each reply short: 1-3 sentences, then ask ONE question so the learner keeps talking.
- If the learner's last message has a grammar or word mistake, begin your reply with a single line in this exact format:
✏️ Better: <their sentence, corrected>
  Then continue naturally on a new line. Do not correct punctuation-only issues. If there is no mistake, do not add that line.
- Never use markdown headings or tables. Plain text and simple emoji only. Your reply is read aloud by text-to-speech.
- Messages in parentheses are app instructions, not the learner speaking.
- Be warm and encouraging. This is practice only — for any real emergency or medical issue, remind them to contact real services.
${stage}`;

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch {
    return Response.json({ offline: true }, { status: 503 });
  }

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system,
    messages: history,
  });

  const iterator = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.Beta.BetaRawMessageStreamEvent>;
  try {
    first = await iterator.next();
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      return Response.json({ offline: true }, { status: 503 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "The robot is busy. Please wait a moment and try again." }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return Response.json({ error: `AI error (${err.status ?? "network"})` }, { status: 502 });
    }
    // Missing credentials surface as a plain SDK error before any request is made.
    return Response.json({ offline: true }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (ev: Anthropic.Beta.BetaRawMessageStreamEvent) => {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(ev.delta.text));
        }
      };
      try {
        if (!first.done) emit(first.value);
        for (;;) {
          const r = await iterator.next();
          if (r.done) break;
          emit(r.value);
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\nSorry, I can't help with that. Let's talk about something else! 🙂"));
        }
      } catch {
        controller.enqueue(encoder.encode("\n(Connection problem. Please try again.)"));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
