"use client";

import { useUrlTab } from "@/lib/useUrlTab";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dailyTalks, FREE_DAILY, type DailyTalk } from "@/lib/daily";
import { markDone, useProgress } from "@/lib/settings";
import { speak } from "@/lib/speech";
import { Karaoke } from "./Karaoke";
import { Scene } from "./Scene";
import { ChatBox } from "./ChatBox";
import { MicWarning, RepeatLine } from "./Practice";
import { LockBadge } from "./Premium";
import { isHidden, useCustomContent } from "@/lib/customContent";
import { RemovedNotice } from "./HideIf";

export function DailyHub() {
  const progress = useProgress();
  const [today, setToday] = useState<DailyTalk | null>(null);
  const [level, setLevel] = useState<"All" | "Beginner" | "Intermediate">("All");

  useEffect(() => {
    // Pick the conversation of the day on the device (changes every day).
    const d = new Date();
    const day = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    setToday(dailyTalks[day % dailyTalks.length]); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const custom = useCustomContent();
  const list = dailyTalks.filter((t) => !isHidden(custom, `daily:${t.id}`) && (level === "All" || t.level === level));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">☕ Daily Conversation</h1>
        <p className="opacity-70">30 everyday conversations. Listen with karaoke subtitles, learn the key phrases, role-play, then talk with the robot.</p>
      </header>

      {today && (
        <Link
          href={`/daily/${today.id}`}
          className="rounded-3xl bg-linear-to-r from-orange-400 to-pink-500 text-white p-5 grid sm:grid-cols-[1fr_14rem] gap-4 items-center hover:-translate-y-0.5 transition shadow-lg"
        >
          <div>
            <p className="text-sm font-semibold opacity-90">⭐ Today&apos;s conversation</p>
            <h2 className="text-2xl font-black">
              {today.emoji} {today.title}
            </h2>
            <p className="opacity-90">“{today.lines[0].text}”</p>
            <span className="inline-block mt-3 rounded-xl bg-white text-pink-600 font-bold px-4 py-2">▶ Start today&apos;s talk</span>
          </div>
          <Scene scene={today.scene} label={today.title} className="shadow-none" photoKey={`daily:${today.id}`} />
        </Link>
      )}

      <div className="flex flex-wrap gap-2">
        {(["All", "Beginner", "Intermediate"] as const).map((l) => (
          <button key={l} className={level === l ? "btn-primary" : "btn-ghost"} onClick={() => setLevel(l)}>
            {l === "Beginner" ? "🌱 " : l === "Intermediate" ? "🌳 " : ""}
            {l}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((t) => {
          const done = (progress.done[`daily-${t.id}`]?.length ?? 0) > 0;
          return (
            <Link key={t.id} href={`/daily/${t.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 transition">
              <Scene scene={t.scene} label={t.title} className="rounded-2xl shadow-none" photoKey={`daily:${t.id}`} />
              <div className="flex items-start gap-2">
                <span className="text-2xl">{t.emoji}</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold opacity-60">
                    Talk {t.n} · {t.level}
                  </div>
                  <div className="font-bold">{t.title}</div>
                </div>
                {done && <span title="Practised">✅</span>}
                <LockBadge free={t.n <= FREE_DAILY} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const TABS = [
  { id: "listen", label: "Listen & Read", emoji: "🎧" },
  { id: "phrases", label: "Key phrases", emoji: "💡" },
  { id: "roleplay", label: "Role-play", emoji: "🎭" },
  { id: "talk", label: "Talk to robot", emoji: "🤖" },
] as const;

export function DailyView({ talk }: { talk: DailyTalk }) {
  const custom = useCustomContent();
  if (isHidden(custom, `daily:${talk.id}`)) return <RemovedNotice />;
  return <DailyViewInner talk={talk} />;
}

function DailyViewInner({ talk }: { talk: DailyTalk }) {
  const [tab, setTab] = useUrlTab<(typeof TABS)[number]["id"]>("listen");
  const [mins, setMins] = useState(0);
  const i = dailyTalks.findIndex((x) => x.id === talk.id);
  const prev = dailyTalks[i - 1];
  const next = dailyTalks[i + 1];
  const mark = (part: string) => markDone(`daily-${talk.id}`, part);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/daily" className="text-sm opacity-60 hover:opacity-100">
        ← All daily conversations
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{talk.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-orange-500">Daily talk {talk.n} of 30 · {talk.level}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{talk.title}</h1>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t, k) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 ${tab === t.id ? "btn-primary" : "btn-ghost"}`}>
            <span className="opacity-60 text-xs">{k + 1}</span> {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      {tab === "listen" && (
        <section className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
          <Scene scene={talk.scene} label={talk.title} photoKey={`daily:${talk.id}`} />
          <div className="card">
            <p className="text-sm opacity-70 mb-3">Press Play. Words light up as they are spoken. Tap a line to hear it again.</p>
            <Karaoke lines={talk.lines} learnerRole={talk.learnerRole} allowRolePlay={false} onFinish={() => mark("listen")} />
          </div>
        </section>
      )}

      {tab === "phrases" && (
        <section className="flex flex-col gap-3">
          <MicWarning />
          {talk.phrases.map((p) => (
            <div key={p.phrase} className="card flex flex-col gap-2">
              <button className="text-left" onClick={() => speak(p.phrase)}>
                <span className="text-xl font-bold">🔊 {p.phrase}</span>
                <span className="block text-sm opacity-70">{p.meaning}</span>
              </button>
              <RepeatLine text={p.phrase} onScore={(s) => s >= 60 && mark("phrases")} />
            </div>
          ))}
        </section>
      )}

      {tab === "roleplay" && (
        <section className="card flex flex-col gap-3">
          <MicWarning />
          <p className="text-sm opacity-70">
            You are <b>{talk.learnerRole}</b>. Press Play. The robot says the other lines and waits for you to speak yours.
          </p>
          <Karaoke lines={talk.lines} learnerRole={talk.learnerRole} startRolePlay onTurn={(s) => s >= 60 && mark("roleplay")} />
        </section>
      )}

      {tab === "talk" && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {[0, 10, 20].map((m) => (
              <button key={m} className={mins === m ? "btn-primary" : "btn-ghost"} onClick={() => setMins(m)}>
                {m === 0 ? "💬 Quick chat" : `⏱️ ${m}-minute session`}
              </button>
            ))}
          </div>
          <ChatBox
            key={mins}
            robot={talk.robot}
            opener={talk.opener}
            topic={talk.title}
            vocab={talk.phrases.map((p) => ({ word: p.phrase, emoji: "💬", meaning: p.meaning }))}
            questions={[talk.opener]}
            sessionMinutes={mins}
            onSessionEnd={() => mark("talk")}
          />
        </section>
      )}

      <footer className="flex justify-between gap-3 pt-2">
        {prev ? (
          <Link href={`/daily/${prev.id}`} className="btn-ghost">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/daily/${next.id}`} className="btn-primary">
            {next.title} →
          </Link>
        )}
      </footer>
    </div>
  );
}
