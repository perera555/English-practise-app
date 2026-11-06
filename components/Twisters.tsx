"use client";

import { useEffect, useRef, useState } from "react";
import { twisterGroups } from "@/lib/twisters";
import { normalize, scoreLabel, scoreSpeech, speak, splitWords, stopSpeaking } from "@/lib/speech";
import { MicWarning, useRecorder } from "./Practice";
import { useCustomContent } from "@/lib/customContent";
import { CameraButton } from "./SelfCam";

const SPEEDS = [
  { rate: 0.7, label: "🐢 Slow" },
  { rate: 1.0, label: "🚶 Normal" },
  { rate: 1.35, label: "🚀 Fast" },
];

/** One tongue twister, karaoke style: words light up at 3 speeds, then the learner tries. */
export function TwisterKaraoke({ text, tip, big = false, onScore }: { text: string; tip?: string; big?: boolean; onScore?: (s: number) => void }) {
  const words = splitWords(text);
  const [word, setWord] = useState(-1);
  const [speed, setSpeed] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<{ score: number; flags: boolean[]; said: string; wps: number } | null>(null);
  const run = useRef(0);
  const { recording, interim, record, stop } = useRecorder();

  useEffect(
    () => () => {
      run.current++;
      stopSpeaking();
    },
    [],
  );

  async function karaoke() {
    const id = ++run.current;
    setPlaying(true);
    setResult(null);
    for (let s = 0; s < SPEEDS.length; s++) {
      if (run.current !== id) return;
      setSpeed(s);
      await speak(text, { rate: SPEEDS[s].rate, onWord: (w) => run.current === id && setWord(w) });
      await new Promise((r) => setTimeout(r, 350));
    }
    if (run.current !== id) return;
    setSpeed(-1);
    setWord(-1);
    setPlaying(false);
  }

  function halt() {
    run.current++;
    stopSpeaking();
    setPlaying(false);
    setSpeed(-1);
    setWord(-1);
  }

  async function myTurn() {
    if (recording) return stop();
    halt();
    const t0 = Date.now();
    const said = await record();
    const secs = Math.max(0.5, (Date.now() - t0) / 1000 - 0.8);
    const r = scoreSpeech(text, said);
    const wps = Math.round((normalize(said).length / secs) * 10) / 10;
    setResult({ ...r, said, wps });
    onScore?.(r.score);
  }

  return (
    <div className={`rounded-3xl ${big ? "bg-gradient-to-b from-indigo-950 to-purple-950 text-white p-6" : "border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4"} flex flex-col gap-3`}>
      {speed >= 0 && (
        <span className="self-start rounded-full bg-yellow-300 text-black text-xs font-bold px-2.5 py-0.5">
          {SPEEDS[speed].label} · round {speed + 1}/3
        </span>
      )}
      <p className={`${big ? "text-3xl sm:text-4xl" : "text-xl"} font-bold leading-snug`}>
        {words.map((w, i) => {
          const lit = speed >= 0 && i <= word;
          const now = speed >= 0 && i === word;
          return (
            <span
              key={i}
              className={`transition-colors duration-100 ${
                now
                  ? "text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]"
                  : lit
                    ? big
                      ? "text-pink-300"
                      : "text-sky-500"
                    : result
                      ? result.flags[i]
                        ? "text-emerald-500"
                        : "text-rose-500 underline decoration-wavy"
                      : ""
              }`}
            >
              {w}{" "}
            </span>
          );
        })}
      </p>
      {tip && <p className={`text-sm ${big ? "opacity-80" : "opacity-60"}`}>💡 {tip}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {!playing ? (
          <button className="btn-primary" onClick={karaoke}>
            🎤 Karaoke ×3 speeds
          </button>
        ) : (
          <button className="btn-danger" onClick={halt}>
            ■ Stop
          </button>
        )}
        <button className={big ? "btn-ghost !bg-white/15 !text-white" : "btn-ghost"} onClick={() => { halt(); void speak(text, { rate: 0.6, onWord: setWord }).then(() => setWord(-1)); setSpeed(0); }}>
          🐢 Extra slow
        </button>
        <button className={recording ? "btn-danger animate-pulse" : "btn-primary !bg-fuchsia-500 hover:!bg-fuchsia-600"} onClick={myTurn}>
          {recording ? "■ Done" : "🗣️ My turn"}
        </button>
        {big && <CameraButton className="btn-ghost !bg-white/15 !text-white" />}
        {result && (
          <span className={`font-bold ${scoreLabel(result.score).color}`}>
            {result.score}% · {result.wps} words/sec {result.wps >= 3 && result.score >= 80 ? "🔥 Speed master!" : ""}
          </span>
        )}
      </div>
      {recording && <p className="text-sm text-fuchsia-400">Listening… {interim}</p>}
      {result && !recording && <p className="text-xs opacity-70">You said: “{result.said || "(nothing heard)"}”</p>}
    </div>
  );
}

/** Browse all twisters by sound. */
export function TwisterBrowser() {
  const custom = useCustomContent();
  const groups = custom.twisters.length
    ? [
        ...twisterGroups,
        { id: "new", sound: "New ✨", emoji: "🆕", tip: "Fresh tongue twisters added by our team.", items: custom.twisters.map((t) => t.text) },
      ]
    : twisterGroups;
  const [g, setG] = useState(twisterGroups[0].id);
  const group = groups.find((x) => x.id === g) ?? groups[0];
  return (
    <div className="flex flex-col gap-4">
      <MicWarning />
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {groups.map((x) => (
          <button key={x.id} onClick={() => setG(x.id)} className={`shrink-0 ${g === x.id ? "btn-primary" : "btn-ghost"}`}>
            {x.emoji} {x.sound} <span className="opacity-60 text-xs">({x.items.length})</span>
          </button>
        ))}
      </div>
      <p className="rounded-2xl bg-sky-500/10 px-4 py-2 text-sm">
        {group.emoji} <b>{group.sound}</b>: {group.tip}
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        {group.items.map((t) => (
          <TwisterKaraoke key={t} text={t} />
        ))}
      </div>
    </div>
  );
}
