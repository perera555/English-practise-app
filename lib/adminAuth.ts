import "server-only";
import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { dbGet, dbSet, type AdminSecret } from "./db";

export const ADMIN_COOKIE = "speakup_admin";

/**
 * Admin password:
 * - Starts as ADMIN_PASSWORD (in .env.local or on Vercel).
 * - "Forgot password" on the login page emails a 6-digit security code to ADMIN_EMAIL (sent with Resend).
 *   With that code the owner creates a new password. It is saved (hashed) in the database and replaces ADMIN_PASSWORD.
 * Changing the password signs out every old admin session.
 */
const envPassword = () => process.env.ADMIN_PASSWORD ?? "";
const adminEmail = () => (process.env.ADMIN_EMAIL ?? "").trim();
const resendKey = () => (process.env.RESEND_API_KEY ?? "").trim();

export const MIN_PASSWORD = 8;
const CODE_MINUTES = 10;
const MAX_TRIES = 5;
const RESEND_WAIT_MS = 60_000;

let cache: { at: number; value: AdminSecret } | null = null;
async function stored(fresh = false): Promise<AdminSecret> {
  if (!fresh && cache && Date.now() - cache.at < 30000) return cache.value;
  let value: AdminSecret = {};
  try {
    value = await dbGet("admin");
  } catch {
    /* database not reachable: fall back to ADMIN_PASSWORD */
  }
  cache = { at: Date.now(), value };
  return value;
}
async function save(value: AdminSecret) {
  await dbSet("admin", value);
  cache = { at: Date.now(), value };
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const sha = (s: string) => createHmac("sha256", "pw").update(s).digest("hex");
const scrypt = (pw: string, salt: string) => scryptSync(pw, salt, 32).toString("hex");

/** What admin cookies are signed with: changes whenever the password changes. */
async function secret() {
  const s = await stored();
  return s.hash ? `db:${s.hash}` : envPassword().length >= MIN_PASSWORD ? `env:${envPassword()}` : "";
}

/** Admin is enabled when ADMIN_PASSWORD is set, or a new password was created. */
export async function adminEnabled() {
  return (await secret()) !== "";
}

const adminPhone = () => (process.env.ADMIN_PHONE ?? "").replace(/[^\d+]/g, "");
const twilio = () => ({
  sid: (process.env.TWILIO_ACCOUNT_SID ?? "").trim(),
  token: (process.env.TWILIO_AUTH_TOKEN ?? "").trim(),
  from: (process.env.TWILIO_FROM ?? "").trim(),
});

const emailReady = () => resendKey().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail());
const smsReady = () => {
  const t = twilio();
  return !!(t.sid && t.token && t.from) && /^\+\d{8,15}$/.test(adminPhone());
};

/** "Forgot password" works when the code can be sent by email (Resend) or text message (Twilio). */
export function recoveryEnabled() {
  return emailReady() || smsReady();
}

/** e.g. "pt•••••@rocketmail.com and phone •••••7860", so the page says where the code goes without showing it all. */
export function maskedAdminEmail() {
  const out: string[] = [];
  const [name, domain] = adminEmail().split("@");
  if (emailReady() && name && domain) out.push(`${name.slice(0, 2)}${"•".repeat(Math.max(3, name.length - 2))}@${domain}`);
  if (smsReady()) out.push(`phone •••••${adminPhone().slice(-4)}`);
  return out.join(" and ");
}

async function sendEmail(code: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ADMIN_EMAIL_FROM?.trim() || "SpeakUp English <onboarding@resend.dev>",
      to: [adminEmail()],
      subject: `Your SpeakUp English admin code: ${code}`,
      text: `Your security code is ${code}\n\nUse it within ${CODE_MINUTES} minutes to create a new admin password.\nIf you did not ask for this, you can ignore this email. Your password has not changed.`,
      html: `<p>Your security code is</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p><p>Use it within ${CODE_MINUTES} minutes to create a new admin password.</p><p style="color:#666">If you did not ask for this, you can ignore this email. Your password has not changed.</p>`,
    }),
    cache: "no-store",
  }).catch(() => null);
  return !!res?.ok;
}

async function sendSms(code: string) {
  const t = twilio();
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(t.sid)}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${t.sid}:${t.token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: adminPhone(), From: t.from, Body: `SpeakUp English admin code: ${code} (valid ${CODE_MINUTES} min). Didn't ask? Ignore this.` }),
    cache: "no-store",
  }).catch(() => null);
  return !!res?.ok;
}

export async function checkPassword(pw: string) {
  const s = await stored();
  if (s.hash && s.salt) return same(scrypt(pw, s.salt), s.hash);
  return envPassword().length >= MIN_PASSWORD && same(sha(pw), sha(envPassword()));
}

type Result = { ok: true } | { ok: false; error: string };

/** Email a 6-digit security code to the admin's email address. */
export async function sendResetCode(): Promise<Result> {
  if (!recoveryEnabled()) return { ok: false, error: "Password reset is not set up yet. Add RESEND_API_KEY (email) or the Twilio settings (phone) in Vercel." };
  let s: AdminSecret;
  try {
    s = await stored(true);
  } catch {
    return { ok: false, error: "Database problem. Try again." };
  }
  if (s.reset && Date.now() - s.reset.sentAt < RESEND_WAIT_MS) return { ok: false, error: "A code was just sent. Please wait one minute before asking again." };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  try {
    await save({ ...s, reset: { codeHash: sha(code), expires: Date.now() + CODE_MINUTES * 60_000, tries: 0, sentAt: Date.now() } });
  } catch {
    return { ok: false, error: "Could not save the code (database problem). Connect a database in Vercel first." };
  }

  const [mailed, texted] = await Promise.all([emailReady() ? sendEmail(code) : false, smsReady() ? sendSms(code) : false]);
  if (!mailed && !texted) return { ok: false, error: "Could not send the code. Check RESEND_API_KEY / ADMIN_EMAIL (or the Twilio settings) in Vercel." };
  return { ok: true };
}

/** Create a new admin password with the emailed security code. */
export async function resetPassword(code: string, newPassword: string): Promise<Result> {
  if (!recoveryEnabled()) return { ok: false, error: "Password reset by email is not set up yet." };
  if (newPassword.length < MIN_PASSWORD) return { ok: false, error: `The new password needs at least ${MIN_PASSWORD} characters.` };
  if (newPassword.length > 200) return { ok: false, error: "That password is too long." };
  let s: AdminSecret;
  try {
    s = await stored(true);
  } catch {
    return { ok: false, error: "Database problem. Try again." };
  }
  const r = s.reset;
  if (!r || Date.now() > r.expires) return { ok: false, error: "The code has expired. Press “Send code” to get a new one." };
  if (r.tries >= MAX_TRIES) return { ok: false, error: "Too many wrong codes. Press “Send code” to get a new one." };
  if (!same(sha(code.replace(/\D/g, "")), r.codeHash)) {
    await save({ ...s, reset: { ...r, tries: r.tries + 1 } }).catch(() => {});
    return { ok: false, error: `Wrong code. ${MAX_TRIES - r.tries - 1} tries left.` };
  }
  const salt = randomBytes(16).toString("hex");
  try {
    await save({ hash: scrypt(newPassword, salt), salt, updatedAt: new Date().toISOString() }); // also removes the used code
  } catch {
    return { ok: false, error: "Could not save the new password (database problem). Try again." };
  }
  return { ok: true };
}

export async function adminCookieValue() {
  return createHmac("sha256", await secret()).update("speakup-admin-v1").digest("hex");
}

export async function isAdminToken(value: string | undefined) {
  return (await adminEnabled()) && !!value && same(value, await adminCookieValue());
}

/** For Server Components and Server Actions. */
export async function isAdmin() {
  const jar = await cookies();
  return isAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

/** For Route Handlers. */
export async function isAdminRequest(req: Request) {
  const raw = req.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return isAdminToken(m?.[1]);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not authorised");
}
