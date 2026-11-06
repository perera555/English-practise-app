"use client";

import Link from "next/link";
import { useState } from "react";
import { stories, FREE_STORIES, type Story } from "@/lib/stories";
import { markDone, useProgress } from "@/lib/settings";
import { Karaoke } from "./Karaoke";
import { Scene } from "./Scene";
import { DescribePicture, MicWarning, Quiz, RepeatLine, VocabCards } from "./Practice";
import { LockBadge } from "./Premium";
import { isHidden, useCustomContent } from "@/lib/customContent";
import { RemovedNotice } from "./HideIf";

export function StoriesHub() {
  const progress = useProgress();
  const [len, setLen] = useState<"All" | "Short" | "Long">("All");
  const [level, setLevel] = useState<"All" | "Beginner" | "Intermediate">("All");
  const custom = useCustomContent();
  const list = stories.filter((s) => !isHidden(custom, `story:${s.id}`) && (len === "All" || s.length === len) && (level === "All" || s.level === level));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">📖 Stories</h1>
        <p className="opacity-70">30 stories: 20 short and 10 long. Listen with karaoke subtitles, learn new words, answer questions, then read aloud and retell the story.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {(["All", "Short", "Long"] as const).map((l) => (
          <button key={l} className={len === l ? "btn-primary" : "btn-ghost"} onClick={() => setLen(l)}>
            {l === "Short" ? "⚡ Short" : l === "Long" ? "📚 Long" : "All stories"}
          </button>
        ))}
        <span className="w-px bg-black/10 dark:bg-white/15 mx-1" />
        {(["All", "Beginner", "Intermediate"] as const).map((l) => (
          <button key={l} className={level === l ? "btn-primary" : "btn-ghost"} onClick={() => setLevel(l)}>
            {l === "Beginner" ? "🌱 " : l === "Intermediate" ? "🌳 " : ""}
            {l === "All" ? "All levels" : l}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s) => {
          const done = (progress.done[`story-${s.id}`]?.length ?? 0) > 0;
          return (
            <Link key={s.id} href={`/stories/${s.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 transition">
              <div className="relative">
                <Scene scene={s.scene} label={s.title} photoKey={`story:${s.id}`} className="rounded-2xl shadow-none" />
                <span className="absolute top-2 left-2 rounded-full bg-black/55 text-white text-[11px] font-bold px-2 py-0.5 backdrop-blur">
                  {s.length === "Long" ? "📚 Long" : "⚡ Short"} · {s.sentences.length} lines
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold opacity-60">
                    Story {s.n} · {s.level} · {s.genre}
                  </div>
                  <div className="font-bold">{s.title}</div>
                  <div className="text-sm opacity-70 line-clamp-2">{s.sentences[0]}</div>
                </div>
                {done && <span title="Read">✅</span>}
                <LockBadge free={s.n <= FREE_STORIES} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const TABS = [
  { id: "read", label: "Listen & Read", emoji: "🎧" },
  { id: "words", label: "New words", emoji: "🖼️" },
  { id: "quiz", label: "Questions", emoji: "❓" },
  { id: "speak", label: "Read aloud & retell", emoji: "🎤" },
] as const;

export function StoryView({ story }: { story: Story }) {
  const custom = useCustomContent();
  if (isHidden(custom, `story:${story.id}`)) return <RemovedNotice />;
  return <StoryViewInner story={story} />;
}

function StoryViewInner({ story }: { story: Story }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("read");
  const i = stories.indexOf(story);
  const prev = stories[i - 1];
  const next = stories[i + 1];
  const lines = story.sentences.map((text) => ({ speaker: "Narrator", text }));
  const mark = (part: string) => markDone(`story-${story.id}`, part);
  const readAloud = story.sentences.filter((_, k) => k % Math.ceil(story.sentences.length / 4) === 0).slice(0, 4);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/stories" className="text-sm opacity-60 hover:opacity-100">
        ← All stories
      </Link>
      <div className="relative">
        <Scene scene={story.scene} label={story.title} photoKey={`story:${story.id}`} className="max-h-88 aspect-21/9" />
        <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-linear-to-t from-black/80 to-transparent p-5 text-white pointer-events-none">
          <p className="text-sm font-semibold opacity-90">
            Story {story.n} of 30 · {story.length} · {story.level} · {story.genre}
          </p>
          <h1 className="text-2xl sm:text-4xl font-black drop-shadow">
            {story.emoji} {story.title}
          </h1>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t, k) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 ${tab === t.id ? "btn-primary" : "btn-ghost"}`}>
            <span className="opacity-60 text-xs">{k + 1}</span> {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      {tab === "read" && (
        <section className="card">
          <p className="text-sm opacity-70 mb-3">Press Play to hear the story. Each word lights up as it is read. Tap any sentence to hear it again.</p>
          <Karaoke lines={lines} allowRolePlay={false} onFinish={() => mark("read")} />
        </section>
      )}

      {tab === "words" && (
        <section className="flex flex-col gap-3">
          <p className="opacity-70">Tap a card to hear the word and its meaning. Then press 🎤 to say it.</p>
          <VocabCards vocab={story.words} onDone={() => mark("words")} />
        </section>
      )}

      {tab === "quiz" && (
        <section className="card">
          <Quiz questions={story.quiz} onDone={() => mark("quiz")} />
        </section>
      )}

      {tab === "speak" && (
        <section className="flex flex-col gap-4">
          <MicWarning />
          <div className="card flex flex-col gap-3">
            <h2 className="font-bold text-lg">1. Read aloud like a storyteller</h2>
            {readAloud.map((t) => (
              <RepeatLine key={t} text={t} onScore={(s) => s >= 60 && mark("speak")} />
            ))}
          </div>
          <div className="card flex flex-col gap-3">
            <h2 className="font-bold text-lg">2. Retell the story in your own words</h2>
            <DescribePicture
              scene={story.scene}
              vocab={story.words}
              photoKey={`story:${story.id}`}
              seconds={60}
              prompt="Tell the story in your own words. Who is in it? What happened? How did it end?"
            />
          </div>
        </section>
      )}

      <footer className="flex justify-between gap-3 pt-2">
        {prev ? (
          <Link href={`/stories/${prev.id}`} className="btn-ghost">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/stories/${next.id}`} className="btn-primary">
            {next.title} →
          </Link>
        )}
      </footer>
    </div>
  );
}
