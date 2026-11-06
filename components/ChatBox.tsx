"use client";

import { useEffect, useRef, useState } from "react";
import type { Vocab } from "@/lib/types";
import { listen, speak, splitWords, stopSpeaking } from "@/lib/speech";
import { offlineReply, type ChatMsg } from "@/lib/offlineBot";
import { addMinutes, useSettings } from "@/lib/settings";
import { useMicSupport } from "./Karaoke";
import Link from "next/link";
import { getUserId } from "@/lib/premium";
import { apiUrl } from "@/lib/api";
import { CameraButton } from "./SelfCam";

type Props = {
  robot: string;
  opener: string;
  topic: string;
  vocab?: Vocab[];
  questions?: string[];
  /** 0 = free chat. Otherwise a timed session (minutes). */
  sessionMinutes?: number;
  onSessionEnd?: () => void;
};

const STAGES = [
  { id: "warmup", name: "Warm-up", from: 0, emoji: "👋", hint: "Answer easy questions about yourself." },
  { id: "roleplay", name: "Role-play", from: 0.15, emoji: "🎭", hint: "Act out the situation with the robot." },
  { id: "freetalk", name: "Free talk", from: 0.6, emoji: "💬", hint: "Give your opinions. Use full sentences!" },
  { id: "review", name: "Feedback", from: 0.9, emoji: "📝", hint: "Read your feedback and corrections." },
] as const;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ChatBox({ robot, opener, topic, vocab = [], questions = [], sessionMinutes = 0, onSessionEnd }: Props) {
  const settings = useSettings();
  const micOk = useMicSupport();
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: opener }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [locked, setLocked] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recording, setRecording] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(-1);
  const [wordIdx, setWordIdx] = useState(-1);
  const [error, setError] = useState("");
  const stopRec = useRef<() => void>(() => {});
  const scroller = useRef<HTMLDivElement>(null);

  // Session timer
  const total = sessionMinutes * 60;
  const [started, setStarted] = useState(sessionMinutes === 0);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const stageRef = useRef<string>("");
  const frac = total ? elapsed / total : 0;
  const stage = total ? [...STAGES].reverse().find((s) => frac >= s.from)! : null;

  useEffect(() => {
    if (!total || !started || ended) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [total, started, ended]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(
    () => () => {
      stopSpeaking();
      stopRec.current();
    },
    [],
  );

  function say(text: string, idx: number) {
    const clean = text.replace(/✏️ Better:.*\n?/g, "").replace(/[*_#]/g, "");
    setSpeakingIdx(idx);
    speak(clean, { slot: 1, onWord: setWordIdx }).then(() => {
      setSpeakingIdx((s) => (s === idx ? -1 : s));
    });
  }

  async function send(text: string, stageOverride?: string, hidden = false) {
    const content = text.trim();
    if (!content || busy) return;
    stopSpeaking();
    setError("");
    const next: ChatMsg[] = [...messages, { role: "user", content }];
    if (!hidden) setMessages(next);
    setInput("");
    setBusy(true);
    const stageId = stageOverride ?? stage?.id;
    const idx = (hidden ? messages.length : next.length);
    let reply = "";

    const runOffline = () => {
      reply = offlineReply({ messages: next, topic, vocab, questions, stage: stageId });
      setMessages((m) => [...(hidden ? m : m.slice(0, idx)), { role: "assistant", content: reply }]);
    };

    try {
      if (offline) {
        runOffline();
      } else {
        let res: Response;
        try {
          res = await fetch(apiUrl("/api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, robot, topic, level: settings.level, stage: stageId, userId: getUserId() }),
          });
        } catch {
          // No internet: the offline robot keeps the conversation going.
          res = new Response(JSON.stringify({ offline: true }), { status: 503 });
        }
        if (res.status === 503) {
          const j = await res.json().catch(() => ({}));
          setLocked(!!j.locked);
          setOffline(true);
          runOffline();
        } else if (!res.ok || !res.body) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? "Something went wrong.");
        } else {
          setMessages((m) => [...m, { role: "assistant", content: "" }]);
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            reply += dec.decode(value, { stream: true });
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: "assistant", content: reply };
              return copy;
            });
          }
        }
      }
      if (autoSpeak && reply) say(reply, idx);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  // Tell the robot when the session stage changes.
  useEffect(() => {
    if (!stage || !started || ended) return;
    if (stageRef.current === stage.id) return;
    const prev = stageRef.current;
    stageRef.current = stage.id;
    if (!prev) return;
    if (stage.id === "review") {
      setEnded(true);
      addMinutes(sessionMinutes);
      void send("(The session time is over. Please give me my feedback report now.)", "review", true);
      onSessionEnd?.();
    } else {
      void send(`(Move to the next stage now: ${stage.name}. Start it with a question.)`, stage.id, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id, started, ended]);

  async function toggleMic() {
    if (recording) {
      stopRec.current();
      return;
    }
    stopSpeaking();
    setRecording(true);
    const base = input ? input + " " : "";
    const h = listen({ continuous: true, onInterim: (t) => setInput(base + t) });
    stopRec.current = h.stop;
    try {
      const said = await h.result;
      setInput(base + said);
    } catch {
      setError("Microphone error. Please allow microphone access.");
    } finally {
      setRecording(false);
    }
  }

  function finishEarly() {
    setElapsed(Math.ceil(total * 0.9));
  }

  if (total && !started) {
    return (
      <div className="card flex flex-col items-center text-center gap-4 py-10">
        <div className="text-6xl">⏱️🤖</div>
        <h3 className="text-2xl font-bold">{sessionMinutes}-Minute Conversation Session</h3>
        <p className="max-w-md opacity-80">
          Talk with the robot about <b>{topic}</b>. The session has 4 stages. Speak with the 🎤 button or type.
          At the end you get a feedback report with your mistakes corrected.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl">
          {STAGES.map((s) => (
            <div key={s.id} className="rounded-2xl bg-black/5 dark:bg-white/10 p-3 text-sm">
              <div className="text-2xl">{s.emoji}</div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs opacity-70">{Math.round(s.from * sessionMinutes)} min</div>
            </div>
          ))}
        </div>
        <button className="btn-primary text-lg px-6 py-3" onClick={() => setStarted(true)}>
          ▶ Start {sessionMinutes}-minute session
        </button>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-3 p-0 overflow-hidden">
      {total > 0 && stage && (
        <div className="px-4 pt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stage.emoji}</span>
            <div className="flex-1">
              <div className="font-semibold">
                {stage.name} <span className="font-normal text-sm opacity-70">— {stage.hint}</span>
              </div>
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-sky-500 to-fuchsia-500 transition-all" style={{ width: `${Math.min(100, frac * 100)}%` }} />
              </div>
            </div>
            <span className="font-mono text-lg tabular-nums">{fmt(Math.max(0, total - elapsed))}</span>
            {!ended && (
              <button className="btn-ghost text-xs" onClick={finishEarly}>
                Finish now
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={scroller} className="flex flex-col gap-3 h-[26rem] overflow-y-auto px-4 py-3">
        {messages.map((m, i) => {
          const isBot = m.role === "assistant";
          const lines = m.content.split("\n");
          const correction = lines.filter((l) => l.startsWith("✏️"));
          const rest = lines.filter((l) => !l.startsWith("✏️")).join("\n");
          let wcount = 0;
          return (
            <div key={i} className={`flex gap-2 ${isBot ? "" : "flex-row-reverse"}`}>
              <div className="text-2xl shrink-0">{isBot ? "🤖" : "🧑"}</div>
              <div className={`max-w-[80%] flex flex-col gap-1 ${isBot ? "items-start" : "items-end"}`}>
                {correction.map((c, k) => (
                  <div key={k} className="text-sm rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 px-3 py-1.5">
                    {c}
                  </div>
                ))}
                <div
                  className={`rounded-2xl px-3.5 py-2 whitespace-pre-wrap ${
                    isBot ? "bg-white dark:bg-white/10 shadow-sm rounded-tl-sm" : "bg-sky-500 text-white rounded-tr-sm"
                  }`}
                >
                  {isBot && speakingIdx === i
                    ? rest.split("\n").map((ln, li) => (
                        <span key={li}>
                          {splitWords(ln).map((w, wi) => {
                            const n = wcount++;
                            return (
                              <span key={wi} className={n === wordIdx ? "bg-yellow-300 text-black rounded px-0.5" : n < wordIdx ? "text-sky-600 dark:text-sky-400" : ""}>
                                {w}{" "}
                              </span>
                            );
                          })}
                          {"\n"}
                        </span>
                      ))
                    : rest || (busy && i === messages.length - 1 ? "…" : "")}
                </div>
                {isBot && rest && (
                  <button className="text-xs opacity-60 hover:opacity-100" onClick={() => say(m.content, i)}>
                    🔊 Listen again
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2 items-center opacity-70">
            <span className="text-2xl">🤖</span>
            <span className="animate-pulse">typing…</span>
          </div>
        )}
      </div>

      {error && <p className="px-4 text-sm text-rose-500">{error}</p>}
      {offline &&
        (locked ? (
          <p className="px-4 text-xs">
            🔒 You are using the simple robot. <Link href="/premium" className="font-bold text-sky-600 underline">Go Premium ⭐</Link> to unlock the smart AI robot that
            understands everything you say.
          </p>
        ) : (
          <p className="px-4 text-xs opacity-70">
            🔌 Offline robot mode. For the smart AI robot, add an <code>ANTHROPIC_API_KEY</code> to <code>.env.local</code> (see README).
          </p>
        ))}

      <form
        className="flex items-end gap-2 border-t border-black/5 dark:border-white/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <button
          type="button"
          onClick={toggleMic}
          disabled={!micOk}
          title={micOk ? "Speak" : "Use Chrome or Edge for the microphone"}
          className={`h-11 w-11 shrink-0 rounded-full text-xl grid place-items-center transition ${
            recording ? "bg-red-500 text-white animate-pulse" : "bg-black/5 dark:bg-white/10 hover:bg-black/10"
          } disabled:opacity-40`}
        >
          🎤
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          placeholder={recording ? "Listening… speak now, then tap 🎤 again" : "Type or speak your answer…"}
          className="flex-1 resize-none rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 outline-none focus:ring-2 focus:ring-sky-400"
          disabled={ended && busy}
        />
        <button type="submit" className="btn-primary h-11" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
      <div className="flex items-center gap-3 px-4 pb-3 text-xs opacity-80">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} /> Robot speaks replies
        </label>
        <span>Level: {settings.level}</span>
        <span className="flex-1" />
        <CameraButton className="btn-ghost !min-h-0 !py-1 text-xs" />
      </div>
    </div>
  );
}
