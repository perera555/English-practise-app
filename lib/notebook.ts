"use client";

import { useSyncExternalStore } from "react";

/** 📒 The learner's notebook: their own notes and saved expressions. Stored on the device (works offline). */
export type Note = { id: string; title: string; body: string; updated: number };
export type Saved = { en: string; meaning: string; si: string; example: string; kind: string; saved: number };
type Book = { notes: Note[]; saved: Saved[] };

const KEY = "erp-notebook-v1";
const EMPTY: Book = { notes: [], saved: [] };
let cache: Book | null = null;
const listeners = new Set<() => void>();

function read(): Book {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}
function write(b: Book) {
  cache = b;
  try {
    localStorage.setItem(KEY, JSON.stringify(b));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function useNotebook(): Book {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null;
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
    read,
    () => EMPTY,
  );
}

export function saveNote(n: { id?: string; title: string; body: string }): string {
  const b = read();
  const id = n.id || `n${Date.now().toString(36)}`;
  const note: Note = { id, title: n.title.trim() || "Untitled note", body: n.body, updated: Date.now() };
  write({ ...b, notes: [note, ...b.notes.filter((x) => x.id !== id)] });
  return id;
}
export function deleteNote(id: string) {
  const b = read();
  write({ ...b, notes: b.notes.filter((x) => x.id !== id) });
}

const savedKey = (x: { en: string; meaning: string }) => `${x.en}|${x.meaning}`;
export function isSaved(b: Book, x: { en: string; meaning: string }) {
  return b.saved.some((s) => savedKey(s) === savedKey(x));
}
export function toggleSaved(x: Omit<Saved, "saved">) {
  const b = read();
  write(
    isSaved(b, x)
      ? { ...b, saved: b.saved.filter((s) => savedKey(s) !== savedKey(x)) }
      : { ...b, saved: [{ ...x, saved: Date.now() }, ...b.saved] },
  );
}

/** Download text as a file (works in the phone app too). */
export function downloadText(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
