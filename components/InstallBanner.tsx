"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/native";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const HIDE_KEY = "erp-install-hidden"; // ms until the banner may show again

type Kind = "prompt" | "ios" | "mac-safari" | "firefox" | "other";

function detect(): Kind {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  const safari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
  if (safari && /Macintosh/.test(ua)) return "mac-safari";
  if (/Firefox/.test(ua)) return "firefox";
  return "other";
}

/** "Install the app" bar at the very top of every page (hidden when already installed). */
export function InstallBanner() {
  const [evt, setEvt] = useState<PromptEvent | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (isNativeApp()) return;
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const installed = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    let hiddenUntil = 0;
    try {
      hiddenUntil = Number(localStorage.getItem(HIDE_KEY) ?? 0);
    } catch {
      /* ignore */
    }
    if (installed || hiddenUntil > Date.now()) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as PromptEvent);
      setKind("prompt");
    };
    const onInstalled = () => setKind(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Browsers without an install prompt get instructions instead.
    const t = setTimeout(() => setKind((k) => k ?? detect()), 2500);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!kind) return null;

  const hide = () => {
    try {
      localStorage.setItem(HIDE_KEY, String(Date.now() + 7 * 86400000));
    } catch {
      /* ignore */
    }
    setKind(null);
  };

  const steps: Record<Exclude<Kind, "prompt">, string> = {
    ios: "Tap the Share button (□↑) at the bottom of Safari, then “Add to Home Screen”.",
    "mac-safari": "In Safari's menu bar choose File → Add to Dock. (Or open this site in Chrome or Edge and press Install.)",
    firefox: "Firefox can't install apps. Open this site in Chrome or Microsoft Edge, then press the Install button in the address bar.",
    other: "Open the browser menu (⋮ or …) and choose “Install SpeakUp English” or “Add to Home screen”.",
  };

  return (
    <div className="relative z-50 bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white text-sm">
      <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-lg">💻📱</span>
        <p className="flex-1 min-w-48 font-semibold">
          Install SpeakUp English on your computer or phone: Windows, Mac, Linux, Android, iPhone. Works offline.
        </p>
        {kind === "prompt" ? (
          <button
            className="rounded-xl bg-white text-indigo-700 font-black px-4 py-1.5 shadow-[0_3px_0_rgba(0,0,0,0.25)] active:translate-y-0.5"
            onClick={async () => {
              if (!evt) return;
              await evt.prompt();
              const { outcome } = await evt.userChoice;
              if (outcome === "accepted") setKind(null);
              setEvt(null);
            }}
          >
            ⬇️ Install app
          </button>
        ) : (
          <button className="rounded-xl bg-white text-indigo-700 font-black px-4 py-1.5 shadow-[0_3px_0_rgba(0,0,0,0.25)]" onClick={() => setHelp((h) => !h)}>
            ⬇️ How to install
          </button>
        )}
        <button className="opacity-80 hover:opacity-100 px-1" aria-label="Close" onClick={hide}>
          ✕
        </button>
        {help && kind !== "prompt" && <p className="basis-full rounded-xl bg-white/15 px-3 py-2">👉 {steps[kind]}</p>}
      </div>
    </div>
  );
}
