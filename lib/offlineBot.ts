import type { Vocab } from "./types";

export type ChatMsg = { role: "user" | "assistant"; content: string };

/** Tiny rule-based fallback tutor, used when no AI key is configured. */
export function offlineReply(opts: {
  messages: ChatMsg[];
  topic: string;
  vocab: Vocab[];
  questions: string[];
  stage?: string;
}): string {
  const userMsgs = opts.messages.filter((m) => m.role === "user");
  const last = userMsgs[userMsgs.length - 1]?.content.trim() ?? "";
  const n = userMsgs.length;

  if (opts.stage === "review") {
    const words = userMsgs.map((m) => m.content).join(" ").split(/\s+/).filter(Boolean).length;
    return `📝 Session review: You wrote ${n} messages and about ${words} words. Great effort! Next time, try to use longer sentences with "because" and "so". Keep practising every day! 🌟`;
  }

  const fixes: string[] = [];
  let better = last;
  better = better.replace(/\bi\b/g, "I").replace(/\bim\b/gi, "I'm").replace(/\bdont\b/gi, "don't").replace(/\bcant\b/gi, "can't");
  if (better && better[0] !== better[0].toUpperCase()) better = better[0].toUpperCase() + better.slice(1);
  if (better && !/[.!?]$/.test(better)) better += /^(what|where|when|how|why|who|can|could|do|does|is|are|would|will)\b/i.test(better) ? "?" : ".";
  if (better !== last && last.length > 2) fixes.push(`✏️ Better: ${better}`);

  const praise = ["Nice!", "Good answer!", "Great!", "Thank you!", "Wonderful!", "I see!"][n % 6];
  const v = opts.vocab[n % Math.max(1, opts.vocab.length)];
  const prompts = [
    ...opts.questions,
    v ? `Can you make a sentence with the word "${v.word}"? (${v.meaning})` : "",
    `What else would you say in this situation: ${opts.topic}?`,
    "Can you tell me more? Try to use two sentences.",
  ].filter(Boolean);
  const next = prompts[n % prompts.length];
  const short = last.split(/\s+/).length < 4 ? " Try to answer with a full sentence. 🙂" : "";

  return [...fixes, `${praise}${short} ${next}`].join("\n");
}
