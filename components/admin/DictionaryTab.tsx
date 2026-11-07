"use client";

import { useState } from "react";
import type { CustomContent } from "@/lib/db";
import { setDictSinhala } from "@/lib/adminActions";
import { DICTIONARY } from "@/lib/dictionary";
import { LEVEL_NAMES, useWordList } from "@/lib/wordlist";

type Run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) => void;

/** Admin: add or correct Sinhala meanings for any dictionary word. */
export function DictionaryTab({ content, run }: { content: CustomContent; run: Run }) {
  const words = useWordList();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"missing" | "all" | "edited">("missing");
  const [edit, setEdit] = useState<Record<string, string>>({});
  const admin = content.si ?? {};
  const curated = new Map(DICTIONARY.map((e) => [e.word, e.si]));

  const rows = words
    .filter((x) => !q || x.w.startsWith(q.toLowerCase()))
    .filter((x) => {
      const has = admin[x.w] || curated.get(x.w) || x.s;
      if (filter === "missing") return !has;
      if (filter === "edited") return !!admin[x.w];
      return true;
    })
    .slice(0, 80);

  const missing = words.filter((x) => !(admin[x.w] || curated.get(x.w) || x.s)).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-2">
        <h2 className="font-bold text-lg">📖 Sinhala meanings</h2>
        <p className="text-sm opacity-70">
          {words.length.toLocaleString()} dictionary words · {missing.toLocaleString()} still use automatic translation. Type the correct Sinhala and press 💾. Your
          meaning replaces the automatic one on every phone.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 Find a word"
            className="flex-1 min-w-48 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2"
          />
          {(["missing", "all", "edited"] as const).map((f) => (
            <button key={f} className={filter === f ? "btn-primary" : "btn-ghost"} onClick={() => setFilter(f)}>
              {f === "missing" ? "⚠️ No Sinhala yet" : f === "all" ? "All words" : "✏️ My corrections"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((x) => {
          const current = admin[x.w] || curated.get(x.w) || x.s;
          const value = edit[x.w] ?? admin[x.w] ?? "";
          return (
            <div key={x.w} className="card py-2 flex flex-wrap items-center gap-2">
              <div className="w-40">
                <div className="font-black">{x.w}</div>
                <div className="text-[11px] opacity-60">{LEVEL_NAMES[x.l]}</div>
              </div>
              <div className="flex-1 min-w-40 text-xs opacity-70 line-clamp-2">{x.d || "—"}</div>
              <div className="si w-40 text-sm">{current || <span className="opacity-40">auto</span>}</div>
              <input
                className="si w-48 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-2 py-1.5"
                placeholder="සිංහල තේරුම"
                value={value}
                onChange={(e) => setEdit({ ...edit, [x.w]: e.target.value })}
              />
              <button className="btn-primary min-h-0! py-1.5! text-sm" onClick={() => run(() => setDictSinhala(x.w, value))}>
                💾
              </button>
            </div>
          );
        })}
        {!rows.length && <p className="card opacity-60 text-center">Nothing here.</p>}
      </div>
    </div>
  );
}
