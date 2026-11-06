"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { describeImage, highlightIncorrect, readAloud, repeatSentence, shortQuestions, writeFromDictation, type Chart } from "@/lib/pte";
import { listen, normalize, scoreLabel, scoreSpeech, speak, splitWords, stopSpeaking } from "@/lib/speech";
import { Scene } from "./Scene";
import { MicWarning } from "./Practice";

export const TASKS = [
  { id: "ra", name: "Read Aloud", emoji: "ðŸ“–", skill: "Speaking & Reading" },
  { id: "rs", name: "Repeat Sentence", emoji: "ðŸ”", skill: "Speaking & Listening" },
  { id: "di", name: "Describe Image", emoji: "ðŸ“Š", skill: "Speaking" },
  { id: "asq", name: "Answer Short Question", emoji: "â“", skill: "Speaking & Listening" },
  { id: "wfd", name: "Write from Dictation", emoji: "âœï¸", skill: "Listening & Writing" },
  { id: "hiw", name: "Highlight Incorrect Words", emoji: "ðŸ–ï¸", skill: "Listening & Reading" },
] as const;

type TaskId = (typeof TASKS)[number]["id"];

/** Rough practice score on the 10-90 PTE-style scale. Not an official score. */
function pteScale(pct: number) {
  return Math.round(10 + (Math.max(0, Math.min(100, pct)) / 100) * 80);
}

/* ---------- Timed speaking: prep countdown â†’ recording countdown ---------- */

function TimedSpeak({
  prep,
  speakFor,
  beforeRecord,
  onResult,
  resetKey,
}: {
  prep: number;
  speakFor: number;
  beforeRecord?: () => Promise<void>;
  onResult: (said: string, seconds: number) => void;
  resetKey: number;
}) {
  const [phase, setPhase] = useState<"idle" | "prep" | "audio" | "rec" | "done">("idle");
  const [left, setLeft] = useState(prep);
  const [interim, setInterim] = useState("");
  const stopRef = useRef<() => void>(() => {});
  const startedAt = useRef(0);

  useEffect(() => {
    stopRef.current();
    stopSpeaking();
    setPhase("idle");
    setInterim("");
  }, [resetKey]);

  useEffect(() => {
    if (phase !== "prep" && phase !== "rec") return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "prep" && left <= 0) void record();
    if (phase === "rec" && left <= 0) stopRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  async function begin() {
    if (prep > 0) {
      setLeft(prep);
      setPhase("prep");
    } else {
      await record();
    }
  }

  async function record() {
    if (beforeRecord) {
      setPhase("audio");
      await beforeRecord();
    }
    setLeft(speakFor);
    setPhase("rec");
    setInterim("");
    startedAt.current = Date.now();
    const h = listen({ continuous: speakFor > 15, onInterim: setInterim });
    stopRef.current = h.stop;
    let said = "";
    try {
      said = await h.result;
    } catch {
      said = "";
    }
    setPhase("done");
    onResult(said, Math.max(1, (Date.now() - startedAt.current) / 1000));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {phase === "idle" || phase === "done" ? (
          <button className="btn-primary" onClick={begin}>
            {phase === "done" ? "ðŸ” Try again" : "â–¶ Start"}
          </button>
        ) : phase === "prep" ? (
          <>
            <span className="rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 px-3 py-1 font-mono">
              Prepareâ€¦ {left}s
            </span>
            <button className="btn-ghost" onClick={() => void record()}>
              Skip â€” start recording
            </button>
          </>
        ) : phase === "audio" ? (
          <span className="rounded-full bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200 px-3 py-1">ðŸ”Š Playing audioâ€¦</span>
        ) : (
          <>
            <span className="rounded-full bg-red-500 text-white px-3 py-1 font-mono animate-pulse">â— Recording {left}s</span>
            <button className="btn-danger" onClick={() => stopRef.current()}>
              â–  Finish
            </button>
          </>
        )}
      </div>
      {phase === "rec" && interim && <p className="text-sm italic opacity-80">â€œ{interim}â€</p>}
    </div>
  );
}

function ScoreBox({ pct, said, extra }: { pct: number; said: string; extra?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/5 dark:bg-white/10 p-3 flex flex-col gap-1">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black">{pteScale(pct)}</span>
        <span className="text-sm opacity-70">/ 90 practice score</span>
        <span className={`ml-auto font-bold ${scoreLabel(pct).color}`}>{scoreLabel(pct).text}</span>
      </div>
      {extra}
      <p className="text-xs opacity-70">You said: â€œ{said || "(nothing heard)"}â€</p>
    </div>
  );
}

function Pager({ i, n, set }: { i: number; n: number; set: (i: number) => void }) {
  const ctx = useContext(SessionCtx);
  if (ctx.fixed !== undefined) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <button className="btn-ghost" disabled={i === 0} onClick={() => set(i - 1)}>
        â†
      </button>
      <span>
        Question {i + 1} / {n}
      </span>
      <button className="btn-ghost" disabled={i === n - 1} onClick={() => set(i + 1)}>
        â†’
      </button>
    </div>
  );
}

function BarChart({ chart }: { chart: Chart }) {
  const max = Math.max(...chart.bars.map((b) => b.value));
  const w = 360;
  const h = 200;
  const bw = (w - 40) / chart.bars.length;
  const colors = ["#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#ef4444"];
  return (
    <figure className="rounded-3xl bg-white dark:bg-slate-900 p-3 shadow">
      <figcaption className="text-center font-semibold text-sm mb-1 text-slate-900 dark:text-slate-100">{chart.title}</figcaption>
      <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full">
        <line x1="30" y1={h} x2={w} y2={h} stroke="currentColor" opacity="0.3" />
        {chart.bars.map((b, i) => {
          const bh = (b.value / max) * (h - 20);
          const x = 40 + i * bw;
          return (
            <g key={b.label}>
              <rect x={x} y={h - bh} width={bw * 0.65} height={bh} rx="4" fill={colors[i % colors.length]} />
              <text x={x + bw * 0.325} y={h - bh - 5} textAnchor="middle" fontSize="11" fill="currentColor">
                {b.value}
                {chart.unit}
              </text>
              <text x={x + bw * 0.325} y={h + 16} textAnchor="middle" fontSize="11" fill="currentColor">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/* ---------- Tasks ---------- */

/** When set, a task shows one fixed item (index) and reports its 0-100 score. */
export const SessionCtx = createContext<{ fixed?: number; onScore?: (pct: number) => void }>({});

export function ReadAloud() {
  const ctx = useContext(SessionCtx);
  const [i, setI] = useState(ctx.fixed ?? 0);
  const [res, setRes] = useState<{ pct: number; said: string; flags: boolean[]; wpm: number } | null>(null);
  const text = readAloud[i];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm opacity-70">Read the text aloud. You have 35 seconds to prepare and 40 seconds to speak.</p>
      <Pager i={i} n={readAloud.length} set={(n) => { setI(n); setRes(null); }} />
      <p className="text-lg leading-relaxed card">
        {splitWords(text).map((w, k) => (
          <span key={k} className={res ? (res.flags[k] ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 underline decoration-wavy") : ""}>
            {w}{" "}
          </span>
        ))}
      </p>
      <TimedSpeak
        prep={35}
        speakFor={40}
        resetKey={i}
        onResult={(said, secs) => {
          const r = scoreSpeech(text, said);
          setRes({ pct: r.score, said, flags: r.flags, wpm: Math.round((normalize(said).length / secs) * 60) });
          ctx.onScore?.(r.score);
        }}
      />
      {res && (
        <ScoreBox
          pct={res.pct}
          said={res.said}
          extra={<p className="text-sm">Content: {res.pct}% Â· Speed: {res.wpm} words/min {res.wpm < 90 ? "(try a little faster)" : res.wpm > 170 ? "(slow down a little)" : "(good pace ðŸ‘)"}</p>}
        />
      )}
      <button className="btn-ghost self-start" onClick={() => speak(text)}>
        ðŸ”Š Hear a model answer
      </button>
    </div>
  );
}

export function RepeatSentence() {
  const ctx = useContext(SessionCtx);
  const [i, setI] = useState(ctx.fixed ?? 0);
  const [res, setRes] = useState<{ pct: number; said: string } | null>(null);
  const [reveal, setReveal] = useState(false);
  const s = repeatSentence[i];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm opacity-70">You will hear a sentence once. Repeat it exactly. Recording starts right after the audio.</p>
      <Pager i={i} n={repeatSentence.length} set={(n) => { setI(n); setRes(null); setReveal(false); }} />
      <TimedSpeak prep={0} speakFor={15} resetKey={i} beforeRecord={() => speak(s)} onResult={(said) => {
          const pct = scoreSpeech(s, said).score;
          setRes({ pct, said });
          ctx.onScore?.(pct);
        }} />
      {res && <ScoreBox pct={res.pct} said={res.said} />}
      {res && (
        <button className="btn-ghost self-start" onClick={() => setReveal(true)}>
          ðŸ‘€ Show the sentence
        </button>
      )}
      {reveal && <p className="card text-lg">{s}</p>}
    </div>
  );
}

function diScore(used: number, total: number, words: number) {
  return Math.round(Math.min(100, (used / total) * 60 + Math.min(40, words)));
}

export function DescribeImage() {
  const ctx = useContext(SessionCtx);
  const [i, setI] = useState(ctx.fixed ?? 0);
  const [res, setRes] = useState<{ said: string; used: string[]; words: number } | null>(null);
  const item = describeImage[i];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm opacity-70">Look at the image. Prepare for 25 seconds, then describe it in detail for up to 40 seconds.</p>
      <Pager i={i} n={describeImage.length} set={(n) => { setI(n); setRes(null); }} />
      <div className="max-w-xl">{item.kind === "chart" ? <BarChart chart={item.chart} /> : <Scene scene={item.scene} label={item.title} />}</div>
      <details className="text-sm">
        <summary className="cursor-pointer opacity-80">ðŸ’¡ Useful template</summary>
        <p className="mt-2 opacity-80">
          â€œThis {item.kind === "chart" ? "bar chart showsâ€¦" : "picture showsâ€¦"} The highest / most important part isâ€¦ The lowest isâ€¦ Overall, it is clear thatâ€¦â€
        </p>
      </details>
      <TimedSpeak
        prep={25}
        speakFor={40}
        resetKey={i}
        onResult={(said) => {
          const ws = new Set(normalize(said));
          const r = { said, used: item.keywords.filter((k) => ws.has(k.toLowerCase())), words: normalize(said).length };
          setRes(r);
          ctx.onScore?.(diScore(r.used.length, item.keywords.length, r.words));
        }}
      />
      {res && (
        <ScoreBox
          pct={diScore(res.used.length, item.keywords.length, res.words)}
          said={res.said}
          extra={
            <p className="text-sm">
              {res.words} words Â· key words used: {res.used.join(", ") || "none"} (try: {item.keywords.filter((k) => !res.used.includes(k)).join(", ")})
            </p>
          }
        />
      )}
    </div>
  );
}

export function ShortQuestion() {
  const ctx = useContext(SessionCtx);
  const [i, setI] = useState(ctx.fixed ?? 0);
  const [res, setRes] = useState<{ said: string; ok: boolean } | null>(null);
  const item = shortQuestions[i];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm opacity-70">Listen to the question and answer with one word or a few words.</p>
      <Pager i={i} n={shortQuestions.length} set={(n) => { setI(n); setRes(null); }} />
      <TimedSpeak
        prep={0}
        speakFor={10}
        resetKey={i}
        beforeRecord={() => speak(item.q)}
        onResult={(said) => {
          const n = normalize(said).join(" ");
          const ok = item.answers.some((a) => n.includes(normalize(a).join(" ")));
          setRes({ said, ok });
          ctx.onScore?.(ok ? 100 : 0);
        }}
      />
      {res && (
        <div className={`rounded-2xl p-3 ${res.ok ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-rose-100 dark:bg-rose-500/20"}`}>
          <p className="font-bold">{res.ok ? "âœ… Correct!" : `âŒ The answer is: ${item.answers[0]}`}</p>
          <p className="text-sm opacity-80">Question: {item.q}</p>
          <p className="text-xs opacity-70">You said: â€œ{res.said || "(nothing heard)"}â€</p>
        </div>
      )}
    </div>
  );
}

export function WriteDictation() {
  const ctx = useContext(SessionCtx);
  const [i, setI] = useState(ctx.fixed ?? 0);
  const [typed, setTyped] = useState("");
  const [res, setRes] = useState<{ pct: number; flags: boolean[] } | null>(null);
  const s = writeFromDictation[i];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm opacity-70">Listen to the sentence and type it exactly. In the real test you hear it only once!</p>
      <Pager i={i} n={writeFromDictation.length} set={(n) => { setI(n); setRes(null); setTyped(""); }} />
      <button className="btn-primary self-start" onClick={() => speak(s)}>
        ðŸ”Š Play
      </button>
      <textarea
        rows={2}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        placeholder="Type the sentenceâ€¦"
      />
      <button className="btn-ghost self-start" disabled={!typed.trim()} onClick={() => {
          const r = scoreSpeech(s, typed);
          setRes({ pct: r.score, flags: r.flags });
          ctx.onScore?.(r.score);
        }}>
        âœ” Check
      </button>
      {res && (
        <div className="card">
          <p className="text-lg">
            {splitWords(s).map((w, k) => (
              <span key={k} className={res.flags[k] ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 font-bold underline"}>
                {w}{" "}
              </span>
            ))}
          </p>
          <p className="font-bold mt-1">
            {res.flags.filter(Boolean).length} / {res.flags.length} words correct Â· {pteScale(res.pct)}/90
          </p>
        </div>
      )}
    </div>
  );
}

export function HighlightIncorrect() {
  const ctx = useContext(SessionCtx);
  const [i, setI] = useState(ctx.fixed ?? 0);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const item = highlightIncorrect[i];
  const shown = splitWords(item.shown);
  const spoken = splitWords(item.spoken);
  const wrong = new Set(shown.map((w, k) => (normalize(w)[0] !== normalize(spoken[k] ?? "")[0] ? k : -1)).filter((k) => k >= 0));
  const right = [...picked].filter((k) => wrong.has(k)).length;
  const bad = picked.size - right;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm opacity-70">Play the audio. Some words in the text are different from what you hear. Click those words.</p>
      <Pager i={i} n={highlightIncorrect.length} set={(n) => { setI(n); setPicked(new Set()); setChecked(false); }} />
      <button className="btn-primary self-start" onClick={() => speak(item.spoken)}>
        ðŸ”Š Play audio
      </button>
      <p className="card text-lg leading-loose">
        {shown.map((w, k) => (
          <button
            key={k}
            disabled={checked}
            onClick={() =>
              setPicked((p) => {
                const n = new Set(p);
                if (n.has(k)) n.delete(k);
                else n.add(k);
                return n;
              })
            }
            className={`rounded px-0.5 mr-1 ${
              checked
                ? wrong.has(k)
                  ? picked.has(k)
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-300 text-black"
                  : picked.has(k)
                    ? "bg-rose-500 text-white"
                    : ""
                : picked.has(k)
                  ? "bg-yellow-300 text-black"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {w}
          </button>
        ))}
      </p>
      {!checked ? (
        <button
          className="btn-ghost self-start"
          onClick={() => {
            setChecked(true);
            ctx.onScore?.(Math.round((Math.max(0, right - bad) / Math.max(1, wrong.size)) * 100));
          }}
        >
          âœ” Check
        </button>
      ) : (
        <p className="font-bold">
          Found {right} of {wrong.size} Â· Wrong clicks: {bad} Â· Score: {Math.max(0, right - bad)} / {wrong.size}
          <span className="block text-sm font-normal opacity-70">Green = found Â· Yellow = missed Â· Red = wrong click</span>
        </p>
      )}
    </div>
  );
}

export function PteView() {
  const [task, setTask] = useState<TaskId>("ra");
  const t = TASKS.find((x) => x.id === task)!;
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold">ðŸŽ“ PTE Practice</h1>
        <p className="opacity-70">
          Practise PTE Academic-style tasks with timers and instant feedback. These are original practice questions. Scores are estimates to help you
          practise â€” they are not official PTE scores.
        </p>
      </header>
      <MicWarning />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {TASKS.map((x) => (
          <button
            key={x.id}
            onClick={() => setTask(x.id)}
            className={`rounded-2xl p-3 text-left transition ${task === x.id ? "bg-sky-500 text-white shadow-lg" : "bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15"}`}
          >
            <div className="text-2xl">{x.emoji}</div>
            <div className="font-semibold text-sm">{x.name}</div>
            <div className="text-[11px] opacity-70">{x.skill}</div>
          </button>
        ))}
      </div>
      <section className="card">
        <h2 className="text-xl font-bold mb-3">
          {t.emoji} {t.name}
        </h2>
        {task === "ra" && <ReadAloud />}
        {task === "rs" && <RepeatSentence />}
        {task === "di" && <DescribeImage />}
        {task === "asq" && <ShortQuestion />}
        {task === "wfd" && <WriteDictation />}
        {task === "hiw" && <HighlightIncorrect />}
      </section>
    </div>
  );
}
