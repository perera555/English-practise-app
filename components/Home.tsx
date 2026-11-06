"use client";

import Link from "next/link";
import { useState } from "react";
import { chapters, units } from "@/lib/content";
import { PARTS, streak, useProgress } from "@/lib/settings";
import { Scene } from "./Scene";
import { LockBadge } from "./Premium";
import { NewChapters } from "./Extra";
import { FREE } from "@/lib/sessions";

const SECTIONS = [
  { href: "/listening", emoji: "🎧", title: "Listening", text: "Dictation & listening tests", color: "from-sky-500 to-cyan-500" },
  { href: "/speaking", emoji: "🎤", title: "Speaking", text: "Repeat, score, tongue twisters", color: "from-rose-500 to-orange-500" },
  { href: "/chat", emoji: "🤖", title: "Robot Chat", text: "Live AI conversation + 20-min sessions", color: "from-violet-500 to-fuchsia-500" },
  { href: "/twisters", emoji: "👅", title: "Tongue Twisters", text: "100+ twisters, karaoke style", color: "from-fuchsia-500 to-pink-600" },
  { href: "/music", emoji: "🎵", title: "Music Karaoke", text: "8 sing-along songs", color: "from-pink-500 to-purple-500" },
  { href: "/pte", emoji: "🎓", title: "PTE Practice", text: "Read aloud, repeat, describe image…", color: "from-emerald-500 to-teal-500" },
];

export function Home() {
  const progress = useProgress();
  const [level, setLevel] = useState<"All" | "Beginner" | "Intermediate">("All");
  const completed = chapters.filter((c) => (progress.done[c.id]?.length ?? 0) >= PARTS.length).length;
  const started = chapters.filter((c) => (progress.done[c.id]?.length ?? 0) > 0).length;
  const nextUp = chapters.find((c) => (progress.done[c.id]?.length ?? 0) < PARTS.length) ?? chapters[0];

  return (
    <div className="flex flex-col gap-8">
      <section className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Speak English with <span className="bg-gradient-to-r from-sky-500 to-fuchsia-500 bg-clip-text text-transparent">confidence</span> 🚀
          </h1>
          <p className="text-lg opacity-80">
            30 chapters from <b>Beginner</b> to <b>Intermediate</b>: airport, hotel, city life and sports commentary. Every chapter has pictures, karaoke subtitles,
            listening, speaking and a 20-minute robot conversation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/chapter/${nextUp.id}`} className="btn-primary text-lg px-5 py-3">
              ▶ {started ? "Continue" : "Start"}: Chapter {nextUp.chapter}
            </Link>
            <Link href="/chat" className="btn-ghost text-base px-5 py-3">
              🤖 Talk to the robot
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <Stat n={`${completed}/30`} label="Chapters done" />
            <Stat n={`${streak(progress.days)}🔥`} label="Day streak" />
            <Stat n={`${progress.minutes}`} label="Talk minutes" />
          </div>
        </div>
        <Scene scene={chapters[1].scene} label="Airport check-in illustration" />
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className={`rounded-3xl p-4 text-white bg-gradient-to-br ${s.color} shadow-md hover:-translate-y-1 transition`}>
            <div className="text-3xl">{s.emoji}</div>
            <div className="font-bold text-lg">{s.title}</div>
            <div className="text-sm opacity-90">{s.text}</div>
          </Link>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-extrabold mr-auto">📚 30 Chapters</h2>
        {(["All", "Beginner", "Intermediate"] as const).map((l) => (
          <button key={l} className={level === l ? "btn-primary" : "btn-ghost"} onClick={() => setLevel(l)}>
            {l === "Beginner" ? "🌱 " : l === "Intermediate" ? "🌳 " : ""}
            {l}
          </button>
        ))}
      </div>

      <NewChapters />

      {units.map((u) => {
        const list = chapters.filter((c) => c.unit === u.id && (level === "All" || c.level === level));
        if (!list.length) return null;
        return (
          <section key={u.id} id={`unit-${u.id}`} className="flex flex-col gap-3 scroll-mt-20">
            <div className={`rounded-3xl bg-gradient-to-r ${u.color} text-white px-5 py-3 flex items-center gap-3`}>
              <span className="text-3xl">{u.emoji}</span>
              <div>
                <h3 className="font-extrabold text-xl">{u.title}</h3>
                <p className="text-sm opacity-90">{u.blurb}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((c) => {
                const n = progress.done[c.id]?.length ?? 0;
                return (
                  <Link key={c.id} href={`/chapter/${c.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-lg transition">
                    <Scene scene={c.scene} label={c.title} className="rounded-2xl shadow-none" />
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold opacity-60">
                          Chapter {c.chapter} · {c.level}
                        </div>
                        <div className="font-bold">{c.title}</div>
                        <div className="text-sm opacity-70">{c.subtitle}</div>
                      </div>
                      {n >= PARTS.length && <span title="Completed">🏆</span>}
                      <LockBadge free={c.chapter <= FREE.chapters} />
                    </div>
                    <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500" style={{ width: `${(n / PARTS.length) * 100}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-2xl font-black">{n}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}
