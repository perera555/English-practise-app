"use client";

import { useEffect, useRef, useState } from "react";
import type { Line } from "@/lib/types";
import { canListen, listen, scoreLabel, scoreSpeech, speak, splitWords, stopSpeaking } from "@/lib/speech";
import { CameraButton } from "./SelfCam";

type Props = {
  lines: Line[];
  learnerRole?: string;
  /** Called when a new line starts (for animations). */
  onLine?: (index: number, line: Line) => void;
  onFinish?: () => void;
  /** Start with subtitles hidden (listening test). */
  hideSubtitles?: boolean;
  allowRolePlay?: boolean;
  /** Start in role-play mode. */
  startRolePlay?: boolean;
  /** Called with the score each time the learner speaks a line in role-play. */
  onTurn?: (score: number) => void;
};

const SPEAKER_COLORS = [
  "bg-sky-500",
  "bg-fuchsia-500",
  "bg-amber-500",
  "bg-emerald-500",
];

type Turn = { said: string; score: number; flags: boolean[] } | null;

/** True when the browser supports speech recognition (false during SSR). */
export function useMicSupport() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOk(canListen());
  }, []);
  return ok;
}

export function Karaoke({
  lines,
  learnerRole,
  onLine,
  onFinish,
  hideSubtitles = false,
  allowRolePlay = true,
  startRolePlay = false,
  onTurn,
}: Props) {
  const speakers = [...new Set(lines.map((l) => l.speaker))];
  const [current, setCurrent] = useState(-1);
  const [word, setWord] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [subs, setSubs] = useState<"on" | "off">(hideSubtitles ? "off" : "on");
  const [rolePlay, setRolePlay] = useState(startRolePlay);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [turns, setTurns] = useState<Record<number, Turn>>({});
  const [slow, setSlow] = useState(false);
  const runId = useRef(0);
  const stopMic = useRef<() => void>(() => {});
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => () => {
    runId.current++;
    stopSpeaking();
    stopMic.current();
  }, []);

  useEffect(() => {
    lineRefs.current[current]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [current]);

  async function playFrom(start: number, onlyOne = false) {
    const id = ++runId.current;
    stopSpeaking();
    stopMic.current();
    setPlaying(true);
    for (let i = start; i < lines.length; i++) {
      if (runId.current !== id) return;
      const line = lines[i];
      setCurrent(i);
      setWord(-1);
      onLine?.(i, line);
      if (rolePlay && learnerRole && line.speaker === learnerRole && canListen()) {
        setListening(true);
        setInterim("");
        const h = listen({ onInterim: setInterim });
        stopMic.current = h.stop;
        let said = "";
        try {
          said = await h.result;
        } catch {
          said = "";
        }
        setListening(false);
        if (runId.current !== id) return;
        const { score, flags } = scoreSpeech(line.text, said);
        setTurns((t) => ({ ...t, [i]: { said, score, flags } }));
        onTurn?.(score);
        await new Promise((r) => setTimeout(r, 900));
      } else {
        await speak(line.text, {
          slot: speakers.indexOf(line.speaker),
          rate: slow ? 0.7 : 1,
          onWord: (w) => runId.current === id && setWord(w),
        });
        await new Promise((r) => setTimeout(r, 250));
      }
      if (onlyOne) break;
    }
    if (runId.current !== id) return;
    setPlaying(false);
    setWord(-1);
    if (!onlyOne) onFinish?.();
  }

  function stop() {
    runId.current++;
    stopSpeaking();
    stopMic.current();
    setPlaying(false);
    setListening(false);
  }

  const micOk = useMicSupport();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {!playing ? (
          <button className="btn-primary" onClick={() => playFrom(current >= 0 && current < lines.length - 1 ? current : 0)}>
            ▶ {current > 0 && current < lines.length - 1 ? "Continue" : "Play all"}
          </button>
        ) : (
          <button className="btn-danger" onClick={stop}>
            ■ Stop
          </button>
        )}
        <button className="btn-ghost" onClick={() => playFrom(0)}>
          ⏮ Restart
        </button>
        <button className={`btn-ghost ${slow ? "ring-2 ring-sky-400" : ""}`} onClick={() => setSlow((s) => !s)}>
          🐢 Slow {slow ? "on" : "off"}
        </button>
        <button className="btn-ghost" onClick={() => setSubs((s) => (s === "on" ? "off" : "on"))}>
          {subs === "on" ? "🙈 Hide subtitles" : "👀 Show subtitles"}
        </button>
        {allowRolePlay && learnerRole && (
          <button
            className={`btn-ghost ${rolePlay ? "ring-2 ring-fuchsia-400" : ""}`}
            onClick={() => {
              stop();
              setRolePlay((r) => !r);
            }}
            title={micOk ? "" : "Microphone practice needs Chrome or Edge"}
          >
            🎭 Role-play as {learnerRole}: {rolePlay ? "on" : "off"}
          </button>
        )}
        {allowRolePlay && <CameraButton />}
      </div>
      {rolePlay && (
        <p className="text-sm rounded-xl bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 px-3 py-2">
          {micOk
            ? `You are ${learnerRole}. When your line comes, the microphone opens — read the line out loud. The robot plays everyone else.`
            : "Your browser cannot use speech recognition. Please use Google Chrome or Microsoft Edge for microphone practice."}
        </p>
      )}

      <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto pr-1">
        {lines.map((line, i) => {
          const active = i === current;
          const words = splitWords(line.text);
          const isMe = rolePlay && line.speaker === learnerRole;
          const turn = turns[i];
          const hidden = subs === "off" && !(active && isMe);
          return (
            <div
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              onClick={() => playFrom(i, true)}
              className={`group cursor-pointer rounded-2xl border px-3 py-2.5 transition ${
                active
                  ? "border-sky-400 bg-sky-50 dark:bg-sky-950/40 shadow-md scale-[1.01]"
                  : "border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide text-white rounded-full px-2 py-0.5 ${
                    SPEAKER_COLORS[speakers.indexOf(line.speaker) % SPEAKER_COLORS.length]
                  }`}
                >
                  {line.speaker}
                  {isMe && " (you)"}
                </span>
                <span className="text-xs opacity-0 group-hover:opacity-60">▶ tap to hear</span>
                {turn && (
                  <span className={`ml-auto text-xs font-bold ${scoreLabel(turn.score).color}`}>
                    {turn.score}% · {scoreLabel(turn.score).text}
                  </span>
                )}
              </div>
              <p className={`text-lg leading-relaxed ${hidden ? "blur-sm select-none" : ""}`}>
                {words.map((w, wi) => {
                  const sung = active && wi < word;
                  const now = active && wi === word;
                  const missed = turn && !turn.flags[wi];
                  return (
                    <span
                      key={wi}
                      className={`transition-colors duration-150 ${
                        now
                          ? "bg-yellow-300 text-black rounded px-0.5"
                          : sung
                            ? "text-sky-600 dark:text-sky-400 font-semibold"
                            : missed
                              ? "text-rose-500 underline decoration-wavy"
                              : turn
                                ? "text-emerald-600 dark:text-emerald-400"
                                : ""
                      }`}
                    >
                      {w}{" "}
                    </span>
                  );
                })}
              </p>
              {active && listening && (
                <p className="mt-1 text-sm text-fuchsia-600 dark:text-fuchsia-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> Listening… {interim && `“${interim}”`}
                </p>
              )}
              {turn && !listening && (
                <p className="mt-1 text-xs opacity-70">You said: “{turn.said || "(nothing heard)"}”</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
