import { dbGet, dbSet } from "@/lib/db";
import { premiumUntil, validUserId } from "@/lib/premiumServer";
import { cors, preflight } from "@/lib/cors";
import { isAdminRequest } from "@/lib/adminAuth";

export const OPTIONS = preflight;

/** POST { userId } -> { premium, until }   |   POST { userId, code } -> redeem a gift code */
export async function POST(req: Request) {
  let body: { userId?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return cors(req, Response.json({ error: "Invalid JSON" }, { status: 400 }));
  }
  if (!validUserId(body.userId)) return cors(req, Response.json({ error: "Invalid user" }, { status: 400 }));
  const userId = body.userId;

  if (typeof body.code === "string" && body.code.trim()) {
    const code = body.code.trim().toUpperCase();
    const codes = await dbGet("codes");
    const c = codes[code];
    if (!c) return cors(req, Response.json({ error: "This code is not valid." }, { status: 404 }));
    if (c.usedBy && c.usedBy !== userId) return cors(req, Response.json({ error: "This code has already been used." }, { status: 409 }));
    if (!c.usedBy) {
      codes[code] = { ...c, usedBy: userId, usedAt: new Date().toISOString() };
      await dbSet("codes", codes);
      const grants = await dbGet("grants");
      const until = c.days ? new Date(Date.now() + c.days * 86400000).toISOString() : null;
      grants[userId] = { until, note: `Gift code ${code}`, createdAt: new Date().toISOString() };
      await dbSet("grants", grants);
    }
  }

  // Admins never need a subscription.
  const until = isAdminRequest(req) ? "lifetime" : await premiumUntil(userId);
  return cors(req, Response.json({ premium: !!until, until }));
}
