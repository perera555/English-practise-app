"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { speak, splitWords, stopSpeaking } from "@/lib/speech";
import { useCustomContent } from "@/lib/customContent";
import type { Chart } from "@/lib/pte";
import { BarChart } from "./PteView";
import { VideoPlayer } from "./VideoPlayer";

/* ------------------------------------------------------------------
   🎬 Example chapter: how to do a PTE session, step by step.
   Each task has a "guide video" (an animated exam screen where the
   guide explains and a model student answers), plus steps and tips.
------------------------------------------------------------------- */

type Step =
  | { who: "guide" | "student" | "audio"; text: string; note?: string }
  | { who: "wait"; secs: number; note: string };

type Example = {
  id: string;
  emoji: string;
  name: string;
  skill: string;
  time: string;
  screen: { label: string; text?: string; chart?: Chart; words?: { shown: string; spoken: string } };
  steps: string[];
  model: string;
  tips: string[];
  video: Step[];
};

const CHART: Chart = {
  title: "Number of tourists visiting a city (millions)",
  unit: "m",
  bars: [
    { label: "2020", value: 1.2 },
    { label: "2021", value: 1.8 },
    { label: "2022", value: 3.1 },
    { label: "2023", value: 4.0 },
    { label: "2024", value: 4.6 },
  ],
};

const EXAMPLES: Example[] = [
  {
    id: "ra",
    emoji: "📖",
    name: "Read Aloud",
    skill: "Speaking & Reading",
    time: "Prepare 30–40 seconds · Speak up to 40 seconds",
    screen: {
      label: "On the screen you see a short text:",
      text: "Regular exercise improves both physical and mental health. Even a short walk every day can reduce stress, help people sleep better and increase their energy levels.",
    },
    steps: [
      "Read the text silently while the timer counts down. Find difficult words.",
      "When the microphone opens (you hear a short tone), start speaking within 3 seconds.",
      "Read at a steady, natural speed. Pause briefly at commas and full stops.",
      "If you make a mistake, don't go back. Just keep going.",
    ],
    model:
      "Regular exercise improves both physical and mental health. Even a short walk every day can reduce stress, help people sleep better and increase their energy levels.",
    tips: ["Fluency matters more than perfection: never stop or repeat.", "Stress the important words: exercise, physical, mental, stress, energy.", "Don't read too fast. Clear and smooth wins marks."],
    video: [
      { who: "guide", text: "This is Read Aloud. A short text appears on the screen. You have about thirty seconds to prepare." },
      { who: "wait", secs: 4, note: "⏳ Preparation time: read the text silently" },
      { who: "guide", text: "Now the microphone opens. Listen to how the model student reads it." },
      { who: "student", text: "Regular exercise improves both physical and mental health. Even a short walk every day can reduce stress, help people sleep better and increase their energy levels.", note: "🔴 Recording" },
      { who: "guide", text: "Notice the steady speed and the short pauses at the full stops. Now it's your turn in Session one." },
    ],
  },
  {
    id: "rs",
    emoji: "🔁",
    name: "Repeat Sentence",
    skill: "Speaking & Listening",
    time: "Listen once (3–9 seconds) · Repeat within 15 seconds",
    screen: { label: "You hear a sentence only once. Nothing is written on the screen." },
    steps: [
      "Listen very carefully. The audio plays only once.",
      "Remember the meaning and the rhythm, not single words.",
      "As soon as the microphone opens, repeat the sentence exactly.",
      "If you forget a word, keep going with the rest of the sentence.",
    ],
    model: "The lecture has been moved to the main hall.",
    tips: ["Copy the speaker's rhythm and intonation.", "Start speaking quickly, while the sentence is fresh in your mind.", "Saying most of the sentence fluently is better than stopping."],
    video: [
      { who: "guide", text: "This is Repeat Sentence. You will hear one sentence. Listen carefully." },
      { who: "audio", text: "The lecture has been moved to the main hall.", note: "🔊 Audio plays once" },
      { who: "guide", text: "The microphone opens. Repeat it exactly." },
      { who: "student", text: "The lecture has been moved to the main hall.", note: "🔴 Recording" },
      { who: "guide", text: "Perfect: same words, same rhythm. Short sentences are easy if you stay calm." },
    ],
  },
  {
    id: "di",
    emoji: "📊",
    name: "Describe Image",
    skill: "Speaking",
    time: "Prepare 25 seconds · Speak up to 40 seconds",
    screen: { label: "You see a chart, graph, map or picture:", chart: CHART },
    steps: [
      "Read the title first. Then find the highest, the lowest and the trend.",
      "Start with: “This bar chart shows…”.",
      "Describe 2–3 key details with numbers.",
      "Finish with a conclusion: “Overall…”.",
    ],
    model:
      "This bar chart shows the number of tourists visiting a city from 2020 to 2024. In 2020, the number was the lowest, at about 1.2 million. It increased every year and reached its highest point in 2024, at 4.6 million. Overall, tourism in the city grew steadily over the five years.",
    tips: ["Use a template: introduction → highest → lowest → trend → conclusion.", "Keep talking for the full time, smoothly. Fluency is scored.", "Learn trend words: increased, decreased, peaked, remained stable."],
    video: [
      { who: "guide", text: "This is Describe Image. Look at the title, the highest bar and the lowest bar." },
      { who: "wait", secs: 4, note: "⏳ 25 seconds to study the chart" },
      { who: "guide", text: "Now listen to a high-scoring answer using a simple template." },
      {
        who: "student",
        text: "This bar chart shows the number of tourists visiting a city from 2020 to 2024. In 2020, the number was the lowest, at about 1.2 million. It increased every year and reached its highest point in 2024, at 4.6 million. Overall, tourism in the city grew steadily over the five years.",
        note: "🔴 Recording",
      },
      { who: "guide", text: "Introduction, lowest, highest, trend, conclusion. You can use this template for every chart." },
    ],
  },
  {
    id: "asq",
    emoji: "❓",
    name: "Answer Short Question",
    skill: "Speaking & Listening",
    time: "Listen to a question · Answer in 1 or 2 words within 10 seconds",
    screen: { label: "You hear a simple general-knowledge question." },
    steps: ["Listen to the whole question.", "Answer with one or a few words only.", "Speak clearly. No need for a full sentence."],
    model: "A pilot.",
    tips: ["Short answers are perfect: “seven”, “a key”, “departure”.", "If you don't know, guess: there is no negative marking."],
    video: [
      { who: "guide", text: "This is Answer Short Question. Listen to the question." },
      { who: "audio", text: "What do we call a person who flies a plane?", note: "🔊 Question" },
      { who: "student", text: "A pilot.", note: "🔴 Recording" },
      { who: "guide", text: "That's all. One or two words is the correct answer." },
    ],
  },
  {
    id: "wfd",
    emoji: "✍️",
    name: "Write from Dictation",
    skill: "Listening & Writing",
    time: "Hear a sentence once · Type it exactly",
    screen: { label: "You hear a short sentence and type it in a box." },
    steps: [
      "Listen once. Write down the first letter of each word quickly on your note pad if it helps.",
      "Type the full sentence. Check spelling, plurals (-s) and verb endings (-ed).",
      "Every correct word scores a point, so write every word you remember.",
    ],
    model: "Students must register for the course online.",
    tips: ["Check: capital letter at the start and a full stop at the end.", "This task gives many marks for listening and writing. Practise it every day."],
    video: [
      { who: "guide", text: "This is Write from Dictation. Listen and type exactly what you hear." },
      { who: "audio", text: "Students must register for the course online.", note: "🔊 Audio plays once" },
      { who: "wait", secs: 3, note: "⌨️ Typing: Students must register for the course online." },
      { who: "guide", text: "Check your spelling and the plural s in students. Every correct word is a mark." },
    ],
  },
  {
    id: "hiw",
    emoji: "🖍️",
    name: "Highlight Incorrect Words",
    skill: "Listening & Reading",
    time: "Read along while the audio plays · Click the words that are different",
    screen: {
      label: "You see a transcript. Some words are different from the audio:",
      words: {
        shown: "The city council has decided to build a new school near the river, which will open next winter.",
        spoken: "The city council has decided to build a new park near the river, which will open next summer.",
      },
    },
    steps: ["Put your cursor or finger under the words and follow the audio.", "When you hear a different word, click it straight away.", "Don't guess: a wrong click loses a mark."],
    model: "Different words: school (audio says park) and winter (audio says summer).",
    tips: ["Follow word by word; never jump ahead.", "Usually 2–4 words are different."],
    video: [
      { who: "guide", text: "This is Highlight Incorrect Words. Read the text while you listen." },
      { who: "audio", text: "The city council has decided to build a new park near the river, which will open next summer.", note: "🔊 Audio" },
      { who: "guide", text: "The text said school, but the audio said park. And it said winter, but we heard summer. So click school and winter." },
    ],
  },
];

/* ---------------- The guide "video" player (animated exam screen) ---------------- */

function GuideVideo({ ex }: { ex: Example }) {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [word, setWord] = useState(-1);
  const [count, setCount] = useState(0);
  const run = useRef(0);

  useEffect(() => () => {
    run.current++;
    stopSpeaking();
  }, []);

  async function play() {
    const me = ++run.current;
    setPlaying(true);
    for (let i = 0; i < ex.video.length; i++) {
      if (run.current !== me) return;
      setStep(i);
      setWord(-1);
      const s = ex.video[i];
      if (s.who === "wait") {
        for (let t = s.secs; t > 0; t--) {
          if (run.current !== me) return;
          setCount(t);
          await new Promise((r) => setTimeout(r, 1000));
        }
        setCount(0);
      } else {
        await speak(s.text, { slot: s.who === "guide" ? 1 : s.who === "student" ? 2 : 3, onWord: (w) => run.current === me && setWord(w) });
        await new Promise((r) => setTimeout(r, 350));
      }
    }
    if (run.current === me) {
      setPlaying(false);
      setStep(ex.video.length);
    }
  }
  function stop() {
    run.current++;
    stopSpeaking();
    setPlaying(false);
  }

  const cur = step >= 0 && step < ex.video.length ? ex.video[step] : undefined;
  const pct = step < 0 ? 0 : Math.min(100, ((step + 1) / ex.video.length) * 100);
  const who = cur && cur.who !== "wait" ? { guide: "👩‍🏫 Guide", student: "🧑‍🎓 Model student", audio: "🔊 Test audio" }[cur.who] : "";

  return (
    <div className="rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
      {/* fake exam screen */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-xs font-semibold">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="opacity-80">PTE practice · {ex.name}</span>
        <span className="ml-auto opacity-60">🎬 Guide video</span>
      </div>
      <div className="p-4 sm:p-6 min-h-56 flex flex-col gap-3">
        {ex.screen.chart && (
          <div className="rounded-2xl bg-white text-slate-900 p-3">
            <BarChart chart={ex.screen.chart} />
          </div>
        )}
        {ex.screen.text && <p className="rounded-2xl bg-white/10 p-3 leading-relaxed">{ex.screen.text}</p>}
        {ex.screen.words && (
          <p className="rounded-2xl bg-white/10 p-3 leading-relaxed">
            {ex.screen.words.shown.split(" ").map((w, i) => {
              const diff = w !== ex.screen.words!.spoken.split(" ")[i];
              const reveal = diff && step >= ex.video.length - 1;
              return (
                <span key={i} className={reveal ? "rounded bg-amber-400 text-slate-900 px-1" : ""}>
                  {w}{" "}
                </span>
              );
            })}
          </p>
        )}

        {cur?.who === "wait" && (
          <div className="rounded-2xl bg-amber-400/20 border border-amber-300/40 p-3 flex items-center gap-3">
            <span className="text-3xl font-black tabular-nums">{count}</span>
            <span>{cur.note}</span>
          </div>
        )}
        {cur && cur.who !== "wait" && (
          <div
            className={`rounded-2xl p-3 ${
              cur.who === "student" ? "bg-rose-500/20 border border-rose-300/40" : cur.who === "audio" ? "bg-sky-500/20 border border-sky-300/40" : "bg-white/10"
            }`}
          >
            <p className="text-xs font-bold opacity-80 mb-1">
              {who} {cur.note && <span className="ml-2">{cur.note}</span>}
            </p>
            <p className="text-lg leading-relaxed">
              {splitWords(cur.text).map((w, i) => (
                <span key={i} className={i === word ? "bg-yellow-300 text-slate-900 rounded px-0.5" : i < word ? "opacity-100" : "opacity-70"}>
                  {w}{" "}
                </span>
              ))}
            </p>
          </div>
        )}
        {step === -1 && <p className="opacity-70">Press ▶ to watch how this task works, with a model answer.</p>}
        {step >= ex.video.length && <p className="text-emerald-300 font-semibold">✅ Finished. Now read the steps below, then try it yourself.</p>}
      </div>
      <div className="h-1.5 bg-white/10">
        <div className="h-full bg-linear-to-r from-sky-400 to-fuchsia-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-2 p-3 bg-slate-800">
        {playing ? (
          <button className="btn-ghost" onClick={stop}>
            ⏹ Stop
          </button>
        ) : (
          <button className="btn-primary" onClick={() => void play()}>
            ▶ {step >= 0 ? "Watch again" : "Play guide video"}
          </button>
        )}
        <span className="text-xs opacity-70">
          Step {Math.max(0, Math.min(step + 1, ex.video.length))} / {ex.video.length}
        </span>
      </div>
    </div>
  );
}

/* ---------------- The example chapter page ---------------- */

export function PteExample() {
  const { videos } = useCustomContent();
  const real = videos.filter((v) => v.category === "pte");
  const [open, setOpen] = useState(EXAMPLES[0].id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/pte" className="text-sm opacity-60 hover:opacity-100">
        ← PTE practice
      </Link>
      <header className="rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-6 shadow-xl">
        <p className="text-sm font-semibold opacity-90">📘 Example chapter · start here</p>
        <h1 className="text-3xl font-black">How to do a PTE session</h1>
        <p className="opacity-90">
          Every PTE session has 6 tasks. For each task, watch the guide video (a model student answers on an exam screen), read the steps and tips, then try it yourself in Session 1.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {EXAMPLES.map((e, i) => (
            <a key={e.id} href={`#ex-${e.id}`} onClick={() => setOpen(e.id)} className="rounded-full bg-white/20 px-3 py-1 font-semibold hover:bg-white/30">
              {i + 1}. {e.emoji} {e.name}
            </a>
          ))}
        </div>
      </header>

      {EXAMPLES.map((e, i) => (
        <section key={e.id} id={`ex-${e.id}`} className="card flex flex-col gap-4 scroll-mt-24">
          <button className="flex items-center gap-3 text-left" onClick={() => setOpen(open === e.id ? "" : e.id)}>
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-2xl shadow-[0_3px_0_#4c1d95]">{e.emoji}</span>
            <span className="flex-1">
              <span className="block text-xs font-semibold opacity-60">
                Task {i + 1} of 6 · {e.skill}
              </span>
              <span className="block text-xl font-extrabold">{e.name}</span>
              <span className="block text-sm opacity-70">⏱️ {e.time}</span>
            </span>
            <span className="text-2xl">{open === e.id ? "▾" : "▸"}</span>
          </button>

          {open === e.id && (
            <>
              <GuideVideo ex={e} />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-1">👣 What to do</h3>
                  <p className="text-sm opacity-70 mb-2">{e.screen.label}</p>
                  <ol className="list-decimal pl-5 flex flex-col gap-1">
                    {e.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-3">
                    <h3 className="font-bold mb-1">⭐ Model answer</h3>
                    <button className="text-left" onClick={() => void speak(e.model, { slot: 2 })}>
                      🔊 {e.model}
                    </button>
                  </div>
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-3">
                    <h3 className="font-bold mb-1">💡 Tips for a high score</h3>
                    <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
                      {e.tips.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      ))}

      <section className="card flex flex-col gap-3">
        <h2 className="text-xl font-bold">🎬 Real PTE guide videos</h2>
        {real.map((v) => (
          <div key={v.id} className="flex flex-col gap-2">
            <h3 className="font-semibold">{v.title}</h3>
            <VideoPlayer video={v} />
          </div>
        ))}
        <a
          className="btn-ghost self-start"
          href="https://www.youtube.com/results?search_query=Pearson+PTE+Academic+official+test+tutorial"
          target="_blank"
          rel="noreferrer"
        >
          📺 Watch the official Pearson PTE tutorials on YouTube
        </a>
        {real.length === 0 && <p className="text-xs opacity-60">Admin tip: add videos with the category “PTE” in Admin → Videos and they will appear here.</p>}
      </section>

      <Link href="/pte/session/1" className="btn-primary self-end text-lg">
        I&apos;m ready: start Session 1 →
      </Link>
    </div>
  );
}
