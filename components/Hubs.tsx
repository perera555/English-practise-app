"use client";

import Link from "next/link";
import { useState } from "react";
import { chapters } from "@/lib/content";
import { ChatBox } from "./ChatBox";
import { DescribePicture, Dictation, MicWarning, RepeatLine } from "./Practice";

function pick<T>(arr: T[], n: number, seed: number) {
  // Deterministic for the first render (seed 0), random after "New set".
  if (seed === 0) return arr.filter((_, i) => i % Math.ceil(arr.length / n) === 0).slice(0, n);
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

const allLines = chapters.flatMap((c) => c.lines.map((l) => ({ text: l.text, chapter: c })));
const shortLines = allLines.filter((l) => l.text.split(" ").length <= 11);

/* ---------------- Listening ---------------- */

export function ListeningHub() {
  const [seed, setSeed] = useState(0);
  const set = pick(shortLines, 5, seed).map((l) => l.text);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">🎧 Listening Practice</h1>
        <p className="opacity-70">Train your ears. Do a quick dictation, or open any chapter&apos;s listening test.</p>
      </header>
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">✍️ Quick dictation — 5 sentences</h2>
          <button className="btn-ghost" onClick={() => setSeed((s) => s + 1)}>
            🔀 New set
          </button>
        </div>
        <Dictation key={seed} sentences={set} />
      </section>
      <section>
        <h2 className="font-bold text-lg mb-3">📚 Listening tests by chapter (listen without subtitles + questions)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {chapters.map((c) => (
            <Link key={c.id} href={`/chapter/${c.id}`} className="card p-3 flex items-center gap-3 hover:-translate-y-0.5 transition">
              <span className="text-2xl">{c.emoji}</span>
              <span>
                <span className="text-xs opacity-60">Chapter {c.chapter}</span>
                <br />
                <b>{c.title}</b>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Speaking ---------------- */

const TWISTERS = [
  "She sells sea shells by the sea shore.",
  "Red lorry, yellow lorry.",
  "Three free throws.",
  "The thirty three thieves thought that they thrilled the throne.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "Fresh French fried fish.",
];

const MINIMAL_PAIRS = ["ship / sheep", "live / leave", "full / fool", "bat / bet", "very / berry", "thin / tin", "walk / work", "light / right"];

export function SpeakingHub() {
  const [seed, setSeed] = useState(0);
  const lines = pick(allLines, 5, seed);
  const sceneChapter = chapters[(seed * 7) % chapters.length];
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">🎤 Speaking Practice</h1>
        <p className="opacity-70">Listen, repeat and get a pronunciation score. Green words are correct, red words need practice.</p>
      </header>
      <MicWarning />
      <section className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">🔁 Repeat after me</h2>
          <button className="btn-ghost" onClick={() => setSeed((s) => s + 1)}>
            🔀 New sentences
          </button>
        </div>
        {lines.map((l, i) => (
          <RepeatLine key={`${seed}-${i}`} text={l.text} label={`Chapter ${l.chapter.chapter} · ${l.chapter.title}`} />
        ))}
      </section>
      <section className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">👅 Tongue twisters</h2>
        {TWISTERS.map((t) => (
          <RepeatLine key={t} text={t} />
        ))}
      </section>
      <section className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">👂 Sound pairs (minimal pairs)</h2>
        <p className="text-sm opacity-70">Say both words clearly. Can you hear the difference?</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {MINIMAL_PAIRS.map((p) => (
            <RepeatLine key={p} text={p.replace(" / ", " ")} label={p} />
          ))}
        </div>
      </section>
      <section className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">🖼️ Describe the picture — {sceneChapter.title}</h2>
        <DescribePicture key={seed} scene={sceneChapter.scene} vocab={sceneChapter.vocab} />
      </section>
    </div>
  );
}

/* ---------------- Robot chat ---------------- */

const TUTOR = {
  id: "tutor",
  title: "Friendly English Tutor",
  emoji: "🤖",
  robot: "a friendly, patient English tutor who chats about anything",
  opener: "Hi! I'm your English robot. What's your name, and what would you like to talk about today?",
  vocab: [],
  questions: ["What did you do today?", "What is your favourite food?", "Where would you like to travel?"],
};

export function ChatHub() {
  const options = [
    TUTOR,
    ...chapters.map((c) => ({
      id: c.id,
      title: `Ch ${c.chapter}: ${c.title}`,
      emoji: c.emoji,
      robot: c.robot,
      opener: c.opener,
      vocab: c.vocab,
      questions: c.quiz.map((q) => q.q),
    })),
  ];
  const [sel, setSel] = useState(options[0].id);
  const [mins, setMins] = useState(0);
  const o = options.find((x) => x.id === sel)!;
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-extrabold">🤖 Robot Chat</h1>
        <p className="opacity-70">Talk with an AI robot. Choose who it plays. Speak with 🎤 or type. It corrects your mistakes gently.</p>
      </header>
      <div className="grid md:grid-cols-[18rem_1fr] gap-4">
        <aside className="card p-2 max-h-[32rem] overflow-y-auto flex flex-col gap-1">
          {options.map((x) => (
            <button
              key={x.id}
              onClick={() => setSel(x.id)}
              className={`text-left rounded-xl px-3 py-2 text-sm flex items-center gap-2 ${sel === x.id ? "bg-sky-500 text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
            >
              <span className="text-xl">{x.emoji}</span> {x.title}
            </button>
          ))}
        </aside>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {[0, 10, 20].map((m) => (
              <button key={m} className={mins === m ? "btn-primary" : "btn-ghost"} onClick={() => setMins(m)}>
                {m === 0 ? "💬 Free chat" : `⏱️ ${m}-minute session`}
              </button>
            ))}
          </div>
          <ChatBox
            key={`${sel}-${mins}`}
            robot={o.robot}
            opener={o.opener}
            topic={o.title}
            vocab={o.vocab}
            questions={o.questions}
            sessionMinutes={mins}
          />
        </div>
      </div>
    </div>
  );
}
