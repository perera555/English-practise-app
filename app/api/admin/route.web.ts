import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminCookieValue, adminEnabled, checkPassword, isAdmin } from "@/lib/adminAuth";

/**
 * Shared login: the normal /login page uses this so the admin signs in on the same screen as everyone else.
 * GET    → { enabled, admin }   is admin set up, and is this browser signed in as admin?
 * POST   { password }           → sign in as admin (only the correct ADMIN_PASSWORD works)
 * DELETE                        → sign out of admin
 */
export async function GET() {
  return Response.json({ enabled: adminEnabled(), admin: await isAdmin() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let pw = "";
  try {
    const body = await req.json();
    pw = typeof body?.password === "string" ? body.password : "";
  } catch {
    /* empty body */
  }
  if (!adminEnabled()) return Response.json({ error: "Admin is not set up yet (ADMIN_PASSWORD is missing)." }, { status: 400 });
  if (!checkPassword(pw)) {
    await new Promise((r) => setTimeout(r, 900)); // slow down guessing
    return Response.json({ error: "Wrong admin password." }, { status: 401 });
  }
  (await cookies()).set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
