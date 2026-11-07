"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { speak, useVoices } from "@/lib/speech";
import { updateSettings, useSettings } from "@/lib/settings";
import { useProfile } from "@/lib/profile";
import { Avatar } from "./Avatar";

const LINKS = [
  { href: "/", label: "Chapters", emoji: "📚" },
  { href: "/quiz", label: "Quiz", emoji: "🧠" },
  { href: "/dictionary", label: "Dictionary", emoji: "📖" },
  { href: "/native", label: "Native English", emoji: "🎓" },
  { href: "/travel", label: "Travel", emoji: "✈️" },
  { href: "/daily", label: "Daily Talk", emoji: "☕" },
  { href: "/videos", label: "Videos", emoji: "🎬" },
  { href: "/stories", label: "Stories", emoji: "📚" },
  { href: "/motivation", label: "Motivation", emoji: "💪" },
  { href: "/listening", label: "Listening", emoji: "🎧" },
  { href: "/speaking", label: "Speaking", emoji: "🎤" },
  { href: "/chat", label: "Robot Chat", emoji: "🤖" },
  { href: "/twisters", label: "Twisters", emoji: "👅" },
  { href: "/music", label: "Music", emoji: "🎵" },
  { href: "/pte", label: "PTE", emoji: "🎓" },
  { href: "/premium", label: "Premium", emoji: "⭐" },
  { href: "/help", label: "Guide", emoji: "❓" },
];

const ACCENTS = [
  { id: "en-GB", label: "🇬🇧 British" },
  { id: "en-US", label: "🇺🇸 American" },
  { id: "en-AU", label: "🇦🇺 Australian" },
  { id: "en-IN", label: "🇮🇳 Indian" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const s = useSettings();
  const voices = useVoices();
  const accentVoices = voices.filter((v) => v.lang.replace("_", "-") === s.accent);

  return (
    <>
    <header className="app-top sticky top-0 z-30 backdrop-blur-md bg-(--background)/80 border-b border-black/5 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-3">
        <BackForward />
        <Link href="/" className="font-black text-base sm:text-lg flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={34} height={34} className="rounded-xl shadow-md shrink-0" />
          <span className="hidden min-[400px]:inline truncate bg-linear-to-r from-sky-500 to-fuchsia-500 bg-clip-text text-transparent">SpeakUp English</span>
        </Link>
        <span className="flex-1 md:hidden" />
        <Link href="/premium" className="md:hidden shrink-0 rounded-full bg-linear-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 shadow">
          ⭐ Premium
        </Link>
        <nav className="hidden md:flex gap-1 overflow-x-auto flex-1 no-scrollbar">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" || path.startsWith("/chapter") : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active ? "bg-sky-500 text-white" : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {l.emoji} <span className="hidden md:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <ProfileButton />
        <button className="rounded-full h-9 w-9 grid place-items-center hover:bg-black/5 dark:hover:bg-white/10 shrink-0" onClick={() => setOpen((o) => !o)} aria-label="Settings">
          ⚙️
        </button>
      </div>
      {open && (
        <div className="absolute right-4 top-14 w-[min(22rem,calc(100vw-2rem))] card shadow-2xl flex flex-col gap-3 z-40">
          <h3 className="font-bold">Settings</h3>
          <div>
            <p className="text-sm font-semibold mb-1">My level</p>
            <div className="flex flex-wrap gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((lv) => (
                <button key={lv} className={s.level === lv ? "btn-primary" : "btn-ghost"} onClick={() => updateSettings({ level: lv })}>
                  {lv === "Beginner" ? "🌱" : lv === "Intermediate" ? "🌳" : "🎓"} {lv}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Accent</p>
            <div className="grid grid-cols-2 gap-2">
              {ACCENTS.map((a) => (
                <button key={a.id} className={s.accent === a.id ? "btn-primary" : "btn-ghost"} onClick={() => updateSettings({ accent: a.id, voiceURI: "" })}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <label className="text-sm flex flex-col gap-1">
            <span className="font-semibold">Voice</span>
            <select
              value={s.voiceURI}
              onChange={(e) => updateSettings({ voiceURI: e.target.value })}
              className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-2 py-1.5"
            >
              <option value="">Automatic</option>
              {(accentVoices.length ? accentVoices : voices).map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm flex flex-col gap-1">
            <span className="font-semibold">Speaking speed: {s.rate.toFixed(2)}×</span>
            <input type="range" min={0.6} max={1.4} step={0.05} value={s.rate} onChange={(e) => updateSettings({ rate: +e.target.value })} />
          </label>
          <button className="btn-ghost" onClick={() => speak("Hello! This is how I sound. Let's practise English together.")}>
            🔊 Test voice
          </button>
        </div>
      )}
    </header>
    <BottomTabs path={path} />
    </>
  );
}

/* ---------------- Back / forward buttons (like a browser, also inside the phone app) ---------------- */

// The app keeps its own list of visited pages, so the buttons know when back / forward is possible
// (and still work when a page was opened directly from a link, where the browser has no history).
const hist = { entries: [] as string[], idx: -1, pending: 0 as -1 | 0 | 1, popped: false };

function BackForward() {
  const router = useRouter();
  const path = usePathname();
  const [, force] = useState(0);

  useEffect(() => {
    const onPop = () => {
      hist.popped = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const h = hist;
    if (h.entries[h.idx] !== path) {
      if (h.pending && h.entries[h.idx + h.pending] === path) h.idx += h.pending;
      else if (h.popped && h.entries[h.idx - 1] === path) h.idx -= 1;
      else if (h.popped && h.entries[h.idx + 1] === path) h.idx += 1;
      else {
        h.entries = [...h.entries.slice(0, h.idx + 1), path];
        h.idx = h.entries.length - 1;
      }
    }
    h.pending = 0;
    h.popped = false;
    force((n) => n + 1);
  }, [path]);

  const canBack = hist.idx > 0 || path !== "/";
  const canForward = hist.idx >= 0 && hist.idx < hist.entries.length - 1;

  const back = () => {
    if (hist.idx > 0) {
      hist.pending = -1;
      window.history.back();
    } else if (path !== "/") {
      // Opened straight on this page: go up one level (e.g. /quiz/abc → /quiz), or home.
      const up = path.replace(/\/$/, "").split("/").slice(0, -1).join("/") || "/";
      router.push(up);
    }
  };
  const forward = () => {
    if (!canForward) return;
    hist.pending = 1;
    window.history.forward();
  };

  const btn =
    "grid place-items-center h-9 w-9 shrink-0 rounded-full bg-white/80 dark:bg-white/10 shadow-[0_3px_0_rgba(0,0,0,0.15)] active:translate-y-0.5 hover:bg-white dark:hover:bg-white/20 text-2xl leading-none font-black disabled:opacity-30 disabled:pointer-events-none";
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button type="button" className={btn} onClick={back} disabled={!canBack} aria-label="Back" title="Back">
        ‹
      </button>
      <button type="button" className={btn} onClick={forward} disabled={!canForward} aria-label="Forward" title="Forward">
        ›
      </button>
    </div>
  );
}

/* ---------------- Profile picture with online / offline dot ---------------- */

function ProfileButton() {
  const { profile, online } = useProfile();
  if (!profile) {
    return (
      <Link href="/login" className="shrink-0 rounded-full bg-sky-500 text-white text-xs font-bold px-3 py-1.5 shadow">
        👤 Log in
      </Link>
    );
  }
  return (
    <Link href="/login" className="shrink-0" title={`${profile.name} · ${online ? "Online" : "Offline"}`}>
      <Avatar name={profile.name} photo={profile.photo} online={online} size={34} />
    </Link>
  );
}

/* ---------------- Phone-style bottom tab bar ---------------- */

const TABS = [
  { href: "/", label: "Learn", emoji: "📚", match: (p: string) => p === "/" || p.startsWith("/chapter") },
  { href: "/daily", label: "Daily", emoji: "☕", match: (p: string) => p.startsWith("/daily") },
  { href: "/chat", label: "Robot", emoji: "🤖", match: (p: string) => p.startsWith("/chat") },
  { href: "/videos", label: "Videos", emoji: "🎬", match: (p: string) => p.startsWith("/videos") || p.startsWith("/extra") },
];

const MORE = LINKS.filter((l) => !TABS.some((t) => t.href === l.href) && l.href !== "/");

function BottomTabs({ path }: { path: string }) {
  const [more, setMore] = useState(false);
  const moreActive = MORE.some((l) => path.startsWith(l.href));
  return (
    <>
      {more && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMore(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-background p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] grid grid-cols-3 gap-3 animate-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="col-span-3 mx-auto h-1.5 w-12 rounded-full bg-black/15 dark:bg-white/20 mb-1" />
            {MORE.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMore(false)}
                className={`card p-3 flex flex-col items-center gap-1 text-center ${path.startsWith(l.href) ? "ring-2 ring-sky-400" : ""}`}
              >
                <span className="text-3xl">{l.emoji}</span>
                <span className="text-xs font-semibold">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="app-tabs md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-black/5 dark:border-white/10 bg-(--background)/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {TABS.map((t) => {
            const active = t.match(path);
            return (
              <Link key={t.href} href={t.href} onClick={() => setMore(false)} className="flex flex-col items-center justify-center gap-0.5">
                <span className={`text-2xl transition-transform ${active ? "scale-115 -translate-y-0.5" : "opacity-70"}`}>{t.emoji}</span>
                <span className={`text-[11px] font-semibold ${active ? "text-sky-500" : "opacity-60"}`}>{t.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setMore((m) => !m)} className="flex flex-col items-center justify-center gap-0.5">
            <span className={`text-2xl ${more || moreActive ? "" : "opacity-70"}`}>☰</span>
            <span className={`text-[11px] font-semibold ${more || moreActive ? "text-sky-500" : "opacity-60"}`}>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
