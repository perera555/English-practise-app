"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COLLOCATIONS, CONNECTED, FREE_NATIVE, IDIOMS, NATIVE_CONVOS, PHRASAL, REGISTER, SLANG, type Expr, type NativeConvo } from "@/lib/advanced";
import { usePremium } from "@/lib/premium";
import { speak, splitWords } from "@/lib/speech";
import { usePhoto } from "@/lib/photos";
import { Karaoke } from "./Karaoke";
import { ChatBox } from "./ChatBox";
import { MicWarning, RepeatLine } from "./Practice";
import { Scene, photoCredit } from "./Scene";
import { LockBadge } from "./Premium";
import { useWordList } from "@/lib/wordlist";
import { useCustomContent } from "@/lib/customContent";

const TABS = [
  { id: "convos", label: "Native conversations", emoji: "🎬" },
  { id: "words", label: "1,000 Advanced words", emoji: "📚" },
  { id: "idioms", label: "Idioms", emoji: "💡" },
  { id: "phrasal", label: "Phrasal verbs", emoji: "🔗" },
  { id: "speech", label: "How natives speak", emoji: "🗣️" },
  { id: "slang", label: "Slang & informal", emoji: "😎" },
  { id: "colloc", label: "Collocations", emoji: "🧲" },
  { id: "register", label: "Formal vs informal", emoji: "🎩" },
  { id: "quiz", label: "Quiz", emoji: "🧠" },
] as const;
type Tab = (typeof TABS)[number]["id"];

/** Speaks a sentence and highlights the words (karaoke). */
function SayLine({ text, rate = 0.95, className = "" }: { text: string; rate?: number; className?: string }) {
  const [w, setW] = useState(-1);
  return (
    <button className={`text-left ${className}`} onClick={() => speak(text, { rate, onWord: setW }).then(() => setW(-1))}>
      🔊{" "}
      {splitWords(text).map((x, i) => (
        <span key={i} className={i === w ? "bg-yellow-300 text-black rounded px-0.5" : ""}>
          {x}{" "}
        </span>
      ))}
    </button>
  );
}

function Locked() {
  return (
    <Link href="/premium" className="card flex items-center gap-3 opacity-80 hover:opacity-100">
      <span className="text-3xl">🔒</span>
      <span className="flex-1 text-sm">
        <b>More in Premium.</b> Unlock every idiom, phrasal verb, slang word and native conversation.
      </span>
      <span className="btn-primary text-sm">⭐ Premium</span>
    </Link>
  );
}

function ExprCard({ x }: { x: Expr }) {
  const [practise, setPractise] = useState(false);
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <span className="text-3xl">{x.emoji}</span>
        <div className="flex-1">
          <button className="text-xl font-black text-left" onClick={() => speak(x.en, { rate: 0.9 })}>
            🔊 {x.en}
          </button>
          {x.note && <span className="ml-2 text-[11px] rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5">{x.note}</span>}
          <p className="opacity-80">{x.meaning}</p>
          <p className="si text-amber-700 dark:text-amber-300 font-semibold">{x.si}</p>
        </div>
      </div>
      <SayLine text={x.example} className="rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2 italic" />
      <button className="text-xs opacity-60 hover:opacity-100 self-start" onClick={() => setPractise((p) => !p)}>
        🎤 Practise saying it
      </button>
      {practise && <RepeatLine text={x.example} />}
    </div>
  );
}

function ExprList({ items, intro }: { items: Expr[]; intro: string }) {
  const { premium } = usePremium();
  const [q, setQ] = useState("");
  const shown = items.filter((x) => !q || `${x.en} ${x.meaning} ${x.si}`.toLowerCase().includes(q.toLowerCase()));
  const visible = premium ? shown : shown.slice(0, FREE_NATIVE);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="opacity-70 flex-1">{intro}</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Search"
          className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {visible.map((x) => (
          <ExprCard key={x.en} x={x} />
        ))}
      </div>
      {!premium && shown.length > FREE_NATIVE && <Locked />}
      <p className="text-xs opacity-60">{items.length} expressions</p>
    </div>
  );
}

function ConnectedSpeech() {
  const { premium } = usePremium();
  const list = premium ? CONNECTED : CONNECTED.slice(0, FREE_NATIVE);
  return (
    <div className="flex flex-col gap-3">
      <p className="opacity-70">
        Native speakers join and shorten words when they speak fast. Learn to <b>understand</b> these sounds. When you <b>write</b>, use the full form.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        {list.map((c) => (
          <div key={c.written} className="card flex flex-col gap-2">
            <div className="flex items-center gap-2 text-lg">
              <span className="rounded-xl bg-black/5 dark:bg-white/10 px-3 py-1 font-semibold">{c.written}</span>
              <span className="opacity-60">→</span>
              <span className="rounded-xl bg-fuchsia-500 text-white px-3 py-1 font-black">{c.spoken}</span>
            </div>
            <p className="italic">“{c.example}”</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost" onClick={() => speak(c.example, { rate: 0.7 })}>
                🐢 Careful speed
              </button>
              <button className="btn-primary" onClick={() => speak(c.example, { rate: 1.3 })}>
                ⚡ Native speed
              </button>
            </div>
            <p className="text-sm opacity-70">💡 {c.tip}</p>
          </div>
        ))}
      </div>
      {!premium && CONNECTED.length > FREE_NATIVE && <Locked />}
    </div>
  );
}

function Register() {
  return (
    <div className="flex flex-col gap-3">
      <p className="opacity-70">Natives change how they speak depending on who they talk to. Use informal English with friends and formal English at work, in emails and with strangers.</p>
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr] text-xs font-bold uppercase tracking-wide bg-black/5 dark:bg-white/10">
          <div className="p-3">😎 Informal (friends)</div>
          <div className="p-3">🎩 Formal (work, emails)</div>
        </div>
        {REGISTER.map((r) => (
          <div key={r.formal} className="grid grid-cols-[1fr_1fr] border-t border-black/5 dark:border-white/10">
            <div className="p-3">
              <SayLine text={r.informal} rate={1.05} />
            </div>
            <div className="p-3">
              <SayLine text={r.formal} rate={0.9} />
              <p className="si text-xs opacity-70 mt-1">{r.si}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NativeQuiz() {
  const [round, setRound] = useState(0);
  const pool = useMemo(() => [...IDIOMS, ...PHRASAL, ...SLANG], []);
  const qs = useMemo(() => {
    if (!round) return [];
    return [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map((x) => ({ x, options: [x, ...pool.filter((p) => p !== x).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5) }));
  }, [round, pool]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  if (!round || i >= qs.length) {
    return (
      <div className="card flex flex-col items-center text-center gap-3 py-8">
        <p className="text-5xl">{!round ? "🧠" : score >= 8 ? "🏆" : "💪"}</p>
        {round > 0 && (
          <p className="text-2xl font-black">
            Score: {score} / {qs.length}
          </p>
        )}
        <p className="opacity-70">What does it mean? 10 questions on idioms, phrasal verbs and slang.</p>
        <button
          className="btn-primary text-lg px-6 py-3"
          onClick={() => {
            setRound((r) => r + 1);
            setI(0);
            setScore(0);
            setPicked(null);
          }}
        >
          ▶ {!round ? "Start quiz" : "Play again"}
        </button>
      </div>
    );
  }
  const q = qs[i];
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex justify-between text-sm opacity-70">
        <span>
          {i + 1} / {qs.length}
        </span>
        <span>Score: {score}</span>
      </div>
      <button className="text-3xl font-black text-left" onClick={() => speak(q.x.en)}>
        {q.x.emoji} “{q.x.en}”
      </button>
      <p className="italic opacity-70">{q.x.example}</p>
      <div className="grid gap-2">
        {q.options.map((o) => {
          const right = o === q.x;
          const show = picked !== null;
          return (
            <button
              key={o.en}
              disabled={show}
              onClick={() => {
                setPicked(o.en);
                if (right) setScore((s) => s + 1);
              }}
              className={`rounded-2xl px-4 py-3 text-left border ${
                show && right ? "bg-emerald-500 text-white border-emerald-500" : show && picked === o.en ? "bg-rose-500 text-white border-rose-500" : "border-black/10 dark:border-white/15 hover:bg-sky-50 dark:hover:bg-white/10"
              }`}
            >
              {o.meaning} <span className="si block text-sm opacity-80">{o.si}</span>
            </button>
          );
        })}
      </div>
      {picked && (
        <button
          className="btn-primary self-end"
          onClick={() => {
            setPicked(null);
            setI(i + 1);
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}

const convoScene = (c: NativeConvo) => ({
  sky: ["#1e1b4b", "#7c3aed"] as [string, string],
  ground: "#312e81",
  items: [
    { e: c.emoji, x: 50, y: 30, s: 6 },
    { e: "🧑", x: 28, y: 60, s: 5 },
    { e: "👩", x: 72, y: 60, s: 5 },
  ],
});

function Conversations() {
  const { premium } = usePremium();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {NATIVE_CONVOS.map((c) => (
        <Link key={c.id} href={`/native/${c.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 transition">
          <Scene scene={convoScene(c)} label={c.title} photoKey={`native:${c.id}`} className="rounded-2xl shadow-none" />
          <div className="flex items-start gap-2">
            <span className="text-2xl">{c.emoji}</span>
            <div className="flex-1">
              <div className="text-xs font-semibold opacity-60">
                Conversation {c.n} · {c.setting}
              </div>
              <div className="font-bold">{c.title}</div>
              <div className="text-xs opacity-70">{c.expressions.length} native expressions</div>
            </div>
            {!premium && <LockBadge free={c.n === 1} />}
          </div>
        </Link>
      ))}
    </div>
  );
}

/** The 1,000 most useful Advanced (C1) words from the 5,000-word list. */
function AdvancedWords() {
  const { premium } = usePremium();
  const all = useWordList();
  const custom = useCustomContent();
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(60);
  const [open, setOpen] = useState<string | null>(null);
  const list = all.filter((x) => x.l === 5).slice(0, 1000);
  const filtered = list.filter((x) => !q || x.w.includes(q.toLowerCase()) || x.d.toLowerCase().includes(q.toLowerCase()));
  const visible = premium ? filtered.slice(0, shown) : filtered.slice(0, 40);
  if (!all.length) return <p className="card opacity-70">Loading words…</p>;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="opacity-70 flex-1">
          The 1,000 most useful advanced words natives use in news, work and university. Tap a word to hear it; open it in the Dictionary for the full entry.
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Search"
          className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {visible.map((x) => {
          const si = custom.si?.[x.w] || x.s;
          return (
            <button
              key={x.w}
              className={`card p-3 text-left flex flex-col gap-0.5 ${open === x.w ? "ring-2 ring-violet-400" : ""}`}
              onClick={() => {
                setOpen(open === x.w ? null : x.w);
                speak(x.w);
              }}
            >
              <span className="font-black text-lg">🔊 {x.w}</span>
              {si && <span className="si text-sm opacity-80">{si}</span>}
              {open === x.w && (
                <>
                  {x.d && <span className="text-xs opacity-80">{x.d}</span>}
                  <Link href={`/dictionary?w=${encodeURIComponent(x.w)}`} className="text-xs text-violet-600 font-semibold mt-1" onClick={(e) => e.stopPropagation()}>
                    📖 Full entry →
                  </Link>
                </>
              )}
            </button>
          );
        })}
      </div>
      {premium && filtered.length > shown && (
        <button className="btn-ghost self-center" onClick={() => setShown(shown + 60)}>
          Show more ({filtered.length - shown} left)
        </button>
      )}
      {!premium && <Locked />}
    </div>
  );
}

function NativeHero() {
  const photo = usePhoto("native:hero");
  return (
    <section className="relative overflow-hidden rounded-4xl text-white min-h-60 flex shadow-[0_24px_50px_-18px_rgba(124,58,237,0.7)]">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-violet-600 to-fuchsia-700" />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-violet-950/90 via-violet-900/60 to-transparent" />
      <div className="relative p-6 sm:p-8 flex flex-col justify-center gap-2 max-w-2xl">
        <span className="self-start rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold ring-1 ring-white/30">🎓 Advanced · C1–C2</span>
        <h1 className="text-4xl sm:text-5xl font-black drop-shadow-lg">Native English</h1>
        <p className="text-white/90">
          Sound natural, not like a textbook. Idioms, phrasal verbs, slang and real fast speech, with meanings in English and <span className="si">සිංහල</span>.
        </p>
      </div>
      {photo && (
        <a href={photo.pageUrl} target="_blank" rel="noreferrer" className="absolute top-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[9px] text-white/80">
          📷 {photoCredit(photo)}
        </a>
      )}
    </section>
  );
}

export function NativeHub() {
  const [tab, setTab] = useState<Tab>("convos");
  return (
    <div className="flex flex-col gap-5">
      <NativeHero />
      <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((t) => (
          <button key={t.id} className={`shrink-0 ${tab === t.id ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>
      <MicWarning />
      {tab === "convos" && <Conversations />}
      {tab === "words" && <AdvancedWords />}
      {tab === "idioms" && <ExprList items={IDIOMS} intro="Idioms are phrases whose meaning is different from the words. Natives use them every day." />}
      {tab === "phrasal" && <ExprList items={PHRASAL} intro="A verb + a small word (up, off, out…) makes a new meaning. They're everywhere in spoken English." />}
      {tab === "speech" && <ConnectedSpeech />}
      {tab === "slang" && <ExprList items={SLANG} intro="Casual words natives use with friends. The badge shows where they're used most." />}
      {tab === "colloc" && <ExprList items={COLLOCATIONS} intro="Words that naturally go together. Natives say “make a mistake”, never “do a mistake”." />}
      {tab === "register" && <Register />}
      {tab === "quiz" && <NativeQuiz />}
    </div>
  );
}

/* ---------------- One native conversation ---------------- */

export function NativeConvoView({ convo }: { convo: NativeConvo }) {
  const [mode, setMode] = useState<"listen" | "roleplay" | "talk">("listen");
  const i = NATIVE_CONVOS.indexOf(convo);
  const next = NATIVE_CONVOS[i + 1];
  return (
    <div className="flex flex-col gap-5">
      <Link href="/native" className="text-sm opacity-60 hover:opacity-100">
        ← Native English
      </Link>
      <div className="relative">
        <Scene scene={convoScene(convo)} label={convo.title} photoKey={`native:${convo.id}`} className="aspect-21/9 max-h-80" />
        <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-linear-to-t from-black/80 to-transparent p-5 text-white pointer-events-none">
          <p className="text-sm font-semibold opacity-90">
            🎓 Native conversation {convo.n} · {convo.setting}
          </p>
          <h1 className="text-2xl sm:text-4xl font-black drop-shadow">
            {convo.emoji} {convo.title}
          </h1>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto no-scrollbar">
        <button className={mode === "listen" ? "btn-primary" : "btn-ghost"} onClick={() => setMode("listen")}>
          🎧 Listen at native speed
        </button>
        <button className={mode === "roleplay" ? "btn-primary" : "btn-ghost"} onClick={() => setMode("roleplay")}>
          🎭 Role-play as {convo.learnerRole}
        </button>
        <button className={mode === "talk" ? "btn-primary" : "btn-ghost"} onClick={() => setMode("talk")}>
          🤖 Talk like a native
        </button>
      </nav>

      {mode === "listen" && (
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
          <div className="card">
            <p className="text-sm opacity-70 mb-3">Natives speak fast. Listen first, then turn on 🐢 Slow if you need it. Tap a line to replay it.</p>
            <Karaoke lines={convo.lines} allowRolePlay={false} />
          </div>
          <div className="card flex flex-col gap-2">
            <h2 className="font-bold text-lg">💡 Native expressions in this conversation</h2>
            {convo.expressions.map((x) => (
              <div key={x.en} className="rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2">
                <button className="font-bold text-left" onClick={() => speak(x.en)}>
                  🔊 {x.en}
                </button>
                <p className="text-sm opacity-80">{x.meaning}</p>
                <p className="si text-sm text-amber-700 dark:text-amber-300">{x.si}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {mode === "roleplay" && (
        <section className="card flex flex-col gap-3">
          <MicWarning />
          <p className="text-sm opacity-70">
            You are <b>{convo.learnerRole}</b>. Press Play; when it&apos;s your line, say it like a native: fast, relaxed and with the idioms.
          </p>
          <Karaoke lines={convo.lines} learnerRole={convo.learnerRole} startRolePlay />
        </section>
      )}

      {mode === "talk" && (
        <section className="flex flex-col gap-3">
          <p className="text-sm opacity-70">The robot talks like a native and uses idioms. Try to use the expressions from this conversation in your answers.</p>
          <ChatBox
            robot={convo.robot}
            opener={convo.opener}
            topic={`${convo.title} (advanced, native English with idioms)`}
            vocab={convo.expressions.map((x) => ({ word: x.en, emoji: "💡", meaning: x.meaning }))}
            questions={[convo.opener]}
          />
        </section>
      )}

      {next && (
        <Link href={`/native/${next.id}`} className="btn-primary self-end">
          Next: {next.title} →
        </Link>
      )}
    </div>
  );
}
