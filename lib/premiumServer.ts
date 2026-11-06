import "server-only";
import { dbGet } from "./db";

export const ENTITLEMENT = process.env.REVENUECAT_ENTITLEMENT ?? "premium";

export function validUserId(id: unknown): id is string {
  return typeof id === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(id);
}

const active = (until: string | null) => until === "lifetime" || (!!until && new Date(until).getTime() > Date.now());

/**
 * When Premium ends for this user: an ISO date, "lifetime", or null (no Premium).
 * Combines admin grants / gift codes with the store subscription in RevenueCat.
 */
export async function premiumUntil(userId: unknown): Promise<string | null> {
  if (!validUserId(userId)) return null;
  let best: string | null = null;
  const consider = (u: string | null) => {
    if (!active(u)) return;
    if (best === "lifetime" || u === "lifetime") best = "lifetime";
    else if (!best || new Date(u!) > new Date(best)) best = u;
  };

  const grants = await dbGet("grants");
  const g = grants[userId];
  if (g) consider(g.until ?? "lifetime");

  const secret = process.env.REVENUECAT_SECRET_KEY;
  if (secret) {
    try {
      const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          subscriber?: { entitlements?: Record<string, { expires_date: string | null }> };
        };
        const e = data.subscriber?.entitlements?.[ENTITLEMENT];
        if (e) consider(e.expires_date ?? "lifetime");
      }
    } catch {
      /* RevenueCat unreachable: rely on grants */
    }
  }
  return best;
}

export async function isPremiumUser(userId: unknown) {
  return active(await premiumUntil(userId));
}
