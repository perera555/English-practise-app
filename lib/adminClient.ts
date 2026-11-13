"use client";

import { useSyncExternalStore } from "react";
import { apiUrl } from "./api";
import { isNativeApp } from "./native";

/**
 * Admin sign-in from the shared /login page.
 * Only someone with the ADMIN_PASSWORD becomes admin: the server checks it and sets a secure cookie.
 * In the phone app the admin panel lives on the website, so it opens there instead.
 */
type State = { checked: boolean; enabled: boolean; admin: boolean; recovery: boolean; email: string };
let state: State = { checked: false, enabled: false, admin: false, recovery: false, email: "" };
const SERVER: State = state;
const listeners = new Set<() => void>();
const set = (s: Partial<State>) => {
  state = { ...state, ...s };
  listeners.forEach((l) => l());
};

let loading = false;
async function check() {
  if (loading || state.checked || typeof window === "undefined") return;
  loading = true;
  if (isNativeApp()) {
    // The admin cookie can't be shared with the phone app; the admin signs in on the website.
    set({ checked: true, enabled: !!process.env.NEXT_PUBLIC_API_BASE, admin: false });
    return;
  }
  try {
    const r = await fetch("/api/admin", { cache: "no-store" });
    const j = r.ok ? await r.json() : {};
    set({ checked: true, enabled: !!j.enabled, admin: !!j.admin, recovery: !!j.recovery, email: typeof j.email === "string" ? j.email : "" });
  } catch {
    set({ checked: true });
  }
}

export function useAdmin(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      void check();
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER,
  );
}

export async function adminSignIn(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error ?? "Could not sign in." };
    set({ admin: true });
    return { ok: true };
  } catch {
    return { ok: false, error: "No internet connection." };
  }
}

async function postAdmin(body: object): Promise<{ ok: true; email?: string } | { ok: false; error: string }> {
  try {
    const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    return r.ok ? { ok: true, email: j.email } : { ok: false, error: j.error ?? "Something went wrong." };
  } catch {
    return { ok: false, error: "No internet connection." };
  }
}

/** Forgot password, step 1: send a 6-digit security code to the admin's email / phone. */
export const sendAdminCode = () => postAdmin({ action: "send-code" });

/** Forgot password, step 2: create the new password with that code (signs in as admin). */
export async function resetAdminPassword(code: string, password: string) {
  const r = await postAdmin({ action: "reset", code, password });
  if (r.ok) set({ admin: true, enabled: true });
  return r;
}

export async function adminSignOut() {
  await fetch("/api/admin", { method: "DELETE" }).catch(() => {});
  set({ admin: false });
}

/** Fired by the "Admin login" footer button so the login page opens its password box (also when already on /login). */
export const OPEN_ADMIN_EVENT = "speakup-open-admin";

/** Phone app: open the admin panel on the hosted website. */
export function openWebAdmin() {
  window.open(apiUrl("/admin"), "_blank");
}
