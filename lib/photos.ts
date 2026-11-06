"use client";

import { useEffect, useSyncExternalStore } from "react";
import { apiUrl } from "./api";

import { BUNDLED_PHOTOS } from "./bundledPhotos";

export type PhotoInfo = {
  url: string;
  photographer: string;
  photographerUrl: string;
  pageUrl: string;
  alt: string;
  /** Where the photo comes from (for the credit line). */
  source?: "pexels" | "commons";
  license?: string;
};

/** Real photos bundled inside the app (work offline). */
function bundled(key: string): PhotoInfo | undefined {
  const b = BUNDLED_PHOTOS[key];
  return b && { url: b.src, photographer: b.author, photographerUrl: b.sourceUrl, pageUrl: b.sourceUrl, alt: "", source: "commons", license: b.license };
}

const KEY = "erp-photos";
let map: Record<string, PhotoInfo> = {};
let loaded = false;
let fetchedAll = false;
const asked = new Set<string>();
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    map = JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    map = {};
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

async function fetchAll() {
  if (fetchedAll) return;
  fetchedAll = true;
  try {
    const res = await fetch(apiUrl("/api/photos"));
    if (res.ok) {
      map = { ...map, ...(await res.json()) };
      save();
    }
  } catch {
    /* offline */
  }
}

async function fetchOne(key: string) {
  if (asked.has(key)) return;
  asked.add(key);
  await fetchAll();
  if (map[key]) return;
  try {
    const res = await fetch(apiUrl(`/api/photos?key=${encodeURIComponent(key)}`));
    if (res.ok) {
      map = { ...map, [key]: await res.json() };
      save();
    }
  } catch {
    /* offline */
  }
}

const EMPTY: Record<string, PhotoInfo> = {};

/** The real photo for a picture key, or undefined (then the drawn picture is shown). */
export function usePhoto(key?: string) {
  const all = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return map;
    },
    () => EMPTY,
  );
  useEffect(() => {
    if (!key) return;
    // Bundled photo? Only check for an admin replacement (no per-photo search needed).
    if (BUNDLED_PHOTOS[key]) void fetchAll();
    else void fetchOne(key);
  }, [key]);
  if (!key) return undefined;
  // Admin-chosen photo first, then the photo bundled in the app.
  return all[key] ?? bundled(key);
}
