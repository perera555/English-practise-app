"use client";

import { useSyncExternalStore } from "react";
import type { Level } from "./types";

export type Settings = {
  accent: string; // BCP-47, e.g. en-GB
  voiceURI: string; // "" = automatic
  rate: number; // 0.6 - 1.4
  level: Level;
};

const DEFAULTS: Settings = { accent: "en-GB", voiceURI: "", rate: 0.9, level: "Beginner" };
const KEY = "erp-settings";

let current: Settings = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) current = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* storage blocked */
  }
}

export function getSettings(): Settings {
  load();
  return current;
}

export function updateSettings(patch: Partial<Settings>) {
  load();
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSettings() {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULTS);
}

/* ---------------- Progress ---------------- */

export type Progress = {
  /** chapter id -> list of completed parts */
  done: Record<string, string[]>;
  minutes: number;
  days: string[]; // ISO dates practised
};

const PKEY = "erp-progress";
const EMPTY: Progress = { done: {}, minutes: 0, days: [] };
let progress: Progress = EMPTY;
let ploaded = false;
const plisteners = new Set<() => void>();

function pload() {
  if (ploaded || typeof window === "undefined") return;
  ploaded = true;
  try {
    const raw = localStorage.getItem(PKEY);
    if (raw) progress = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

function psave(next: Progress) {
  progress = next;
  try {
    localStorage.setItem(PKEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  plisteners.forEach((l) => l());
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function markDone(chapterId: string, part: string) {
  pload();
  if (progress.done[chapterId]?.includes(part)) return;
  const parts = new Set(progress.done[chapterId] ?? []);
  parts.add(part);
  const days = progress.days.includes(today()) ? progress.days : [...progress.days, today()].slice(-60);
  psave({ ...progress, done: { ...progress.done, [chapterId]: [...parts] }, days });
}

export function addMinutes(m: number) {
  pload();
  const days = progress.days.includes(today()) ? progress.days : [...progress.days, today()].slice(-60);
  psave({ ...progress, minutes: progress.minutes + m, days });
}

export function useProgress() {
  return useSyncExternalStore(
    (l) => {
      plisteners.add(l);
      return () => plisteners.delete(l);
    },
    () => {
      pload();
      return progress;
    },
    () => EMPTY,
  );
}

export function streak(days: string[]) {
  if (!days.length) return 0;
  const set = new Set(days);
  let n = 0;
  const d = new Date();
  // Count back from today (or yesterday if not practised yet today).
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const PARTS = ["watch", "vocab", "listen", "speak", "talk"] as const;
