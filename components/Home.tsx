"use client";

import Link from "next/link";
import { useState } from "react";
import { chapters, units } from "@/lib/content";
import { PARTS, streak, useProgress } from "@/lib/settings";
import { Scene, photoCredit } from "./Scene";
import { LockBadge } from "./Premium";
import { NewChapters } from "./Extra";
import { FREE } from "@/lib/sessions";
import { usePhoto } from "@/lib/photos";
import { useProfile } from "@/lib/profile";
import { isHidden, useCustomContent } from "@/lib/customContent";
import { Avatar } from "./Avatar";

const SECTIONS = [
  { href: "/travel", key: "ch:at-the-gate", emoji: "✈️", title: "Travel English", text: "Airport → hotel → city", color: "from-sky-500/85 to-indigo-700/85" },
  { href: "/daily", key: "home:daily", emoji: "☕", title: "Daily Conversation", text: "30 everyday talks", color: "from-orange-500/85 to-pink-600/85" },
  { href: "/stories", key: "home:stories", emoji: "📖", title: "Stories", text: "30 short & long stories", color: "from-amber-500/85 to-orange-600/85" },
  { href: "/motivation", key: "home:motivation", emoji: "💪", title: "Motivation", text: "Speeches to inspire you", color: "from-rose-500/85 to-fuchsia-600/85" },
  { href: "/videos", key: "home:videos", emoji: "🎬", title: "Real Videos", text: "Karaoke subtitles", color: "from-red-500/85 to-rose-700/85" },
  { href: "/chat", key: "home:chat", emoji: "🤖", title: "Robot Chat", text: "AI talks + 20-min sessions", color: "from-violet-500/85 to-fuchsia-700/85" },
  { href: "/listening", key: "home:listening", emoji: "🎧", title: "Listening", text: "Dictation & tests", color: "from-sky-500/85 to-cyan-700/85" },
  { href: "/speaking", key: "home:speaking", emoji: "🎤", title: "Speaking", text: "Repeat & get a score", color: "from-orange-500/85 to-rose-600/85" },
  { href: "/twisters", key: "home:twisters", emoji: "👅", title: "Tongue Twisters", text: "112 twisters, karaoke", color: "from-fuchsia-500/85 to-pink-700/85" },
  { href: "/music", key: "home:music", emoji: "🎵", title: "Music Karaoke", text: "20 sing-along songs", color: "from-purple-500/85 to-indigo-700/85" },
  { href: "/pte", key: "home:pte", emoji: "🎓", title: "PTE Practice", text: "Tasks + 6 sessions", color: "from-emerald-500/85 to-teal-700/85" },
];

/** A section card with a real photo behind a coloured 3D glass overlay. */
function PhotoTile({ s }: { s: (typeof SECTIONS)[number] }) {
  const photo = usePhoto(s.key);
  return (
    <Link
      href={s.href}
      className="group relative overflow-hidden rounded-3xl min-h-36 sm:min-h-44 text-white shadow-[0_10px_24px_-8px_rgba(15,23,42,0.45)] hover:-translate-y-1 hover:shadow-[0_18px_34px_-10px_rgba(79,70,229,0.55)] transition"
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500" />
      )}
      <div className={`absolute inset-0 bg-linear-to-br ${s.color} ${photo ? "mix-blend-multiply" : ""}`} />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-white/10" />
      <div className="relative h-full p-4 flex flex-col justify-end">
        <span className="text-3xl drop-shadow-lg">{s.emoji}</span>
        <span className="font-black text-lg leading-tight drop-shadow">{s.title}</span>
        <span className="text-xs sm:text-sm opacity-95 drop-shadow">{s.text}</span>
      </div>
    </Link>
  );
}

function Hero({ nextUp, started, children }: { nextUp: (typeof chapters)[number]; started: boolean; children: React.ReactNode }) {
  const photo = usePhoto("home:hero");
  return (
    <section className="relative overflow-hidden rounded-4xl text-white shadow-[0_24px_50px_-18px_rgba(79,70,229,0.65)] min-h-104 flex">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-sky-500 via-indigo-600 to-fuchsia-600" />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-indigo-950/90 via-indigo-900/60 to-transparent" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-10 max-w-2xl">
        <span className="self-start rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold ring-1 ring-white/30">🌱 Beginner → 🌳 Intermediate</span>
        <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] drop-shadow-lg">
          Speak English
          <br />
          with <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">confidence</span>
        </h1>
        <p className="text-base sm:text-lg text-white/90 drop-shadow">
          Real conversations for the airport, hotel, city and sports, plus stories, music, motivation, PTE and an AI robot that talks with you.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/chapter/${nextUp.id}`} className="btn-primary text-lg px-6 py-3">
            ▶ {started ? "Continue" : "Start"}: Chapter {nextUp.chapter}
          </Link>
          <Link
            href="/daily"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md ring-1 ring-white/50 px-5 py-3 font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] hover:bg-white/30 active:translate-y-1 transition"
          >
            ☕ Today&apos;s talk
          </Link>
        </div>
        {children}
      </div>
      {photo && (
        <a
          href={photo.pageUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur"
        >
          📷 {photoCredit(photo)}
        </a>
      )}
    </section>
  );
}

export function Home() {
  const progress = useProgress();
  const custom = useCustomContent();
  const [level, setLevel] = useState<"All" | "Beginner" | "Intermediate">("All");
  const completed = chapters.filter((c) => (progress.done[c.id]?.length ?? 0) >= PARTS.length).length;
  const started = chapters.filter((c) => (progress.done[c.id]?.length ?? 0) > 0).length;
  const nextUp = chapters.find((c) => (progress.done[c.id]?.length ?? 0) < PARTS.length) ?? chapters[0];

  return (
    <div className="flex flex-col gap-8">
      <Hero nextUp={nextUp} started={started > 0}>
        <div className="grid grid-cols-3 gap-2 max-w-md">
          <Stat n={`${completed}/30`} label="Chapters done" />
          <Stat n={`${streak(progress.days)}🔥`} label="Day streak" />
          <Stat n={`${progress.minutes}`} label="Talk minutes" />
        </div>
      </Hero>

      <Welcome />

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">✨ Explore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SECTIONS.map((s) => (
            <PhotoTile key={s.href} s={s} />
          ))}
        </div>
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
        const list = chapters
          .filter((c) => !isHidden(custom, `ch:${c.id}`))
          .map((c) => custom.overrides?.[c.id] ?? c)
          .filter((c) => c.unit === u.id && (level === "All" || c.level === level));
        if (!list.length) return null;
        return (
          <section key={u.id} id={`unit-${u.id}`} className="flex flex-col gap-3 scroll-mt-20">
            <div className={`rounded-3xl bg-linear-to-r ${u.color} text-white px-5 py-3 flex items-center gap-3`}>
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
                    <Scene scene={c.scene} label={c.title} className="rounded-2xl shadow-none" photoKey={`ch:${c.id}`} />
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
                      <div className="h-full bg-linear-to-r from-sky-500 to-emerald-500" style={{ width: `${(n / PARTS.length) * 100}%` }} />
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

/** Greets the customer with their picture, or invites them to create a profile. */
function Welcome() {
  const { profile, online } = useProfile();
  if (!profile) {
    return (
      <Link href="/login" className="card flex items-center gap-4 hover:-translate-y-0.5 transition">
        <span className="text-4xl">👤</span>
        <span className="flex-1">
          <b className="text-lg">Create your profile</b>
          <br />
          <span className="text-sm opacity-70">Add your name and photo to save your learning journey.</span>
        </span>
        <span className="btn-primary">Log in →</span>
      </Link>
    );
  }
  return (
    <Link href="/login" className="card flex items-center gap-4 hover:-translate-y-0.5 transition">
      <Avatar name={profile.name} photo={profile.photo} online={online} size={56} />
      <span className="flex-1">
        <b className="text-lg">Welcome back, {profile.name.split(" ")[0]}! 👋</b>
        <br />
        <span className={`text-sm font-semibold ${online ? "text-emerald-600" : "opacity-60"}`}>
          {online ? "● Online" : "● Offline: your lessons still work"}
        </span>
      </span>
    </Link>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/25 p-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
      <div className="text-xl sm:text-2xl font-black">{n}</div>
      <div className="text-[11px] opacity-85">{label}</div>
    </div>
  );
}
