"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { Lesson, Line } from "@/lib/types";
import { markDone, useProgress } from "@/lib/settings";
import { Karaoke } from "./Karaoke";
import { Pitch } from "./Pitch";
import { Scene } from "./Scene";
import { ChatBox } from "./ChatBox";
import { ChapterVideos } from "./Videos";
import { isHidden, useCustomContent } from "@/lib/customContent";
import { RemovedNotice } from "./HideIf";
import { DescribePicture, Dictation, MicWarning, Quiz, RepeatLine, VocabCards } from "./Practice";

const TABS = [
  { id: "watch", label: "Watch & Read", emoji: "🎬" },
  { id: "vocab", label: "Words", emoji: "🖼️" },
  { id: "listen", label: "Listening", emoji: "🎧" },
  { id: "speak", label: "Speaking", emoji: "🎤" },
  { id: "talk", label: "Conversation", emoji: "🤖" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function ChapterView(props: { lesson: Lesson; prev?: Lesson; next?: Lesson; hrefFor?: (l: Lesson) => string }) {
  const custom = useCustomContent();
  if (isHidden(custom, `ch:${props.lesson.id}`)) return <RemovedNotice />;
  // The admin may have edited this chapter: use the edited version.
  const lesson = custom.overrides?.[props.lesson.id] ?? props.lesson;
  return <ChapterViewInner {...props} lesson={lesson} />;
}

function ChapterViewInner({
  lesson,
  prev,
  next,
  hrefFor = (l) => `/chapter/${l.id}`,
}: {
  lesson: Lesson;
  prev?: Lesson;
  next?: Lesson;
  hrefFor?: (l: Lesson) => string;
}) {
  const [tab, setTab] = useState<Tab>("watch");
  const [lineIdx, setLineIdx] = useState(-1);
  const [tick, setTick] = useState(0);
  const [talkMode, setTalkMode] = useState<"quick" | "session">("session");
  const progress = useProgress();
  const done = new Set(progress.done[lesson.id] ?? []);

  const onLine = useCallback((i: number, _l: Line) => {
    setLineIdx(i);
    setTick((t) => t + 1);
  }, []);
  const mark = useCallback((part: string) => markDone(lesson.id, part), [lesson.id]);
  const onWatchDone = useCallback(() => mark("watch"), [mark]);
  const onVocabDone = useCallback(() => mark("vocab"), [mark]);
  const onQuizDone = useCallback(() => mark("listen"), [mark]);
  const onSpeakScore = useCallback((s: number) => s >= 60 && mark("speak"), [mark]);
  const onTalkDone = useCallback(() => mark("talk"), [mark]);

  const action = lineIdx >= 0 ? lesson.lines[lineIdx]?.action : undefined;
  const dictation = lesson.lines
    .map((l) => l.text)
    .filter((t) => t.split(" ").length <= 12)
    .filter((_, i) => i % 2 === 1)
    .slice(0, 4);
  const myLines = lesson.lines.filter((l) => l.speaker === lesson.learnerRole);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <Link href={`/#unit-${lesson.unit}`} className="text-sm opacity-60 hover:opacity-100">
          ← All chapters
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl">{lesson.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">
              Chapter {lesson.chapter} {lesson.chapter <= 30 ? "of 30" : "· ✨ New"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{lesson.title}</h1>
            <p className="opacity-70">{lesson.subtitle}</p>
          </div>
          <span
            className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
              lesson.level === "Beginner" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
            }`}
          >
            {lesson.level}
          </span>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-2xl px-4 py-2 font-semibold transition flex items-center gap-1.5 ${
              tab === t.id ? "bg-sky-500 text-white shadow" : "bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15"
            }`}
          >
            <span className="opacity-60 text-xs">{i + 1}</span> {t.emoji} {t.label} {done.has(t.id) && "✅"}
          </button>
        ))}
      </nav>

      {tab === "watch" && (
        <section className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
          <div className="flex flex-col gap-3">
            <Scene scene={lesson.scene} label={lesson.title} photoKey={`ch:${lesson.id}`} />
            {lesson.sport && (
              <>
                <p className="text-sm font-semibold opacity-70">🎮 Live match animation: follows the commentary</p>
                <Pitch sport={lesson.sport} action={action} tick={tick} />
              </>
            )}
            {lineIdx >= 0 && lesson.lines[lineIdx] && (
              <div className="rounded-2xl bg-black/80 text-white px-4 py-3 text-center text-lg font-medium">
                <span className="opacity-60 mr-2">{lesson.lines[lineIdx].speaker}:</span>
                {lesson.lines[lineIdx].text}
              </div>
            )}
            <a
              className="text-sm opacity-70 hover:opacity-100 underline"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.watch)}`}
              target="_blank"
              rel="noreferrer"
            >
              📺 Watch real videos about “{lesson.title}” on YouTube (turn on CC subtitles)
            </a>
          </div>
          <div className="card">
            <h2 className="font-bold mb-2">🎤 Karaoke subtitles</h2>
            <p className="text-sm opacity-70 mb-3">Press Play. Words light up as they are spoken. Tap any line to hear it again.</p>
            <Karaoke lines={lesson.lines} learnerRole={lesson.learnerRole} onLine={onLine} onFinish={onWatchDone} />
          </div>
        </section>
      )}

      {tab === "watch" && <ChapterVideos chapterId={lesson.id} />}

      {tab === "vocab" && (
        <section className="flex flex-col gap-3">
          <p className="opacity-70">Tap a picture card to hear the word and see its meaning. Then press 🎤 to say it.</p>
          <VocabCards vocab={lesson.vocab} onDone={onVocabDone} />
        </section>
      )}

      {tab === "listen" && (
        <section className="grid lg:grid-cols-2 gap-5">
          <div className="card flex flex-col gap-3">
            <h2 className="font-bold text-lg">1. Listen without subtitles 🙈</h2>
            <p className="text-sm opacity-70">Listen to the conversation. The text is hidden. Then answer the questions.</p>
            <Karaoke lines={lesson.lines} hideSubtitles allowRolePlay={false} />
          </div>
          <div className="flex flex-col gap-5">
            <div className="card">
              <h2 className="font-bold text-lg mb-3">2. Answer the questions</h2>
              <Quiz questions={lesson.quiz} onDone={onQuizDone} />
            </div>
            <div className="card">
              <h2 className="font-bold text-lg mb-3">3. Dictation ✍️</h2>
              <Dictation sentences={dictation} />
            </div>
          </div>
        </section>
      )}

      {tab === "speak" && (
        <section className="flex flex-col gap-5">
          <MicWarning />
          <div className="card flex flex-col gap-3">
            <h2 className="font-bold text-lg">1. Repeat after me — your lines as {lesson.learnerRole}</h2>
            <p className="text-sm opacity-70">Listen, then press 🎤 and say the sentence. Green words = correct, red = try again.</p>
            {myLines.map((l, i) => (
              <RepeatLine key={i} text={l.text} onScore={onSpeakScore} />
            ))}
          </div>
          <div className="card flex flex-col gap-3">
            <h2 className="font-bold text-lg">2. Role-play the full conversation 🎭</h2>
            <p className="text-sm opacity-70">Turn on “Role-play” and press Play. The robot speaks the other parts and waits for you.</p>
            <Karaoke lines={lesson.lines} learnerRole={lesson.learnerRole} />
          </div>
          <div className="card flex flex-col gap-3">
            <h2 className="font-bold text-lg">3. Describe the picture 🖼️</h2>
            <DescribePicture scene={lesson.scene} vocab={lesson.vocab} photoKey={`ch:${lesson.id}`} />
          </div>
        </section>
      )}

      {tab === "talk" && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button className={talkMode === "session" ? "btn-primary" : "btn-ghost"} onClick={() => setTalkMode("session")}>
              ⏱️ 20-minute session
            </button>
            <button className={talkMode === "quick" ? "btn-primary" : "btn-ghost"} onClick={() => setTalkMode("quick")}>
              💬 Quick chat
            </button>
          </div>
          <p className="text-sm opacity-70">
            The robot plays <b>{lesson.robot}</b>. Speak with 🎤 or type. It will gently correct your mistakes (✏️).
          </p>
          <ChatBox
            key={talkMode}
            robot={lesson.robot}
            opener={lesson.opener}
            topic={lesson.title}
            vocab={lesson.vocab}
            questions={lesson.quiz.map((q) => q.q)}
            sessionMinutes={talkMode === "session" ? 20 : 0}
            onSessionEnd={onTalkDone}
          />
        </section>
      )}

      <footer className="flex justify-between gap-3 pt-2">
        {prev ? (
          <Link href={hrefFor(prev)} className="btn-ghost">
            ← Ch {prev.chapter}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={hrefFor(next)} className="btn-primary">
            Ch {next.chapter}: {next.title} →
          </Link>
        )}
      </footer>
    </div>
  );
}
