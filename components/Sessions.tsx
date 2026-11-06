"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { chapters } from "@/lib/content";
import { describeImage, highlightIncorrect, readAloud, repeatSentence, shortQuestions, writeFromDictation } from "@/lib/pte";
import { saveSessionScore, useProgress } from "@/lib/settings";
import { scoreLabel, stopSpeaking } from "@/lib/speech";
import { Karaoke } from "./Karaoke";
import { DescribePicture, Dictation, MicWarning, Quiz, RepeatLine } from "./Practice";
import { DescribeImage, HighlightIncorrect, ReadAloud, RepeatSentence, SessionCtx, ShortQuestion, WriteDictation } from "./PteView";
import { Scene } from "./Scene";
import { TwisterKaraoke } from "./Twisters";
import { twisterSession } from "@/lib/twisters";
import { FREE, SESSION_TOTALS, type SessionKind } from "@/lib/sessions";
import { LockBadge } from "./Premium";


const KIND_META: Record<SessionKind, { title: string; emoji: string; color: string }> = {
  listening: { title: "Listening Session", emoji: "🎧", color: "from-sky-500 to-cyan-500" },
  speaking: { title: "Speaking Session", emoji: "🎤", color: "from-rose-500 to-orange-500" },
  pte: { title: "PTE Session", emoji: "🎓", color: "from-emerald-500 to-teal-500" },
  twisters: { title: "Tongue Twister Karaoke", emoji: "👅", color: "from-pink-500 to-purple-600" },
};

type Step = { title: string; emoji: string; help: string; render: (report: (score: number) => void) => ReactNode };

/** The 3 chapters used by session n (1-based): sessions 1-10 cover chapters 1-30. */
function sessionChapters(n: number) {
  const start = ((n - 1) * 3) % chapters.length;
  return [chapters[start], chapters[start + 1], chapters[start + 2]];
}

/* ---------------- Generic runner ---------------- */

function SessionRunner({ kind, n, steps }: { kind: SessionKind; n: number; steps: Step[] }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const saved = useRef(false);
  const meta = KIND_META[kind];
  const total = SESSION_TOTALS[kind];

  const report = useCallback((i: number, s: number) => setScores((prev) => ({ ...prev, [i]: s })), []);
  const avg = Math.round(steps.reduce((a, _, i) => a + (scores[i] ?? 0), 0) / steps.length);

  useEffect(() => {
    if (finished && !saved.current) {
      saved.current = true;
      saveSessionScore(`${kind}-${n}`, avg);
    }
  }, [finished, avg, kind, n]);

  useEffect(() => () => stopSpeaking(), []);

  function go(i: number) {
    stopSpeaking();
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href={`/${kind}`} className="text-sm opacity-60 hover:opacity-100">
        ← All {kind === "pte" ? "PTE" : kind === "twisters" ? "tongue twister" : kind} sessions
      </Link>
      <div className={`rounded-3xl bg-linear-to-r ${meta.color} text-white p-5`}>
        <p className="text-sm opacity-90">
          Session {n} of {total}
        </p>
        <h1 className="text-3xl font-extrabold">
          {meta.emoji} {meta.title} {n}
        </h1>
        <div className="mt-3 flex gap-1.5">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => !finished && go(i)}
              className={`flex-1 h-2.5 rounded-full transition ${i === step && !finished ? "bg-white" : scores[i] !== undefined ? "bg-white/80" : "bg-white/30"}`}
              aria-label={`Step ${i + 1}: ${s.title}`}
            />
          ))}
        </div>
      </div>
      <MicWarning />

      {!finished ? (
        <section className="card flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold opacity-60">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="text-2xl font-bold">
              {steps[step].emoji} {steps[step].title}
            </h2>
            <p className="opacity-70">{steps[step].help}</p>
          </div>
          <div key={step}>{steps[step].render((s) => report(step, s))}</div>
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            {scores[step] !== undefined && (
              <span className={`font-bold ${scoreLabel(scores[step]).color}`}>
                Step score: {scores[step]}% {scoreLabel(scores[step]).text}
              </span>
            )}
            <span className="flex-1" />
            {step > 0 && (
              <button className="btn-ghost" onClick={() => go(step - 1)}>
                ← Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button className="btn-primary" onClick={() => go(step + 1)}>
                {scores[step] === undefined ? "Skip →" : "Next step →"}
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setFinished(true)}>
                🏁 Finish session
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="card flex flex-col items-center text-center gap-4 py-8">
          <div className="text-6xl">{avg >= 70 ? "🏆" : avg >= 40 ? "🎉" : "💪"}</div>
          <h2 className="text-3xl font-black">Session {n} complete!</h2>
          <p className={`text-xl font-bold ${scoreLabel(avg).color}`}>
            Your score: {avg}% · {scoreLabel(avg).text}
          </p>
          <ul className="w-full max-w-md flex flex-col gap-2 text-left">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2">
                <span>{s.emoji}</span>
                <span className="flex-1">{s.title}</span>
                <b>{scores[i] !== undefined ? `${scores[i]}%` : "skipped"}</b>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              className="btn-ghost"
              onClick={() => {
                saved.current = false;
                setScores({});
                setFinished(false);
                setStep(0);
              }}
            >
              🔁 Do it again
            </button>
            {n < total && (
              <Link href={`/${kind}/session/${n + 1}`} className="btn-primary">
                Session {n + 1} →
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------- Listening ---------------- */

export function ListeningSession({ n }: { n: number }) {
  const [a, b, c] = sessionChapters(n);
  const dict = (ch: typeof a) => ch.lines.map((l) => l.text).filter((t) => t.split(" ").length <= 12).slice(1, 4);
  const listenQuiz = (ch: typeof a): Step => ({
    title: `Listen & answer: ${ch.title}`,
    emoji: "🙈",
    help: "Press Play and listen. The subtitles are hidden. Then answer the questions.",
    render: (report) => (
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <Scene scene={ch.scene} label={ch.title} photoKey={`ch:${ch.id}`} />
          <Karaoke lines={ch.lines} hideSubtitles allowRolePlay={false} />
        </div>
        <Quiz questions={ch.quiz} onDone={(correct) => report(Math.round((correct / ch.quiz.length) * 100))} />
      </div>
    ),
  });
  const steps: Step[] = [
    listenQuiz(a),
    {
      title: `Dictation: ${b.title}`,
      emoji: "✍️",
      help: "Listen to each sentence and type exactly what you hear.",
      render: (report) => <Dictation sentences={dict(b)} onDone={report} />,
    },
    listenQuiz(c),
    {
      title: "Final dictation",
      emoji: "🎯",
      help: "Three sentences from this session's chapters. Use 🐢 slow only if you need it!",
      render: (report) => <Dictation sentences={[dict(a)[0], dict(b)[2] ?? dict(b)[0], dict(c)[1] ?? dict(c)[0]].filter(Boolean)} onDone={report} />,
    },
  ];
  return <SessionRunner kind="listening" n={n} steps={steps} />;
}

/* ---------------- Speaking ---------------- */

const TWISTERS = [
  "She sells sea shells by the sea shore.",
  "Red lorry, yellow lorry.",
  "Three free throws.",
  "Fresh French fried fish.",
  "A proper copper coffee pot.",
  "Six slippery snails slid slowly seaward.",
  "Unique New York.",
  "Big black bugs bleed blue black blood.",
  "Fred fed Ted bread and Ted fed Fred bread.",
  "Toy boat, toy boat, toy boat.",
];

function RepeatSet({ lines, report }: { lines: string[]; report: (s: number) => void }) {
  const [scores, setScores] = useState<Record<number, number>>({});
  useEffect(() => {
    const vals = Object.values(scores);
    if (vals.length) report(Math.round(vals.reduce((x, y) => x + y, 0) / lines.length));
  }, [scores, lines.length, report]);
  return (
    <div className="flex flex-col gap-3">
      {lines.map((t, i) => (
        <RepeatLine key={i} text={t} onScore={(s) => setScores((p) => ({ ...p, [i]: Math.max(s, p[i] ?? 0) }))} />
      ))}
    </div>
  );
}

function RolePlayStep({ lines, role, report }: { lines: typeof chapters[number]["lines"]; role: string; report: (s: number) => void }) {
  const [scores, setScores] = useState<number[]>([]);
  useEffect(() => {
    if (scores.length) report(Math.round(scores.reduce((x, y) => x + y, 0) / scores.length));
  }, [scores, report]);
  return <Karaoke lines={lines} learnerRole={role} startRolePlay onTurn={(s) => setScores((p) => [...p, s])} />;
}

export function SpeakingSession({ n }: { n: number }) {
  const [a, b, c] = sessionChapters(n);
  const mine = (ch: typeof a) => ch.lines.filter((l) => l.speaker === ch.learnerRole).map((l) => l.text).slice(0, 3);
  const steps: Step[] = [
    {
      title: "Warm-up: tongue twisters",
      emoji: "👅",
      help: "Say each one slowly first, then faster. This warms up your mouth!",
      render: (report) => <RepeatSet lines={[TWISTERS[(n - 1) % TWISTERS.length], TWISTERS[n % TWISTERS.length]]} report={report} />,
    },
    {
      title: `Repeat after me: ${a.title}`,
      emoji: "🔁",
      help: `Listen to each sentence, then press 🎤 and say it. You are the ${a.learnerRole}.`,
      render: (report) => <RepeatSet lines={mine(a)} report={report} />,
    },
    {
      title: `Role-play: ${b.title}`,
      emoji: "🎭",
      help: `Press Play. The robot speaks the other parts. When it's your line as ${b.learnerRole}, read it out loud.`,
      render: (report) => <RolePlayStep lines={b.lines} role={b.learnerRole} report={report} />,
    },
    {
      title: `Describe the picture: ${c.title}`,
      emoji: "🖼️",
      help: "Speak for 40 seconds. Use the target words. More words = higher score.",
      render: (report) => <DescribePicture scene={c.scene} vocab={c.vocab} onScore={report} photoKey={`ch:${c.id}`} />,
    },
  ];
  return <SessionRunner kind="speaking" n={n} steps={steps} />;
}

/* ---------------- PTE ---------------- */

export function PteSession({ n }: { n: number }) {
  const k = n - 1;
  const wrap = (fixed: number, el: ReactNode) => (report: (s: number) => void) => (
    <SessionCtx.Provider value={{ fixed, onScore: report }}>{el}</SessionCtx.Provider>
  );
  const steps: Step[] = [
    { title: "Read Aloud", emoji: "📖", help: "35 seconds to prepare, 40 seconds to read aloud.", render: wrap(k % readAloud.length, <ReadAloud />) },
    { title: "Repeat Sentence", emoji: "🔁", help: "Listen once, then repeat the sentence exactly.", render: wrap(k % repeatSentence.length, <RepeatSentence />) },
    { title: "Describe Image", emoji: "📊", help: "25 seconds to prepare, 40 seconds to describe.", render: wrap(k % describeImage.length, <DescribeImage />) },
    { title: "Answer Short Question", emoji: "❓", help: "Answer with one word or a few words.", render: wrap(k % shortQuestions.length, <ShortQuestion />) },
    { title: "Write from Dictation", emoji: "✍️", help: "Type the sentence you hear.", render: wrap(k % writeFromDictation.length, <WriteDictation />) },
    { title: "Highlight Incorrect Words", emoji: "🖍️", help: "Click the words that are different from the audio.", render: wrap(k % highlightIncorrect.length, <HighlightIncorrect />) },
  ];
  return <SessionRunner kind="pte" n={n} steps={steps} />;
}

/* ---------------- Tongue twisters ---------------- */

export function TwisterSession({ n }: { n: number }) {
  const steps: Step[] = twisterSession(n).map(({ text, group }) => ({
    title: group.sound,
    emoji: group.emoji,
    help: "1) Press Karaoke and follow the words at 3 speeds. 2) Press My turn and say it as fast and clearly as you can!",
    render: (report) => <TwisterKaraoke text={text} tip={group.tip} big onScore={report} />,
  }));
  return <SessionRunner kind="twisters" n={n} steps={steps} />;
}

/* ---------------- Session grid (for hub pages) ---------------- */

export function SessionGrid({ kind }: { kind: SessionKind }) {
  const progress = useProgress();
  const meta = KIND_META[kind];
  const total = SESSION_TOTALS[kind];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const best = progress.sessions?.[`${kind}-${n}`];
        const chs = kind === "listening" || kind === "speaking" ? sessionChapters(n) : null;
        return (
          <Link key={n} href={`/${kind}/session/${n}`} className="card p-3 flex flex-col gap-1 hover:-translate-y-1 transition">
            <div className={`rounded-2xl bg-linear-to-br ${meta.color} text-white px-3 py-2 flex items-center justify-between`}>
              <span className="font-black text-lg">
                {meta.emoji} {n}
              </span>
              {best !== undefined && <span className="text-sm font-bold">⭐ {best}%</span>}
              <LockBadge free={n <= FREE.sessions} />
            </div>
            <span className="text-xs opacity-70">
              {chs
                ? chs.map((c) => c.emoji + " " + c.title).join(" · ")
                : kind === "pte"
                  ? "All 6 PTE task types"
                  : `${twisterSession(n).length} twisters · mixed sounds`}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
