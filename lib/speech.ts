"use client";

import { useEffect, useState } from "react";
import { getSettings } from "./settings";

/* ---------------- Text-to-speech ---------------- */

export function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () =>
      setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en")));
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

function englishVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
}

/** Voice for a speaker slot: slot 0 = chosen voice, others = different English voices. */
export function pickVoice(slot = 0): SpeechSynthesisVoice | undefined {
  const all = englishVoices();
  if (!all.length) return undefined;
  const { voiceURI, accent } = getSettings();
  const preferred =
    all.find((v) => v.voiceURI === voiceURI) ??
    all.find((v) => v.lang.replace("_", "-").toLowerCase() === accent.toLowerCase()) ??
    all[0];
  if (slot === 0) return preferred;
  const sameAccent = all.filter((v) => v !== preferred && v.lang === preferred.lang);
  const others = all.filter((v) => v !== preferred && v.lang !== preferred.lang);
  const pool = [...sameAccent, ...others];
  return pool.length ? pool[(slot - 1) % pool.length] : preferred;
}

export type SpeakOptions = {
  rate?: number;
  slot?: number;
  onWord?: (index: number) => void;
};

/**
 * Speak text and report which word is being spoken (karaoke).
 * Uses real boundary events when the voice supports them, otherwise estimates timing.
 * Resolves when finished or cancelled.
 */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const synth = window.speechSynthesis;
    synth.cancel();

    const words = splitWords(text);
    const starts: number[] = [];
    let pos = 0;
    for (const w of words) {
      const i = text.indexOf(w, pos);
      starts.push(i);
      pos = i + w.length;
    }

    const rate = (opts.rate ?? 1) * getSettings().rate;
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(opts.slot ?? 0);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = getSettings().accent;
    }
    u.rate = Math.min(2, Math.max(0.4, rate));

    let gotBoundary = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;

    const estimate = (i: number) => {
      if (gotBoundary || i >= words.length) return;
      opts.onWord?.(i);
      const ms = ((words[i].length + 1) * 68 + 40) / u.rate;
      timer = setTimeout(() => estimate(i + 1), ms);
    };

    const done = () => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      opts.onWord?.(words.length);
      resolve();
    };

    u.onstart = () => estimate(0);
    u.onboundary = (e) => {
      if (e.name && e.name !== "word") return;
      gotBoundary = true;
      if (timer) clearTimeout(timer);
      let idx = 0;
      for (let k = 0; k < starts.length; k++) if (starts[k] <= e.charIndex) idx = k;
      opts.onWord?.(idx);
    };
    u.onend = done;
    u.onerror = done;

    // Chrome sometimes ignores speak() right after cancel(); a tiny delay fixes it.
    setTimeout(() => synth.speak(u), 60);
    // Safety net in case onend never fires.
    setTimeout(done, Math.max(4000, (text.length * 120) / u.rate + 3000));
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/* ---------------- Speech recognition ---------------- */

type RecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function canListen() {
  return !!getRecognitionCtor();
}

export type ListenHandle = { stop: () => void; result: Promise<string> };

/**
 * Listen to the microphone. `continuous` keeps listening through pauses (for long answers).
 * The promise resolves with the final transcript ("" if nothing was heard).
 */
export function listen(opts: { onInterim?: (text: string) => void; continuous?: boolean } = {}): ListenHandle {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return { stop: () => {}, result: Promise.reject(new Error("unsupported")) };
  const rec = new Ctor();
  rec.lang = getSettings().accent || "en-US";
  rec.interimResults = true;
  rec.continuous = !!opts.continuous;
  rec.maxAlternatives = 1;

  let finalText = "";
  let interim = "";
  const result = new Promise<string>((resolve, reject) => {
    rec.onresult = (e) => {
      interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      opts.onInterim?.((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      reject(new Error(e.error));
    };
    rec.onend = () => resolve((finalText + interim).trim());
  });
  try {
    rec.start();
  } catch {
    /* already started */
  }
  return { stop: () => rec.stop(), result };
}

/* ---------------- Pronunciation scoring ---------------- */

const NUMBERS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
  "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten", "12": "twelve",
  "15": "fifteen", "20": "twenty", "100": "hundred",
};

export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => NUMBERS[w] ?? w);
}

/** Compare what was said with the target. Returns per-word match flags and a 0-100 score. */
export function scoreSpeech(target: string, said: string) {
  const t = normalize(target);
  const s = normalize(said);
  // Longest common subsequence to align words.
  const dp = Array.from({ length: t.length + 1 }, () => new Array<number>(s.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = s.length - 1; j >= 0; j--)
      dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const matched = new Array<boolean>(t.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < t.length && j < s.length) {
    if (t[i] === s[j]) {
      matched[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const hits = matched.filter(Boolean).length;
  const extra = Math.max(0, s.length - hits);
  const score = t.length ? Math.round(Math.max(0, (hits - extra * 0.25) / t.length) * 100) : 0;

  // Map normalized flags back onto the display words.
  const display = splitWords(target);
  const flags: boolean[] = [];
  let k = 0;
  for (const w of display) {
    const n = normalize(w).length;
    flags.push(n === 0 ? true : matched.slice(k, k + n).every(Boolean));
    k += n;
  }
  return { score, flags };
}

export function scoreLabel(score: number) {
  if (score >= 90) return { text: "Excellent! 🌟", color: "text-emerald-500" };
  if (score >= 70) return { text: "Great job! 👍", color: "text-lime-500" };
  if (score >= 50) return { text: "Good try! Keep going 💪", color: "text-amber-500" };
  return { text: "Try again 🔁", color: "text-rose-500" };
}
