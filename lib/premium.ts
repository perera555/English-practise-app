"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isNativeApp, nativePlatform } from "./native";
import { apiUrl } from "./api";

/**
 * Premium is a subscription.
 * - Store purchases are handled by RevenueCat (Google Play / App Store).
 * - Admin grants and gift codes are checked on our server.
 * - The expiry date is saved on the device, so paid users keep access OFFLINE
 *   until their paid period ends. After that they must go online and renew.
 */

const ID_KEY = "erp-user-id";
const CACHE_KEY = "erp-premium-v2";
const ENTITLEMENT = process.env.NEXT_PUBLIC_RC_ENTITLEMENT ?? "premium";

/** until: ISO date, "lifetime", or null (not premium) */
type Cache = { until: string | null; checkedAt: string };

type State = {
  premium: boolean;
  checked: boolean;
  userId: string;
  until: string | null;
  /** True when a subscription existed but has now ended. */
  expired: boolean;
};

let state: State = { premium: false, checked: false, userId: "", until: null, expired: false };
const listeners = new Set<() => void>();

function activeFrom(until: string | null) {
  return until === "lifetime" || (!!until && new Date(until).getTime() > Date.now());
}

function apply(until: string | null, checked: boolean) {
  const premium = activeFrom(until);
  state = { ...state, until, premium, checked, expired: !!until && !premium };
  try {
    const c: Cache = { until, checkedAt: new Date().toISOString() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : null;
  } catch {
    return null;
  }
}

/** Anonymous ID for this device, shown on the Premium page so the admin can upgrade it. */
export function getUserId() {
  if (state.userId) return state.userId;
  let id = "";
  try {
    id = localStorage.getItem(ID_KEY) ?? "";
    if (!id) {
      id = "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);
      localStorage.setItem(ID_KEY, id);
    }
  } catch {
    id = "u_guest" + Math.random().toString(36).slice(2, 12);
  }
  state = { ...state, userId: id };
  return id;
}

let rcReady: Promise<boolean> | null = null;

async function revenueCat() {
  if (!isNativeApp()) return null;
  const key = nativePlatform() === "ios" ? process.env.NEXT_PUBLIC_RC_IOS_KEY : process.env.NEXT_PUBLIC_RC_ANDROID_KEY;
  if (!key) return null;
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  rcReady ??= Purchases.configure({ apiKey: key, appUserID: getUserId() }).then(
    () => true,
    () => false,
  );
  return (await rcReady) ? Purchases : null;
}

type RcInfo = { entitlements: { active: Record<string, { expirationDate?: string | null }> } };

/** Expiry from RevenueCat: ISO date, "lifetime", or null. */
function untilFrom(info: RcInfo): string | null {
  const e = info.entitlements.active[ENTITLEMENT];
  if (!e) return null;
  return e.expirationDate ?? "lifetime";
}

/** Latest of two expiry values. */
function later(a: string | null, b: string | null) {
  if (a === "lifetime" || b === "lifetime") return "lifetime";
  if (!a) return b;
  if (!b) return a;
  return new Date(a) > new Date(b) ? a : b;
}

export async function refreshPremium() {
  const userId = getUserId();
  let until: string | null = null;
  let reached = false;

  try {
    const rc = await revenueCat();
    if (rc) {
      until = untilFrom((await rc.getCustomerInfo()).customerInfo as RcInfo);
      reached = true;
    }
  } catch {
    /* offline */
  }
  try {
    const res = await fetch(apiUrl("/api/premium"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const j = (await res.json()) as { premium?: boolean; until?: string | null };
    if (res.ok) {
      until = later(until, j.premium ? (j.until ?? "lifetime") : null);
      reached = true;
    }
  } catch {
    /* offline */
  }

  if (!reached) {
    // Offline: trust the saved expiry date.
    apply(readCache()?.until ?? null, true);
  } else {
    apply(until, true);
  }
  return state.premium;
}

/** Subscribe through Google Play / the App Store. */
export async function buyPremium(): Promise<{ ok: boolean; message?: string }> {
  const rc = await revenueCat();
  if (!rc) return { ok: false, message: "Subscriptions are available in the Android and iPhone app." };
  try {
    const offerings = await rc.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) return { ok: false, message: "No subscription is set up yet. Please try again later." };
    const { customerInfo } = await rc.purchasePackage({ aPackage: pkg });
    apply(untilFrom(customerInfo as RcInfo), true);
    return { ok: state.premium };
  } catch (e) {
    const cancelled = typeof e === "object" && e !== null && "userCancelled" in e && (e as { userCancelled?: boolean }).userCancelled;
    return { ok: false, message: cancelled ? undefined : "The purchase did not complete." };
  }
}

export async function restorePurchases() {
  const rc = await revenueCat();
  if (rc) {
    try {
      const { customerInfo } = await rc.restorePurchases();
      const until = untilFrom(customerInfo as RcInfo);
      if (activeFrom(until)) {
        apply(until, true);
        return true;
      }
    } catch {
      /* fall through */
    }
  }
  return refreshPremium();
}

export async function redeemCode(code: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(apiUrl("/api/premium"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: getUserId(), code }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.premium) {
      apply(later(state.until, j.until ?? "lifetime"), true);
      return { ok: true };
    }
    return { ok: false, message: j.error ?? "Could not redeem the code." };
  } catch {
    return { ok: false, message: "You need internet to redeem a code." };
  }
}

let started = false;
const SERVER: State = { premium: false, checked: false, userId: "", until: null, expired: false };

export function usePremium() {
  const s = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER,
  );
  useEffect(() => {
    if (started) return;
    started = true;
    const cached = readCache();
    if (cached) apply(cached.until, false);
    getUserId();
    void refreshPremium();
    // Re-check when the app comes back online or to the front.
    const again = () => void refreshPremium();
    window.addEventListener("online", again);
    document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && again());
  }, []);
  return s;
}
