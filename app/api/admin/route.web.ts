import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  adminCookieValue,
  adminEnabled,
  checkPassword,
  isAdmin,
  maskedAdminEmail,
  recoveryEnabled,
  resetPassword,
  sendResetCode,
} from "@/lib/adminAuth";

/**
 * Shared login: the normal /login page uses this so the admin signs in on the same screen as everyone else.
 * GET                                         → { enabled, admin, recovery, email }
 * POST { password }                           → sign in as admin (only the correct admin password works)
 * POST { action: "send-code" }                → email a 6-digit security code to the admin's email
 * POST { action: "reset", code, password }    → create a new admin password with that code, then sign in
 * DELETE                                      → sign out of admin
 */
export async function GET() {
  return Response.json(
    { enabled: await adminEnabled(), admin: await isAdmin(), recovery: recoveryEnabled(), email: maskedAdminEmail() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

const slow = () => new Promise((r) => setTimeout(r, 900)); // slows down guessing

async function signIn() {
  (await cookies()).set(ADMIN_COOKIE, await adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function POST(req: Request) {
  let body: { action?: unknown; password?: unknown; code?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const password = typeof body.password === "string" ? body.password : "";

  if (body.action === "send-code") {
    const r = await sendResetCode();
    return r.ok ? Response.json({ ok: true, email: maskedAdminEmail() }) : Response.json({ error: r.error }, { status: 400 });
  }

  if (body.action === "reset") {
    const r = await resetPassword(typeof body.code === "string" ? body.code : "", password);
    if (!r.ok) {
      await slow();
      return Response.json({ error: r.error }, { status: 400 });
    }
    await signIn();
    return Response.json({ ok: true });
  }

  if (!(await adminEnabled())) return Response.json({ error: "Admin is not set up yet (ADMIN_PASSWORD is missing)." }, { status: 400 });
  if (!(await checkPassword(password))) {
    await slow();
    return Response.json({ error: "Wrong admin password." }, { status: 401 });
  }
  await signIn();
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
