import { USER_KINDS, userDataGet, userDataSet, type UserBackup } from "@/lib/db";
import { cors, preflight } from "@/lib/cors";
import { validUserId } from "@/lib/premiumServer";

export const OPTIONS = preflight;

const MAX = 800_000; // characters of JSON per learner

/** GET ?userId=… → the learner's saved data (progress, notebook, settings, profile). */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("userId");
  if (!validUserId(id)) return cors(req, Response.json({ error: "Invalid user" }, { status: 400 }));
  try {
    return cors(req, Response.json(await userDataGet(id), { headers: { "Cache-Control": "no-store" } }));
  } catch {
    return cors(req, Response.json({ error: "Database not available" }, { status: 503 }));
  }
}

/** POST { userId, data: { "erp-progress": …, "erp-notebook-v1": … } } → save it. */
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > MAX) return cors(req, Response.json({ error: "Too much data" }, { status: 413 }));
  let body: { userId?: unknown; data?: Record<string, unknown> };
  try {
    body = JSON.parse(text);
  } catch {
    return cors(req, Response.json({ error: "Invalid JSON" }, { status: 400 }));
  }
  if (!validUserId(body.userId)) return cors(req, Response.json({ error: "Invalid user" }, { status: 400 }));
  const data: UserBackup = {};
  for (const k of USER_KINDS) {
    const v = body.data?.[k];
    if (v && typeof v === "object") data[k] = v;
  }
  try {
    await userDataSet(body.userId, data);
    return cors(req, Response.json({ ok: true }));
  } catch {
    return cors(req, Response.json({ error: "Database not available" }, { status: 503 }));
  }
}
