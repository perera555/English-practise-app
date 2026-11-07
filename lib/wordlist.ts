"use client";

import { useEffect, useState } from "react";

/**
 * The 5,000-word list (public/data/words.json), Beginner → Advanced.
 * Built by scripts/build-wordlist.mjs from the New General Service List + NAWL (CC BY-SA 4.0)
 * and Wiktionary (CC BY-SA). Loaded on demand; bundled inside the phone app so it works offline.
 */
export type ListWord = { w: string; l: 1 | 2 | 3 | 4 | 5; d: string; s: string; src: "" | "h" | "w" };

export const LEVEL_NAMES = ["", "Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"] as const;
export const LEVEL_EMOJI = ["", "🌱", "🌿", "🌳", "🏔️", "🎓"] as const;
export const LEVEL_CEFR = ["", "A1", "A2", "B1", "B2", "C1"] as const;

let cache: ListWord[] | null = null;
let loading: Promise<ListWord[]> | null = null;

export function loadWordList(): Promise<ListWord[]> {
  if (cache) return Promise.resolve(cache);
  loading ??= fetch("/data/words.json")
    .then((r) => r.json() as Promise<ListWord[]>)
    .then((list) => (cache = list))
    .catch(() => {
      loading = null;
      return [];
    });
  return loading;
}

export function useWordList() {
  const [list, setList] = useState<ListWord[]>(cache ?? []);
  useEffect(() => {
    if (cache) return;
    void loadWordList().then(setList);
  }, []);
  return list;
}
