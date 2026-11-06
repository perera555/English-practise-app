"use client";

import { useEffect, useSyncExternalStore } from "react";
import { apiUrl } from "./api";
import type { Lesson, Song, Video } from "./types";

/** Content the admin adds online. Downloaded when online and saved on the device for offline use. */
export type Custom = {
  chapters: Lesson[];
  songs: Song[];
  twisters: { group: string; text: string }[];
  videos: Video[];
  overrides: Record<string, Lesson>;
  hidden: string[];
};

const KEY = "erp-custom-content";
const EMPTY: Custom = { chapters: [], songs: [], twisters: [], videos: [], overrides: {}, hidden: [] };

/** True when the admin removed this built-in item (e.g. "ch:cafe"). */
export function isHidden(c: Custom, key: string) {
  return (c.hidden ?? []).includes(key);
}
let data: Custom = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

let fetched = false;
async function sync() {
  if (fetched) return;
  fetched = true;
  try {
    const res = await fetch(apiUrl("/api/content"));
    if (!res.ok) return;
    const fresh = { ...EMPTY, ...(await res.json()) } as Custom;
    data = fresh;
    try {
      localStorage.setItem(KEY, JSON.stringify(fresh));
    } catch {
      /* storage full */
    }
    listeners.forEach((l) => l());
  } catch {
    /* offline: keep the saved copy */
  }
}

export function useCustomContent() {
  const c = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return data;
    },
    () => EMPTY,
  );
  useEffect(() => {
    void sync();
  }, []);
  return c;
}
