"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { deleteNote, downloadText, saveNote, toggleSaved, useNotebook, type Note } from "@/lib/notebook";
import { ALL_IDIOMS } from "@/lib/idioms";
import { ALL_PHRASAL } from "@/lib/phrasal";
import { speak } from "@/lib/speech";
import { useUrlTab } from "@/lib/useUrlTab";

type Row = { en: string; meaning: string; si: string; example: string };
type Sheet = { title: string; subtitle?: string; rows?: Row[]; notes?: Note[] };

const TABS = [
  { id: "notes", label: "My notes", emoji: "✍️" },
  { id: "saved", label: "Saved", emoji: "⭐" },
  { id: "print", label: "Print & PDF", emoji: "🖨️" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const fmtDate = (t: number) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function rowsToText(s: Sheet) {
  const lines = [s.title, s.subtitle ?? "", ""];
  s.rows?.forEach((r, i) => lines.push(`${i + 1}. ${r.en}`, `   ${r.meaning}`, `   ${r.si}`, `   e.g. ${r.example}`, ""));
  s.notes?.forEach((n) => lines.push(`■ ${n.title}  (${fmtDate(n.updated)})`, n.body, ""));
  lines.push("— SpeakUp English");
  return lines.join("\n");
}

/* ---------- The printable page (only visible when printing) ---------- */

function PrintSheet({ sheet, onDone }: { sheet: Sheet; onDone: () => void }) {
  useEffect(() => {
    document.body.classList.add("printing");
    const done = () => {
      document.body.classList.remove("printing");
      onDone();
    };
    window.addEventListener("afterprint", done);
    const t = setTimeout(() => window.print(), 150);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", done);
      document.body.classList.remove("printing");
    };
  }, [onDone]);

  return createPortal(
    <div className="print-sheet">
      <header>
        <h1>{sheet.title}</h1>
        {sheet.subtitle && <p className="sub">{sheet.subtitle}</p>}
        <p className="sub">SpeakUp English · {fmtDate(Date.now())}</p>
      </header>
      {sheet.rows && (
        <ol>
          {sheet.rows.map((r) => (
            <li key={`${r.en}|${r.meaning}`}>
              <b>{r.en}</b> — {r.meaning}
              <div className="si">{r.si}</div>
              <div className="ex">“{r.example}”</div>
            </li>
          ))}
        </ol>
      )}
      {sheet.notes?.map((n) => (
        <section key={n.id} className="note">
          <h2>{n.title}</h2>
          <p className="sub">{fmtDate(n.updated)}</p>
          <div className="body">{n.body}</div>
        </section>
      ))}
    </div>,
    document.body,
  );
}

function SheetButtons({ sheet, onPrint }: { sheet: Sheet; onPrint: (s: Sheet) => void }) {
  const file = sheet.title.replace(/[^\w]+/g, "-").toLowerCase();
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn-primary" onClick={() => onPrint(sheet)}>
        🖨️ Print
      </button>
      <button className="btn-ghost" onClick={() => onPrint(sheet)} title="In the print window, choose “Save as PDF”">
        📄 Save as PDF
      </button>
      <button className="btn-ghost" onClick={() => downloadText(`${file}.txt`, rowsToText(sheet))}>
        ⬇️ Download (.txt)
      </button>
    </div>
  );
}

/* ---------- Notes ---------- */

function NotesTab({ onPrint }: { onPrint: (s: Sheet) => void }) {
  const { notes } = useNotebook();
  const [edit, setEdit] = useState<{ id?: string; title: string; body: string } | null>(null);
  const [q, setQ] = useState("");
  const shown = notes.filter((n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase()));

  if (edit) {
    return (
      <section className="card flex flex-col gap-3">
        <input
          value={edit.title}
          onChange={(e) => setEdit({ ...edit, title: e.target.value })}
          placeholder="Title (e.g. New words from Chapter 5)"
          className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2 text-lg font-bold"
        />
        <textarea
          value={edit.body}
          onChange={(e) => setEdit({ ...edit, body: e.target.value })}
          placeholder="Write your notes here: new words, meanings, sentences, grammar rules…  (English or සිංහල)"
          rows={14}
          className="si rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2 leading-relaxed notebook-paper"
          autoFocus
        />
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-primary"
            onClick={() => {
              saveNote(edit);
              setEdit(null);
            }}
          >
            💾 Save note
          </button>
          <button className="btn-ghost" onClick={() => setEdit(null)}>
            Cancel
          </button>
          {edit.body && (
            <button className="btn-ghost" onClick={() => speak(edit.body)}>
              🔊 Read it to me
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={() => setEdit({ title: "", body: "" })}>
          ➕ New note
        </button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Search notes"
          className="flex-1 min-w-40 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2"
        />
      </div>
      {notes.length > 0 && <SheetButtons sheet={{ title: "My English notes", notes }} onPrint={onPrint} />}
      {shown.length === 0 && (
        <p className="card opacity-70">
          {notes.length ? "No notes match your search." : "No notes yet. Press ➕ New note to write down new words, meanings and sentences."}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        {shown.map((n) => (
          <article key={n.id} className="card flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <h3 className="font-bold text-lg flex-1">📝 {n.title}</h3>
              <span className="text-xs opacity-60">{fmtDate(n.updated)}</span>
            </div>
            <p className="si whitespace-pre-wrap opacity-85 line-clamp-6">{n.body}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <button className="btn-ghost" onClick={() => setEdit({ id: n.id, title: n.title, body: n.body })}>
                ✏️ Edit
              </button>
              <button className="btn-ghost" onClick={() => onPrint({ title: n.title, notes: [n] })}>
                🖨️ Print / PDF
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  if (confirm(`Delete “${n.title}”?`)) deleteNote(n.id);
                }}
              >
                🗑️
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Saved expressions ---------- */

function SavedTab({ onPrint }: { onPrint: (s: Sheet) => void }) {
  const { saved } = useNotebook();
  if (!saved.length)
    return <p className="card opacity-70">Nothing saved yet. Tap “📒 Save” on any idiom or phrasal verb in Native English, and it appears here.</p>;
  return (
    <section className="flex flex-col gap-3">
      <SheetButtons sheet={{ title: "My saved expressions", subtitle: `${saved.length} expressions`, rows: saved }} onPrint={onPrint} />
      <div className="grid md:grid-cols-2 gap-3">
        {saved.map((x) => (
          <div key={`${x.en}|${x.meaning}`} className="card flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <button className="text-lg font-black text-left flex-1" onClick={() => speak(x.en)}>
                🔊 {x.en}
              </button>
              <span className="text-[11px] rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5">{x.kind}</span>
            </div>
            <p className="opacity-80">{x.meaning}</p>
            <p className="si text-amber-700 dark:text-amber-300 font-semibold">{x.si}</p>
            <p className="italic opacity-75">“{x.example}”</p>
            <button className="text-xs opacity-60 hover:opacity-100 self-start" onClick={() => toggleSaved(x)}>
              ✖ Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Print ready-made lists ---------- */

function PrintTab({ onPrint }: { onPrint: (s: Sheet) => void }) {
  const [list, setList] = useState<"idioms" | "phrasal">("idioms");
  const items = list === "idioms" ? ALL_IDIOMS : ALL_PHRASAL;
  const topics = useMemo(() => [...new Set(items.map((x) => x.topic))], [items]);
  const [topic, setTopic] = useState("All");
  const rows = topic === "All" ? items : items.filter((x) => x.topic === topic);
  const name = list === "idioms" ? "Idioms" : "Phrasal verbs";
  return (
    <section className="card flex flex-col gap-3">
      <h2 className="font-bold text-lg">🖨️ Print a word list or save it as PDF</h2>
      <p className="text-sm opacity-70">
        Choose a list, then press Print. To make a PDF, choose <b>“Save as PDF”</b> as the printer in the print window. On a phone, use ⬇️ Download if printing isn&apos;t available.
      </p>
      <div className="flex flex-wrap gap-2">
        <button className={list === "idioms" ? "btn-primary" : "btn-ghost"} onClick={() => (setList("idioms"), setTopic("All"))}>
          💡 Idioms ({ALL_IDIOMS.length})
        </button>
        <button className={list === "phrasal" ? "btn-primary" : "btn-ghost"} onClick={() => (setList("phrasal"), setTopic("All"))}>
          🔗 Phrasal verbs ({ALL_PHRASAL.length})
        </button>
      </div>
      <label className="text-sm flex flex-col gap-1">
        <span className="font-semibold">Topic</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2">
          <option value="All">All ({items.length})</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t} ({items.filter((x) => x.topic === t).length})
            </option>
          ))}
        </select>
      </label>
      <SheetButtons sheet={{ title: `${name}${topic === "All" ? "" : `: ${topic}`}`, subtitle: `${rows.length} items with meanings, Sinhala and examples`, rows }} onPrint={onPrint} />
    </section>
  );
}

export function Notebook() {
  const [tab, setTab] = useUrlTab<Tab>("notes", TABS.map((t) => t.id));
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  const { notes, saved } = useNotebook();

  return (
    <div className="flex flex-col gap-5">
      <header className="rounded-3xl bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 text-white p-6 shadow-xl">
        <p className="text-5xl">📒</p>
        <h1 className="text-3xl font-black">My Notebook</h1>
        <p className="opacity-90">
          Write down new words and sentences, keep the expressions you save, and print everything or save it as a PDF. Your notebook is stored on this device and works offline.
        </p>
        <p className="mt-2 text-sm font-semibold opacity-90">
          ✍️ {notes.length} notes · ⭐ {saved.length} saved
        </p>
      </header>
      <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {TABS.map((t) => (
          <button key={t.id} data-active={tab === t.id} className="pill3d" onClick={() => setTab(t.id)}>
            <span className="icon3d">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>
      {tab === "notes" && <NotesTab onPrint={setSheet} />}
      {tab === "saved" && <SavedTab onPrint={setSheet} />}
      {tab === "print" && <PrintTab onPrint={setSheet} />}
      {sheet && <PrintSheet key={sheet.title + (sheet.rows?.length ?? 0)} sheet={sheet} onDone={closeSheet} />}
    </div>
  );
}
