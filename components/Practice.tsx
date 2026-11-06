"use client";

import { useEffect, useRef, useState } from "react";
import type { Question, Scene as SceneT, Vocab } from "@/lib/types";
import { listen, normalize, scoreLabel, scoreSpeech, speak, splitWords, stopSpeaking } from "@/lib/speech";
import { useMicSupport } from "./Karaoke";
import { Scene } from "./Scene";
import { CameraButton } from "./SelfCam";

/* ---------- Mic hook: record one answer and score it ---------- */

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const stopRef = useRef<() => void>(() => {});
  useEffect(() => () => stopRef.current(), []);

  async function record(continuous = false): Promise<string> {
    stopSpeaking();
    setInterim("");
    setRecording(true);
    const h = listen({ onInterim: setInterim, continuous });
    stopRef.current = h.stop;
    try {
      return await h.result;
    } catch {
      return "";
    } finally {
      setRecording(false);
    }
  }
  return { recording, interim, record, stop: () => stopRef.current() };
}

export function MicWarning() {
  const ok = useMicSupport();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);
  if (ok || !ready) return null;
  return (
    <p className="rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 px-3 py-2 text-sm">
      🎤 Speaking practice needs <b>Google Chrome</b> or <b>Microsoft Edge</b> with microphone permission.
    </p>
  );
}

/* ---------- One sentence: listen, repeat, score ---------- */

export function RepeatLine({
  text,
  label,
  hideText = false,
  onScore,
}: {
  text: string;
  label?: string;
  hideText?: boolean;
  onScore?: (score: number) => void;
}) {
  const { recording, interim, record, stop } = useRecorder();
  const [result, setResult] = useState<{ said: string; score: number; flags: boolean[] } | null>(null);
  const [word, setWord] = useState(-1);
  const [show, setShow] = useState(!hideText);
  const words = splitWords(text);

  async function go() {
    if (recording) return stop();
    const said = await record();
    const r = scoreSpeech(text, said);
    setResult({ said, ...r });
    setShow(true);
    onScore?.(r.score);
  }

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3 flex flex-col gap-2">
      {label && <span className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</span>}
      <p className={`text-lg leading-relaxed ${show ? "" : "blur-sm select-none"}`}>
        {words.map((w, i) => (
          <span
            key={i}
            className={
              i === word
                ? "bg-yellow-300 text-black rounded px-0.5"
                : result
                  ? result.flags[i]
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500 underline decoration-wavy"
                  : ""
            }
          >
            {w}{" "}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-ghost" onClick={() => speak(text, { onWord: setWord })}>
          🔊 Listen
        </button>
        <button className="btn-ghost" onClick={() => speak(text, { rate: 0.65, onWord: setWord })}>
          🐢 Slow
        </button>
        <button className={recording ? "btn-danger animate-pulse" : "btn-primary"} onClick={go}>
          {recording ? "■ Stop" : "🎤 Say it"}
        </button>
        {!show && (
          <button className="btn-ghost" onClick={() => setShow(true)}>
            👀 Show text
          </button>
        )}
        {result && (
          <span className={`font-bold ${scoreLabel(result.score).color}`}>
            {result.score}% {scoreLabel(result.score).text}
          </span>
        )}
      </div>
      {recording && <p className="text-sm text-fuchsia-600 dark:text-fuchsia-300">Listening… {interim}</p>}
      {result && !recording && <p className="text-xs opacity-70">You said: “{result.said || "(nothing heard — try again closer to the mic)"}”</p>}
    </div>
  );
}

/* ---------- Vocabulary picture cards ---------- */

export function VocabCards({ vocab, onDone }: { vocab: Vocab[]; onDone?: () => void }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const { recording, record } = useRecorder();
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (Object.keys(flipped).length === vocab.length) onDone?.();
  }, [flipped, vocab.length, onDone]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {vocab.map((v, i) => (
        <div
          key={v.word}
          className="card p-3 flex flex-col items-center text-center gap-2 cursor-pointer hover:-translate-y-0.5 transition"
          onClick={() => {
            setFlipped((f) => ({ ...f, [i]: true }));
            speak(`${v.word}. ${v.meaning}.`);
          }}
        >
          <div className="text-5xl">{v.emoji}</div>
          <div className="font-bold text-lg">{v.word}</div>
          <div className={`text-sm opacity-80 ${flipped[i] ? "" : "blur-[3px]"}`}>{v.meaning}</div>
          <button
            className={`text-xs rounded-full px-2.5 py-1 ${recording && active === i ? "bg-red-500 text-white animate-pulse" : "bg-black/5 dark:bg-white/10"}`}
            onClick={async (e) => {
              e.stopPropagation();
              setActive(i);
              const said = await record();
              setScores((s) => ({ ...s, [i]: scoreSpeech(v.word, said).score }));
            }}
          >
            🎤 Say it
          </button>
          {scores[i] !== undefined && <span className={`text-xs font-bold ${scoreLabel(scores[i]).color}`}>{scores[i]}%</span>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Multiple-choice quiz ---------- */

export function Quiz({ questions, onDone }: { questions: Question[]; onDone?: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const doneCount = Object.keys(answers).length;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;

  useEffect(() => {
    if (doneCount === questions.length) onDone?.(correct);
  }, [doneCount, questions.length, correct, onDone]);

  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, i) => (
        <div key={i} className="rounded-2xl border border-black/5 dark:border-white/10 p-3 bg-white/70 dark:bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">
              {i + 1}. {q.q}
            </span>
            <button className="text-sm opacity-60 hover:opacity-100" onClick={() => speak(q.q)} aria-label="Hear the question">
              🔊
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o, oi) => {
              const picked = answers[i] === oi;
              const show = answers[i] !== undefined;
              return (
                <button
                  key={oi}
                  disabled={show}
                  onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                  className={`rounded-xl px-3 py-1.5 border transition ${
                    show && oi === q.answer
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : picked
                        ? "bg-rose-500 text-white border-rose-500"
                        : "border-black/10 dark:border-white/15 hover:bg-sky-50 dark:hover:bg-white/10"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {doneCount === questions.length && (
        <p className="text-lg font-bold">
          Score: {correct} / {questions.length} {correct === questions.length ? "🏆 Perfect!" : correct > 0 ? "👍" : "🔁 Listen again and retry!"}
        </p>
      )}
    </div>
  );
}

/* ---------- Dictation: listen and type ---------- */

export function Dictation({ sentences, onDone }: { sentences: string[]; onDone?: (average: number) => void }) {
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<null | { score: number; flags: boolean[] }>(null);
  const [total, setTotal] = useState(0);
  const s = sentences[i];

  if (!s)
    return (
      <div className="text-center py-6">
        <div className="text-5xl">🎧</div>
        <p className="text-lg font-bold mt-2">
          Dictation finished! Average: {Math.round(total / sentences.length)}%
        </p>
        <button className="btn-ghost mt-3" onClick={() => { setI(0); setTotal(0); }}>
          🔁 Try again
        </button>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm opacity-70">
        Sentence {i + 1} of {sentences.length}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => speak(s)}>
          🔊 Play
        </button>
        <button className="btn-ghost" onClick={() => speak(s, { rate: 0.65 })}>
          🐢 Play slowly
        </button>
      </div>
      <textarea
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        rows={2}
        placeholder="Type exactly what you hear…"
        className="rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
        disabled={!!checked}
      />
      {!checked ? (
        <button
          className="btn-primary self-start"
          disabled={!typed.trim()}
          onClick={() => {
            const r = scoreSpeech(s, typed);
            setChecked(r);
            setTotal((t) => t + r.score);
          }}
        >
          ✔ Check
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-lg">
            {splitWords(s).map((w, wi) => (
              <span key={wi} className={checked.flags[wi] ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 font-semibold underline"}>
                {w}{" "}
              </span>
            ))}
          </p>
          <p className={`font-bold ${scoreLabel(checked.score).color}`}>
            {checked.score}% — {scoreLabel(checked.score).text}
          </p>
          <button
            className="btn-primary self-start"
            onClick={() => {
              setChecked(null);
              setTyped("");
              if (i + 1 >= sentences.length) onDone?.(Math.round(total / sentences.length));
              setI(i + 1);
            }}
          >
            Next ➜
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Describe the picture (free speaking) ---------- */

export function DescribePicture({
  scene,
  vocab,
  prompt = "Describe this picture. What can you see? What are the people doing?",
  seconds = 40,
  onScore,
  photoKey,
}: {
  photoKey?: string;
  scene: SceneT;
  vocab: Vocab[];
  prompt?: string;
  seconds?: number;
  onScore?: (pct: number) => void;
}) {
  const { recording, interim, record, stop } = useRecorder();
  const [said, setSaid] = useState("");
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(() => {
    if (recording && left <= 0) stop();
  }, [left, recording, stop]);

  const text = recording ? interim : said;
  const wordsSaid = new Set(normalize(text));
  const used = vocab.filter((v) => normalize(v.word).every((w) => wordsSaid.has(w)));
  const count = normalize(text).length;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Scene scene={scene} photoKey={photoKey} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold flex-1">{prompt}</p>
          <CameraButton />
        </div>
        <p className="text-sm opacity-70">Try to speak for {seconds} seconds. Use these words:</p>
        <div className="flex flex-wrap gap-1.5">
          {vocab.map((v) => (
            <span
              key={v.word}
              className={`text-sm rounded-full px-2.5 py-1 ${used.includes(v) ? "bg-emerald-500 text-white" : "bg-black/5 dark:bg-white/10"}`}
            >
              {v.emoji} {v.word}
            </span>
          ))}
        </div>
        <button
          className={recording ? "btn-danger animate-pulse self-start" : "btn-primary self-start"}
          onClick={async () => {
            if (recording) return stop();
            setLeft(seconds);
            const s = await record(true);
            setSaid(s);
            const ws = new Set(normalize(s));
            const usedN = vocab.filter((v) => normalize(v.word).every((w) => ws.has(w))).length;
            onScore?.(Math.round(Math.min(100, normalize(s).length * 2 + (usedN / Math.max(1, vocab.length)) * 40)));
          }}
        >
          {recording ? `■ Stop (${left}s)` : "🎤 Start speaking"}
        </button>
        {text && (
          <div className="rounded-2xl bg-black/5 dark:bg-white/10 p-3">
            <p className="italic">“{text}”</p>
            <p className="text-sm mt-2">
              <b>{count}</b> words · <b>{used.length}</b>/{vocab.length} target words used{" "}
              {count >= 30 ? "🌟 Fluent!" : count >= 15 ? "👍 Good!" : "💪 Try to say more"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
