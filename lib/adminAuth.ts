import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "speakup_admin";

/** Admin is enabled only when ADMIN_PASSWORD is set (in .env.local or on Vercel). */
export function adminEnabled() {
  return (process.env.ADMIN_PASSWORD ?? "").length >= 8;
}

function token() {
  return createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update("speakup-admin-v1").digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(pw: string) {
  return adminEnabled() && same(createHmac("sha256", "pw").update(pw).digest("hex"), createHmac("sha256", "pw").update(process.env.ADMIN_PASSWORD!).digest("hex"));
}

export function adminCookieValue() {
  return token();
}

export function isAdminToken(value: string | undefined) {
  return adminEnabled() && !!value && same(value, token());
}

/** For Server Components and Server Actions. */
export async function isAdmin() {
  const jar = await cookies();
  return isAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

/** For Route Handlers. */
export function isAdminRequest(req: Request) {
  const raw = req.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return isAdminToken(m?.[1]);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not authorised");
}
