"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BOOKS, FORMS, bookCount, getBook, type Form, type Sentence } from "@/lib/sentencePatterns";
import { speak } from "@/lib/speech";
import { saveSessionScore, useProgress } from "@/lib/settings";
import { useUrlTab } from "@/lib/useUrlTab";
import { Gate, LockBadge } from "./Premium";
import { MicWarning, RepeatLine } from "./Practice";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const stars = (s?: number) => (s === undefined ? "☆☆☆" : s >= 90 ? "⭐⭐⭐" : s >= 70 ? "⭐⭐☆" : s >= 40 ? "⭐☆☆" : "☆☆☆");
const FORM_STYLE: Record<Form, string> = {
  pos: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  neg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  q: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  nq: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
};
const formOf = (f: Form) => FORMS.find((x) => x.id === f)!;

/* ---------------- Hub ---------------- */

export function PatternsHub() {
  const progress = useProgress();
  const total = BOOKS.reduce((n, b) => n + bookCount(b), 0);
  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-4xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-6 sm:p-8 shadow-xl">
        <p className="text-5xl">🧩</p>
        <h1 className="text-4xl font-black">Sentence Patterns</h1>
        <p className="opacity-90 max-w-2xl">
          {BOOKS.length} pattern books · {total.toLocaleString()} sentences · from 🌱 Beginner to 🎓 Advanced. Every sentence in 4 forms, each with its Sinhala meaning.
        </p>
        <p className="si mt-1 opacity-90">හැම වාක්‍යයක්ම ධනාත්මක, නිෂේධනාත්මක, ප්‍රශ්න සහ නිෂේධනාත්මක ප්‍රශ්න ලෙස, සිංහල තේරුමත් සමඟ.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FORMS.map((f) => (
            <span key={f.id} className="rounded-full bg-white/15 ring-1 ring-white/30 px-3 py-1 text-sm font-bold">
              {f.emoji} {f.label}
            </span>
          ))}
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOOKS.map((b) => {
          const done = b.levels.filter((_, i) => (progress.sessions?.[`sp-${b.id}-${i + 1}`] ?? 0) >= 70).length;
          return (
            <Link key={b.id} href={`/patterns/${b.id}`} className="group rounded-3xl overflow-hidden shadow-lg hover:-translate-y-1 transition bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <div className={`bg-linear-to-br ${b.color} text-white p-5`}>
                <p className="text-4xl">{b.emoji}</p>
                <h2 className="text-2xl font-black">{b.title}</h2>
                <p className="text-sm opacity-90">{b.blurb}</p>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <p className="si text-sm opacity-80">{b.blurbSi}</p>
                <p className="text-sm font-semibold">
                  {bookCount(b).toLocaleString()} sentences · 5 levels
                </p>
                <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-linear-to-r from-emerald-400 to-teal-500" style={{ width: `${(done / 5) * 100}%` }} />
                </div>
                <p className="text-xs opacity-60">{done} / 5 levels passed</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- One book ---------------- */

const LEVEL_TABS = ["l1", "l2", "l3", "l4", "l5"] as const;
type LevelTab = (typeof LEVEL_TABS)[number];

export function BookView({ id }: { id: string }) {
  const book = getBook(id)!;
  const progress = useProgress();
  const [tab, setTab] = useUrlTab<LevelTab>("l1", LEVEL_TABS, "level");
  const li = Math.max(0, LEVEL_TABS.indexOf(tab));
  const level = book.levels[li];
  const bi = BOOKS.findIndex((b) => b.id === id);
  const nextBook = BOOKS[bi + 1];

  return (
    <div className="flex flex-col gap-5">
      <Link href="/patterns" className="text-sm opacity-60 hover:opacity-100">
        ← All sentence patterns
      </Link>
      <div className={`rounded-4xl bg-linear-to-br ${book.color} text-white p-6 shadow-lg`}>
        <p className="text-sm font-semibold opacity-90">
          Book {bi + 1} of {BOOKS.length} · {bookCount(book).toLocaleString()} sentences
        </p>
        <h1 className="text-3xl sm:text-4xl font-black">
          {book.emoji} {book.title}
        </h1>
        <p className="opacity-90">{book.blurb}</p>
        <p className="si opacity-90">{book.blurbSi}</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto no-scrollbar">
        {book.levels.map((l, i) => (
          <button key={i} className={`shrink-0 flex items-center gap-1.5 ${li === i ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab(LEVEL_TABS[i])}>
            {l.title.split(":")[0]} <span className="text-xs">{stars(progress.sessions?.[`sp-${book.id}-${i + 1}`])}</span>
            <LockBadge free={i === 0} />
          </button>
        ))}
      </nav>

      <Gate free={li === 0} what={`${book.title}: ${level.title}`}>
        <LevelView key={`${book.id}-${li}`} bookId={book.id} levelNo={li + 1} />
      </Gate>

      <div className="flex flex-wrap gap-2 justify-end">
        {li < 4 ? (
          <button className="btn-primary" onClick={() => setTab(LEVEL_TABS[li + 1])}>
            Next level: {book.levels[li + 1].title.split(":")[0]} →
          </button>
        ) : nextBook ? (
          <Link href={`/patterns/${nextBook.id}`} className="btn-primary">
            Next book: {nextBook.emoji} {nextBook.title} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function LevelView({ bookId, levelNo }: { bookId: string; levelNo: number }) {
  const level = getBook(bookId)!.levels[levelNo - 1];
  const [form, setForm] = useState<Form | "all">("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(30);
  const [quiz, setQuiz] = useState(0); // 0 = closed, n = quiz run number
  const [say, setSay] = useState<string | null>(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return level.sentences.filter((s) => (form === "all" || s.form === form) && (!t || s.en.toLowerCase().includes(t) || s.si.includes(q.trim())));
  }, [level, form, q]);

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-col gap-3">
        <h2 className="text-2xl font-black">{level.title}</h2>
        <p className="text-lg">💡 {level.tip}</p>
        <p className="si text-amber-700 dark:text-amber-300">{level.tipSi}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {FORMS.map((f) => (
            <div key={f.id} className={`rounded-2xl px-3 py-2 ${FORM_STYLE[f.id]}`}>
              <p className="text-xs font-bold">
                {f.emoji} {f.label} · <span className="si">{f.si}</span>
              </p>
              <p className="font-mono text-sm text-black/80 dark:text-white/90">{level.formula[f.id]}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => setQuiz((n) => n + 1)}>
            📝 Quiz: 20 questions (A B C D)
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              const s = shuffle(level.sentences)[0];
              speak(s.en, { rate: 0.95 });
            }}
          >
            🔊 Random sentence
          </button>
        </div>
      </section>

      {quiz > 0 && (
        <section className="card ring-2 ring-emerald-400 flex flex-col gap-3">
          <div className="flex items-center">
            <h3 className="font-black text-xl flex-1">📝 Quiz: {level.title.split(":")[0]}</h3>
            <button className="btn-ghost" onClick={() => setQuiz(0)}>
              ✕
            </button>
          </div>
          <Quiz
            key={quiz}
            items={form === "all" ? level.sentences : level.sentences.filter((s) => s.form === form)}
            onDone={(pct) => {
              saveSessionScore(`sp-${bookId}-${levelNo}`, pct);
              setQuiz(0);
            }}
          />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[{ id: "all" as const, label: "All", emoji: "📚" }, ...FORMS].map((f) => {
            const n = f.id === "all" ? level.sentences.length : level.sentences.filter((s) => s.form === f.id).length;
            return (
              <button
                key={f.id}
                className={`rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-black/10 dark:ring-white/15 ${form === f.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-white/5"}`}
                onClick={() => {
                  setForm(f.id);
                  setLimit(30);
                }}
              >
                {f.emoji} {f.label} <span className="opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(30);
          }}
          placeholder="🔎 Search English or සිංහල…"
          className="rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-2.5"
        />
        <p className="text-sm opacity-60">
          {list.length} sentences · tap a sentence to hear it · 🎤 to practise saying it
        </p>
        {say && <MicWarning />}
        <div className="flex flex-col gap-2">
          {list.slice(0, limit).map((s, i) => (
            <Row key={s.en} s={s} n={i + 1} saying={say === s.en} onSay={() => setSay(say === s.en ? null : s.en)} />
          ))}
        </div>
        {list.length > limit && (
          <button className="btn-ghost self-center" onClick={() => setLimit((l) => l + 30)}>
            Show more ({list.length - limit} left)
          </button>
        )}
      </section>
    </div>
  );
}

function Row({ s, n, saying, onSay }: { s: Sentence; n: number; saying: boolean; onSay: () => void }) {
  const f = formOf(s.form);
  return (
    <div className="card p-3 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold opacity-50 w-7 pt-1.5 text-right shrink-0">{n}</span>
        <button className="flex-1 text-left" onClick={() => speak(s.en, { rate: 0.95 })}>
          <p className="text-lg font-semibold">
            🔊 {s.before}
            <b className="text-indigo-600 dark:text-indigo-300">{s.answer}</b>
            {s.after}
          </p>
          <p className="si text-amber-700 dark:text-amber-300">{s.si}</p>
        </button>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${FORM_STYLE[s.form]}`} title={f.label}>
            {f.emoji} <span className="hidden sm:inline">{f.label}</span>
          </span>
          <button className="btn-ghost px-2 py-1 text-sm" onClick={onSay} aria-label="Practise saying it">
            🎤
          </button>
        </div>
      </div>
      {saying && <RepeatLine text={s.en} />}
    </div>
  );
}

/* ---------------- Quiz ---------------- */

function Quiz({ items, onDone }: { items: Sentence[]; onDone: (pct: number) => void }) {
  const [qs] = useState(() => shuffle(items).slice(0, 20).map((s) => ({ s, opts: shuffle(s.options) })));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<{ s: Sentence; picked: string }[]>([]);

  if (i >= qs.length) {
    const pct = Math.round((score / qs.length) * 100);
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <p className="text-6xl">{pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : "💪"}</p>
        <p className="text-5xl font-black">
          {score} <span className="text-2xl opacity-60">/ {qs.length}</span>
        </p>
        <p className="text-xl font-bold">
          {pct}% · {stars(pct)}
        </p>
        {wrong.length > 0 && (
          <div className="w-full max-w-xl text-left flex flex-col gap-1.5">
            <p className="font-bold">📝 Review your mistakes</p>
            {wrong.map((w, k) => (
              <button key={k} className="rounded-xl bg-rose-500/10 px-3 py-2 text-left text-sm" onClick={() => speak(w.s.en)}>
                🔊 {w.s.en}
                <span className="si block text-xs opacity-80">{w.s.si}</span>
                <span className="block text-xs opacity-70">
                  You chose “{w.picked}”. Correct: “{w.s.answer}”
                </span>
              </button>
            ))}
          </div>
        )}
        <button className="btn-primary text-lg px-6 py-3" onClick={() => onDone(pct)}>
          Save & continue
        </button>
      </div>
    );
  }

  const { s, opts } = qs[i];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-linear-to-r from-emerald-400 to-teal-500" style={{ width: `${(i / qs.length) * 100}%` }} />
        </div>
        <span className="opacity-70">
          {i + 1}/{qs.length} · ✅ {score}
        </span>
      </div>
      <p className={`self-start rounded-full px-2 py-0.5 text-xs font-bold ${FORM_STYLE[s.form]}`}>
        {formOf(s.form).emoji} {formOf(s.form).label}
      </p>
      <p className="text-2xl font-semibold leading-relaxed">
        {s.before}
        <span className={`inline-block min-w-16 border-b-4 mx-1 text-center ${picked ? (picked === s.answer ? "border-emerald-500 text-emerald-600" : "border-rose-500 text-rose-600") : "border-sky-400"}`}>
          {picked ?? "____"}
        </span>
        {s.after}
      </p>
      <p className="si text-amber-700 dark:text-amber-300">{s.si}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {opts.map((o, k) => (
          <button
            key={o}
            disabled={!!picked}
            onClick={() => {
              setPicked(o);
              if (o === s.answer) setScore((x) => x + 1);
              else setWrong((w) => [...w, { s, picked: o }]);
              speak(s.en, { rate: 0.95 });
            }}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold border text-lg text-left ${
              picked && o === s.answer ? "bg-emerald-500 text-white border-emerald-500" : picked === o ? "bg-rose-500 text-white border-rose-500" : "border-black/10 dark:border-white/15 hover:bg-sky-50 dark:hover:bg-white/10"
            }`}
          >
            <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-black/10 dark:bg-white/15 text-sm font-black">{"ABCD"[k]}</span>
            {o}
          </button>
        ))}
      </div>
      {picked && (
        <div className="flex items-center gap-2">
          <p className="flex-1 font-semibold">
            {picked === s.answer ? <span className="text-emerald-600">✅ Correct! +1 mark</span> : <span className="text-rose-600">❌ The answer is <b>{s.answer}</b></span>}
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              setPicked(null);
              setI(i + 1);
            }}
          >
            {i + 1 < qs.length ? "Next →" : "See my marks"}
          </button>
        </div>
      )}
    </div>
  );
}
