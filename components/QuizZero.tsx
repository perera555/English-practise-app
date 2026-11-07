"use client";

import { useUrlTab } from "@/lib/useUrlTab";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PATTERNS, FREE_PATTERNS, fourOptions, parseGap, type Pattern } from "@/lib/patterns";
import { saveSessionScore, useProgress } from "@/lib/settings";
import { speak, splitWords } from "@/lib/speech";
import { LEVEL_CEFR, LEVEL_EMOJI, LEVEL_NAMES } from "@/lib/wordlist";
import { Dictation, MicWarning, RepeatLine } from "./Practice";
import { LockBadge } from "./Premium";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function stars(score?: number) {
  if (score === undefined) return "☆☆☆";
  return score >= 90 ? "⭐⭐⭐" : score >= 70 ? "⭐⭐☆" : score >= 40 ? "⭐☆☆" : "☆☆☆";
}

/* ---------------- Hub: the Zero to Hero path ---------------- */

export function QuizHub() {
  const progress = useProgress();
  const best = (id: string) => progress.sessions?.[`quiz-${id}`];
  const done = PATTERNS.filter((p) => (best(p.id) ?? 0) >= 70).length;
  const [test, setTest] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const nextPattern = PATTERNS.find((p) => (best(p.id) ?? 0) < 70) ?? PATTERNS[0];

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-4xl bg-linear-to-br from-emerald-500 via-teal-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl">
        <p className="text-5xl">🧠</p>
        <h1 className="text-4xl font-black">Quiz: Zero to Hero</h1>
        <p className="opacity-90 max-w-2xl">
          50 sentence patterns · 1,000 sentences · from 🌱 Beginner to 🎓 Advanced. Learn each pattern, then practise: fill the gap, build the sentence, listen and type,
          and say it. Works offline.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/quiz/${nextPattern.id}`} className="rounded-2xl bg-white text-emerald-700 font-black text-lg px-6 py-3 shadow-[0_5px_0_rgba(0,0,0,0.2)] active:translate-y-1">
            ▶ Start quiz: {nextPattern.title}
          </Link>
          <button
            onClick={() => setTest(1)}
            className="rounded-2xl bg-white/15 ring-1 ring-white/40 font-bold px-5 py-3 backdrop-blur hover:bg-white/25"
          >
            📝 Quick test: 20 questions
          </button>
        </div>
        <p className="mt-2 text-sm opacity-90">Each question: 1 sentence · 4 answers (A, B, C, D) · 1 mark for every correct answer.</p>
        <div className="mt-4 max-w-md">
          <div className="flex justify-between text-sm font-semibold">
            <span>Your journey</span>
            <span>
              {done} / {PATTERNS.length} patterns
            </span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full bg-yellow-300 transition-all" style={{ width: `${(done / PATTERNS.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {([1, 2, 3, 4, 5] as const).map((lv) => {
        const list = PATTERNS.filter((p) => p.level === lv);
        const testBest = progress.sessions?.[`quiz-level-${lv}`];
        return (
          <section key={lv} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold flex items-center gap-2 flex-1">
                {LEVEL_EMOJI[lv]} {LEVEL_NAMES[lv]} <span className="text-sm font-semibold opacity-60">{LEVEL_CEFR[lv]} · {list.length} patterns · {list.length * 20} sentences</span>
              </h2>
              <button className="btn-primary" onClick={() => setTest(test === lv ? null : lv)}>
                📝 {LEVEL_NAMES[lv]} test (20 questions){testBest !== undefined ? ` · best ${testBest}%` : ""}
              </button>
            </div>
            {test === lv && <LevelTest key={`t${lv}${progress.sessions?.[`quiz-level-${lv}`] ?? ""}`} level={lv} onClose={() => setTest(null)} />}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((p) => {
                const i = PATTERNS.indexOf(p);
                return (
                  <Link key={p.id} href={`/quiz/${p.id}`} className="card p-4 flex flex-col gap-1 hover:-translate-y-1 transition">
                    <div className="flex items-center gap-2">
                      <span className="grid place-items-center h-9 w-9 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 text-white font-black shadow-[0_3px_0_rgba(0,0,0,0.2)]">
                        {i + 1}
                      </span>
                      <span className="font-bold flex-1">{p.title}</span>
                      <LockBadge free={i < FREE_PATTERNS} />
                    </div>
                    <span className="text-xs opacity-70 font-mono">{p.formula}</span>
                    <span className="text-sm">{stars(best(p.id))}</span>
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

/* ---------------- Practice types ---------------- */

type Item = { p: Pattern; s: string };

/** One sentence, four answers (A–D), one mark for each correct answer. */
function FillGap({ items, onDone }: { items: Item[]; onDone: (pct: number) => void }) {
  // Shuffled once when the quiz opens.
  const [qs] = useState(() => shuffle(items).map(({ p, s }) => ({ ...parseGap(s), title: p.title, shuffled: shuffle(fourOptions(p, s)) })));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<{ full: string; answer: string; picked: string }[]>([]);
  if (i >= qs.length) {
    const pct = Math.round((score / qs.length) * 100);
    return <Result pct={pct} total={qs.length} score={score} wrong={wrong} onDone={() => onDone(pct)} />;
  }
  const q = qs[i];
  return (
    <div className="flex flex-col gap-4">
      <Progress i={i} n={qs.length} score={score} />
      <p className="text-xs font-semibold opacity-60">
        Question {i + 1} · {q.title}
      </p>
      <p className="text-2xl font-semibold leading-relaxed">
        {q.before}
        <span className={`inline-block min-w-16 border-b-4 mx-1 text-center ${picked ? (picked === q.answer ? "border-emerald-500 text-emerald-600" : "border-rose-500 text-rose-600") : "border-sky-400"}`}>
          {picked ?? "____"}
        </span>
        {q.after}
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {q.shuffled.map((o, k) => (
          <button
            key={o}
            disabled={!!picked}
            onClick={() => {
              setPicked(o);
              if (o === q.answer) setScore((s) => s + 1);
              else setWrong((w) => [...w, { full: q.full, answer: q.answer, picked: o }]);
              speak(q.full, { rate: 0.95 });
            }}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold border text-lg text-left ${
              picked && o === q.answer ? "bg-emerald-500 text-white border-emerald-500" : picked === o ? "bg-rose-500 text-white border-rose-500" : "border-black/10 dark:border-white/15 hover:bg-sky-50 dark:hover:bg-white/10"
            }`}
          >
            <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-black/10 dark:bg-white/15 text-sm font-black">{"ABCD"[k]}</span>
            {o}
          </button>
        ))}
      </div>
      {picked && (
        <div className="flex items-center gap-2">
          <p className="flex-1 font-semibold">
            {picked === q.answer ? (
              <span className="text-emerald-600">✅ Correct! +1 mark</span>
            ) : (
              <span className="text-rose-600">
                ❌ The answer is <b>{q.answer}</b>
              </span>
            )}
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              setPicked(null);
              setI(i + 1);
            }}
          >
            {i + 1 < qs.length ? "Next →" : "See my marks"}
          </button>
        </div>
      )}
    </div>
  );
}

/** 20 mixed questions from every pattern in one level. */
export function LevelTest({ level, onClose }: { level: 1 | 2 | 3 | 4 | 5; onClose: () => void }) {
  const [items] = useState(() => shuffle(PATTERNS.filter((p) => p.level === level).flatMap((p) => p.sentences.map((s) => ({ p, s })))).slice(0, 20));
  return (
    <div className="card flex flex-col gap-3 ring-2 ring-emerald-400">
      <div className="flex items-center">
        <h3 className="font-black text-xl flex-1">
          📝 {LEVEL_EMOJI[level]} {LEVEL_NAMES[level]} test: 20 questions
        </h3>
        <button className="btn-ghost" onClick={onClose}>
          ✕
        </button>
      </div>
      <FillGap
        items={items}
        onDone={(pct) => {
          saveSessionScore(`quiz-level-${level}`, pct);
          onClose();
        }}
      />
    </div>
  );
}

function BuildSentence({ p, onDone }: { p: Pattern; onDone: (pct: number) => void }) {
  const qs = useMemo(() => shuffle(p.sentences).slice(0, 8).map((s) => parseGap(s).full), [p]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const words = useMemo(() => (qs[i] ? splitWords(qs[i]) : []), [qs, i]);
  const pool = useMemo(() => shuffle(words.map((w, k) => ({ w, k }))), [words]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);

  if (i >= qs.length) {
    const pct = Math.round((score / qs.length) * 100);
    return <Result pct={pct} total={qs.length} score={score} onDone={() => onDone(pct)} />;
  }
  const built = chosen.map((k) => words[k]).join(" ");
  return (
    <div className="flex flex-col gap-4">
      <Progress i={i} n={qs.length} score={score} />
      <p className="opacity-70">Tap the words in the right order.</p>
      <div className="min-h-16 rounded-2xl border-2 border-dashed border-sky-300 p-3 flex flex-wrap gap-2">
        {chosen.map((k, idx) => (
          <button key={idx} disabled={checked !== null} className="rounded-xl bg-sky-500 text-white px-3 py-1.5 font-semibold" onClick={() => setChosen(chosen.filter((_, j) => j !== idx))}>
            {words[k]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool
          .filter((x) => !chosen.includes(x.k))
          .map((x) => (
            <button
              key={x.k}
              disabled={checked !== null}
              className="rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/15 px-3 py-1.5 font-semibold shadow-[0_3px_0_rgba(0,0,0,0.12)]"
              onClick={() => setChosen([...chosen, x.k])}
            >
              {x.w}
            </button>
          ))}
      </div>
      {checked === null ? (
        <button
          className="btn-primary self-start"
          disabled={chosen.length !== words.length}
          onClick={() => {
            const ok = built.toLowerCase() === qs[i].toLowerCase();
            setChecked(ok);
            if (ok) setScore((s) => s + 1);
            speak(qs[i]);
          }}
        >
          ✔ Check
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <p className="flex-1">{checked ? "✅ Perfect!" : <>❌ Correct order: <b>{qs[i]}</b></>}</p>
          <button
            className="btn-primary"
            onClick={() => {
              setChosen([]);
              setChecked(null);
              setI(i + 1);
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function Progress({ i, n, score }: { i: number; n: number; score: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div className="h-full bg-linear-to-r from-emerald-400 to-teal-500" style={{ width: `${(i / n) * 100}%` }} />
      </div>
      <span className="opacity-70">
        {i + 1}/{n} · ✅ {score}
      </span>
    </div>
  );
}

function grade(pct: number) {
  return pct >= 90 ? { g: "A", t: "Excellent!" } : pct >= 75 ? { g: "B", t: "Very good!" } : pct >= 60 ? { g: "C", t: "Good" } : pct >= 40 ? { g: "S", t: "Keep practising" } : { g: "F", t: "Try again" };
}

function Result({
  pct,
  score,
  total,
  wrong = [],
  onDone,
}: {
  pct: number;
  score: number;
  total: number;
  wrong?: { full: string; answer: string; picked: string }[];
  onDone: () => void;
}) {
  const gr = grade(pct);
  return (
    <div className="flex flex-col items-center text-center gap-3 py-6">
      <p className="text-6xl">{pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : "💪"}</p>
      <p className="text-lg font-semibold opacity-70">Your marks</p>
      <p className="text-5xl font-black">
        {score} <span className="text-2xl opacity-60">/ {total}</span>
      </p>
      <p className="text-xl font-bold">
        {pct}% · Grade <span className="rounded-lg bg-emerald-500 text-white px-2">{gr.g}</span> · {gr.t}
      </p>
      <p className="text-2xl">{stars(pct)}</p>
      {wrong.length > 0 && (
        <div className="w-full max-w-xl text-left flex flex-col gap-1.5 mt-2">
          <p className="font-bold">📝 Review your mistakes</p>
          {wrong.map((w, k) => (
            <button key={k} className="rounded-xl bg-rose-500/10 px-3 py-2 text-left text-sm" onClick={() => speak(w.full)}>
              🔊 {w.full}
              <span className="block text-xs opacity-70">
                You chose “{w.picked}”. Correct: “{w.answer}”
              </span>
            </button>
          ))}
        </div>
      )}
      <button className="btn-primary text-lg px-6 py-3" onClick={onDone}>
        Save & continue
      </button>
    </div>
  );
}

/* ---------------- One pattern page ---------------- */

const MODES = [
  { id: "fill", label: "Quiz: 4 answers", emoji: "✏️" },
  { id: "learn", label: "Learn the rule", emoji: "📘" },
  { id: "build", label: "Build the sentence", emoji: "🧩" },
  { id: "listen", label: "Listen & type", emoji: "🎧" },
  { id: "say", label: "Say it", emoji: "🎤" },
] as const;

export function PatternView({ p }: { p: Pattern }) {
  const [mode, setMode] = useUrlTab<(typeof MODES)[number]["id"]>("fill", MODES.map((m) => m.id));
  const [run, setRun] = useState(0);
  // The quiz shuffles questions, so it only starts in the browser (pages are pre-built without it).
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []); // eslint-disable-line react-hooks/set-state-in-effect
  const progress = useProgress();
  const i = PATTERNS.findIndex((x) => x.id === p.id);
  const next = PATTERNS[i + 1];
  const examples = p.sentences.slice(0, 5).map((s) => parseGap(s));
  // First set is fixed (pages are pre-built); after each round a new random set is picked.
  const listenSet = useMemo(() => (run === 0 ? p.sentences.slice(5, 10) : shuffle(p.sentences).slice(0, 5)).map((s) => parseGap(s).full), [p, run]);
  const saySet = useMemo(() => (run === 0 ? p.sentences.slice(10, 15) : shuffle(p.sentences).slice(0, 5)).map((s) => parseGap(s).full), [p, run]);

  const finish = (pct: number) => {
    saveSessionScore(`quiz-${p.id}`, pct);
    setRun((r) => r + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/quiz" className="text-sm opacity-60 hover:opacity-100">
        ← Zero to Hero
      </Link>
      <div className="rounded-4xl bg-linear-to-br from-emerald-500 to-teal-700 text-white p-6 shadow-lg">
        <p className="text-sm font-semibold opacity-90">
          Pattern {i + 1} of {PATTERNS.length} · {LEVEL_EMOJI[p.level]} {LEVEL_NAMES[p.level]} ({LEVEL_CEFR[p.level]}) · Best: {stars(progress.sessions?.[`quiz-${p.id}`])}
        </p>
        <h1 className="text-3xl sm:text-4xl font-black">{p.title}</h1>
        <p className="mt-2 inline-block rounded-xl bg-white/15 px-3 py-1.5 font-mono">{p.formula}</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto no-scrollbar">
        {MODES.map((m) => (
          <button key={m.id} className={`shrink-0 ${mode === m.id ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode(m.id)}>
            {m.emoji} {m.label}
          </button>
        ))}
      </nav>

      <section className="card">
        {mode === "learn" && (
          <div className="flex flex-col gap-3">
            <p className="text-lg">💡 {p.tip}</p>
            <p className="si text-amber-700 dark:text-amber-300">{p.si}</p>
            <h3 className="font-bold mt-2">Examples (tap to hear)</h3>
            {examples.map((e) => (
              <button key={e.full} className="text-left rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2 text-lg" onClick={() => speak(e.full)}>
                🔊 {e.before}
                <b className="text-emerald-600 dark:text-emerald-400">{e.answer}</b>
                {e.after}
              </button>
            ))}
            <button className="btn-primary self-start mt-2" onClick={() => setMode("fill")}>
              ▶ Start practising
            </button>
          </div>
        )}
        {mode === "fill" &&
          (ready ? (
            <FillGap key={`f${run}`} items={p.sentences.map((s) => ({ p, s }))} onDone={finish} />
          ) : (
            <p className="opacity-60">Loading quiz…</p>
          ))}
        {mode === "build" && <BuildSentence key={`b${run}`} p={p} onDone={finish} />}
        {mode === "listen" && (
          <div className="flex flex-col gap-3">
            <p className="opacity-70">Listen to each sentence and type it.</p>
            <Dictation key={`l${run}`} sentences={listenSet} onDone={(avg) => finish(avg)} />
          </div>
        )}
        {mode === "say" && (
          <div className="flex flex-col gap-3">
            <MicWarning />
            {saySet.map((s) => (
              <RepeatLine key={s} text={s} />
            ))}
          </div>
        )}
      </section>

      {next && (
        <Link href={`/quiz/${next.id}`} className="btn-primary self-end">
          Next pattern: {next.title} →
        </Link>
      )}
    </div>
  );
}
