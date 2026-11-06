"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { speak, useVoices } from "@/lib/speech";
import { updateSettings, useSettings } from "@/lib/settings";

const LINKS = [
  { href: "/", label: "Chapters", emoji: "📚" },
  { href: "/listening", label: "Listening", emoji: "🎧" },
  { href: "/speaking", label: "Speaking", emoji: "🎤" },
  { href: "/chat", label: "Robot Chat", emoji: "🤖" },
  { href: "/music", label: "Music", emoji: "🎵" },
  { href: "/pte", label: "PTE", emoji: "🎓" },
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
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--background)]/80 border-b border-black/5 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
        <Link href="/" className="font-black text-lg flex items-center gap-1.5 shrink-0">
          <span className="text-2xl">🗣️</span>
          <span className="hidden sm:inline bg-gradient-to-r from-sky-500 to-fuchsia-500 bg-clip-text text-transparent">SpeakUp English</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto flex-1 no-scrollbar">
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
        <button className="rounded-full h-9 w-9 grid place-items-center hover:bg-black/5 dark:hover:bg-white/10 shrink-0" onClick={() => setOpen((o) => !o)} aria-label="Settings">
          ⚙️
        </button>
      </div>
      {open && (
        <div className="absolute right-4 top-14 w-[min(22rem,calc(100vw-2rem))] card shadow-2xl flex flex-col gap-3 z-40">
          <h3 className="font-bold">Settings</h3>
          <div>
            <p className="text-sm font-semibold mb-1">My level</p>
            <div className="flex gap-2">
              {(["Beginner", "Intermediate"] as const).map((lv) => (
                <button key={lv} className={s.level === lv ? "btn-primary" : "btn-ghost"} onClick={() => updateSettings({ level: lv })}>
                  {lv === "Beginner" ? "🌱" : "🌳"} {lv}
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
  );
}
