"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { buyPremium, getUserId, redeemCode, restorePurchases, usePremium } from "@/lib/premium";
import { isNativeApp } from "@/lib/native";

const FEATURES = [
  "All 30 chapters (airport, hotel, city, sports commentary)",
  "Smart AI robot conversation partner + 20-minute sessions",
  "All listening, speaking, PTE and tongue twister sessions",
  "All karaoke songs",
  "New chapters added by our team",
];

/** Shows children if free or the user has Premium; otherwise a lock screen. */
export function Gate({ free, what, children }: { free: boolean; what: string; children: ReactNode }) {
  const { premium } = usePremium();
  if (free || premium) return <>{children}</>;
  return (
    <div className="card flex flex-col items-center text-center gap-4 py-12">
      <div className="text-6xl">🔒⭐</div>
      <h2 className="text-2xl font-extrabold">{what} is a Premium feature</h2>
      <p className="max-w-md opacity-80">Subscribe to Premium to unlock everything in SpeakUp English, also offline.</p>
      <Link href="/premium" className="btn-primary text-lg px-6 py-3">
        ⭐ See Premium
      </Link>
    </div>
  );
}

export function LockBadge({ free }: { free: boolean }) {
  const { premium } = usePremium();
  if (free || premium) return null;
  return (
    <span className="rounded-full bg-amber-400 text-black text-[11px] font-bold px-2 py-0.5" title="Premium">
      🔒 Premium
    </span>
  );
}

export function PremiumPage() {
  const { premium, checked, until, expired } = usePremium();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [native, setNative] = useState(false);
  const [uid, setUid] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNative(isNativeApp());
    setUid(getUserId());
  }, []);
  const playUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL;
  const appleUrl = process.env.NEXT_PUBLIC_APP_STORE_URL;

  async function run(fn: () => Promise<{ ok: boolean; message?: string } | boolean>, okMsg: string) {
    setBusy(true);
    setMsg("");
    const r = await fn();
    const ok = typeof r === "boolean" ? r : r.ok;
    setMsg(ok ? okMsg : (typeof r === "object" && r.message) || "Nothing to restore.");
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-fuchsia-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="text-5xl">⭐</div>
        <h1 className="text-3xl sm:text-4xl font-black mt-2">SpeakUp Premium</h1>
        <p className="opacity-90 mt-1">Everything you need to speak English with confidence.</p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {FEATURES.map((f) => (
            <li key={f}>✅ {f}</li>
          ))}
        </ul>
      </div>

      {premium ? (
        <div className="card text-center py-8">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold">You have Premium!</h2>
          <p className="opacity-70">
            Everything is unlocked, also offline.{" "}
            {until && until !== "lifetime" && <>Your subscription is active until <b>{new Date(until).toLocaleDateString()}</b> and renews automatically.</>}
          </p>
        </div>
      ) : (
        <div className="card flex flex-col gap-3">
          {expired && until && (
            <p className="rounded-xl bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200 px-3 py-2 text-sm">
              ⏰ Your Premium subscription ended on <b>{new Date(until).toLocaleDateString()}</b>. Renew to unlock everything again.
            </p>
          )}
          {native ? (
            <>
              <button className="btn-primary text-lg py-3" disabled={busy} onClick={() => run(buyPremium, "Welcome to Premium! 🎉")}>
                {busy ? "Please wait…" : expired ? "🔁 Renew Premium" : "⭐ Subscribe to Premium"}
              </button>
              <p className="text-xs opacity-70 text-center">
                Payment is handled securely by {/iPhone|iPad/.test(navigator.userAgent) ? "the App Store" : "Google Play"}. The subscription renews automatically
                until you cancel it in your store account settings.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">Get Premium in our mobile app:</p>
              <div className="flex flex-wrap gap-2">
                {playUrl ? (
                  <a className="btn-primary" href={playUrl} target="_blank" rel="noreferrer">
                    ▶ Google Play
                  </a>
                ) : (
                  <span className="btn-ghost opacity-60">▶ Google Play (coming soon)</span>
                )}
                {appleUrl ? (
                  <a className="btn-primary" href={appleUrl} target="_blank" rel="noreferrer">
                    🍎 App Store
                  </a>
                ) : (
                  <span className="btn-ghost opacity-60">🍎 App Store (coming soon)</span>
                )}
              </div>
            </>
          )}
          <button className="btn-ghost" disabled={busy} onClick={() => run(restorePurchases, "Purchases restored ✅")}>
            🔄 Restore purchases
          </button>
          {!checked && <p className="text-xs opacity-60">Checking your account…</p>}
        </div>
      )}

      <div className="card flex flex-col gap-2">
        <h3 className="font-bold">🎁 Have a gift code?</h3>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD-1234"
            className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 font-mono uppercase"
          />
          <button className="btn-primary" disabled={busy || !code.trim()} onClick={() => run(() => redeemCode(code), "Code redeemed! Premium unlocked 🎉")}>
            Redeem
          </button>
        </div>
      </div>

      {msg && <p className="text-center font-semibold">{msg}</p>}

      <div className="text-xs opacity-60 text-center">
        Your user ID: <code className="select-all">{uid}</code> (send this to support if you need help)
      </div>
    </div>
  );
}
