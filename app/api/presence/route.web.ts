import { customerGet, customerSet, seenSet } from "@/lib/db";
import { cors, preflight } from "@/lib/cors";
import { validUserId } from "@/lib/premiumServer";

export const OPTIONS = preflight;

const PHOTO = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

/**
 * POST { userId }                          → "I'm online" heartbeat (every 2 minutes while the app is open)
 * POST { userId, profile: {name,email,photo,platform} } → save the customer's profile
 * POST { userId, profile: null }           → delete the profile (log out)
 */
export async function POST(req: Request) {
  let body: { userId?: unknown; profile?: { name?: unknown; email?: unknown; photo?: unknown; platform?: unknown } | null };
  try {
    body = await req.json();
  } catch {
    return cors(req, Response.json({ error: "Invalid JSON" }, { status: 400 }));
  }
  if (!validUserId(body.userId)) return cors(req, Response.json({ error: "Invalid user" }, { status: 400 }));
  const id = body.userId;

  if (body.profile === null) {
    await customerSet(id, null);
    return cors(req, Response.json({ ok: true }));
  }

  if (body.profile) {
    const name = typeof body.profile.name === "string" ? body.profile.name.trim().slice(0, 40) : "";
    const email = typeof body.profile.email === "string" ? body.profile.email.trim().slice(0, 80) : "";
    const photo = typeof body.profile.photo === "string" && body.profile.photo.length < 60000 && PHOTO.test(body.profile.photo) ? body.profile.photo : "";
    const platform = typeof body.profile.platform === "string" ? body.profile.platform.slice(0, 10) : "web";
    if (!name) return cors(req, Response.json({ error: "Please enter your name." }, { status: 400 }));
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return cors(req, Response.json({ error: "That email address doesn't look right." }, { status: 400 }));
    const old = await customerGet(id);
    const now = new Date().toISOString();
    await customerSet(id, { name, email, photo, platform, createdAt: old?.createdAt ?? now, updatedAt: now });
  }

  await seenSet(id);
  return cors(req, Response.json({ ok: true }));
}
