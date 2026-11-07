"use client";

import { useUrlTab } from "@/lib/useUrlTab";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DICTIONARY, TOPICS, externalDictionaries, findWord, searchWords, type Entry, type TopicId } from "@/lib/dictionary";
import { fullEntry, guessSyllables, lookupOnline, toSinhala, type FullEntry, type OnlineEntry } from "@/lib/lookup";
import { LEVEL_CEFR, LEVEL_EMOJI, LEVEL_NAMES, useWordList, type ListWord } from "@/lib/wordlist";
import { useCustomContent } from "@/lib/customContent";
import { speak, splitWords, stopSpeaking } from "@/lib/speech";
import { getSettings } from "@/lib/settings";
import { usePhoto } from "@/lib/photos";
import { RepeatLine } from "./Practice";
import { photoCredit } from "./Scene";

type AnyEntry = Entry | OnlineEntry;

/* ---------------- My words (saved on the device) ---------------- */

const SAVED_KEY = "erp-my-words";
let saved: string[] = [];
let savedLoaded = false;
const savedListeners = new Set<() => void>();
function loadSaved() {
  if (savedLoaded || typeof window === "undefined") return;
  savedLoaded = true;
  try {
    saved = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    saved = [];
  }
}
function toggleSaved(word: string) {
  loadSaved();
  saved = saved.includes(word) ? saved.filter((w) => w !== word) : [word, ...saved];
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  } catch {
    /* ignore */
  }
  savedListeners.forEach((l) => l());
}
const EMPTY: string[] = [];
function useSaved() {
  return useSyncExternalStore(
    (l) => {
      savedListeners.add(l);
      return () => savedListeners.delete(l);
    },
    () => {
      loadSaved();
      return saved;
    },
    () => EMPTY,
  );
}

/* ---------------- Letter by letter ---------------- */

const LETTER_NAMES: Record<string, string> = {
  a: "ay", b: "bee", c: "see", d: "dee", e: "ee", f: "ef", g: "jee", h: "aitch", i: "eye", j: "jay", k: "kay", l: "el", m: "em",
  n: "en", o: "oh", p: "pee", q: "cue", r: "ar", s: "ess", t: "tee", u: "you", v: "vee", w: "double you", x: "ex", y: "why", z: "zed",
};

function letterName(ch: string) {
  const c = ch.toLowerCase();
  if (c === "z" && getSettings().accent === "en-US") return "zee";
  return LETTER_NAMES[c] ?? ch;
}

function SpellWord({ word }: { word: string }) {
  const [idx, setIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const run = useRef(0);
  useEffect(() => () => void run.current++, []);

  async function spell() {
    const id = ++run.current;
    setBusy(true);
    const chars = [...word];
    for (let i = 0; i < chars.length; i++) {
      if (run.current !== id) return;
      setIdx(i);
      const ch = chars[i];
      if (/[a-z]/i.test(ch)) await speak(letterName(ch), { rate: 0.85 });
      else await new Promise((r) => setTimeout(r, 350)); // space or hyphen: short pause
      await new Promise((r) => setTimeout(r, 120));
    }
    if (run.current !== id) return;
    setIdx(-2); // whole word
    await speak(word, { rate: 0.8 });
    setIdx(-1);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {[...word].map((ch, i) => (
          <span
            key={i}
            className={`grid place-items-center min-w-10 h-12 px-1 rounded-xl text-2xl font-black uppercase transition-all ${
              ch === " "
                ? "bg-transparent min-w-4"
                : idx === i
                  ? "bg-yellow-300 text-black scale-110 shadow-[0_4px_0_rgba(0,0,0,0.25)]"
                  : idx === -2
                    ? "bg-emerald-500 text-white"
                    : "bg-white/80 dark:bg-white/10 shadow-[0_3px_0_rgba(0,0,0,0.15)]"
            }`}
          >
            {ch === " " ? "" : ch}
          </span>
        ))}
      </div>
      <button className="btn-primary self-start" onClick={busy ? () => { run.current++; stopSpeaking(); setBusy(false); setIdx(-1); } : spell}>
        {busy ? "■ Stop" : "🔤 Spell it letter by letter"}
      </button>
    </div>
  );
}

/* ---------------- Example sentence with karaoke highlight ---------------- */

function Example({ text, word }: { text: string; word: string }) {
  const [w, setW] = useState(-1);
  const words = splitWords(text);
  const target = word.toLowerCase().split(" ")[0];
  return (
    <button
      className="text-left rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2 hover:bg-sky-100 dark:hover:bg-sky-500/20"
      onClick={() => speak(text, { rate: 0.9, onWord: setW }).then(() => setW(-1))}
    >
      🔊{" "}
      {words.map((x, i) => (
        <span
          key={i}
          className={i === w ? "bg-yellow-300 text-black rounded px-0.5" : x.toLowerCase().replace(/[^a-z]/g, "").startsWith(target) ? "font-bold text-sky-600 dark:text-sky-400" : ""}
        >
          {x}{" "}
        </span>
      ))}
    </button>
  );
}

/* ---------------- The word card ---------------- */

function WordCard({ e, onSearch }: { e: AnyEntry; onSearch: (w: string) => void }) {
  const mine = useSaved();
  const isSaved = mine.includes(e.word);
  const online = "online" in e;
  const [practise, setPractise] = useState(false);

  return (
    <article className="card flex flex-col gap-4">
      <div className="flex flex-wrap items-start gap-3">
        <span className="text-5xl">{e.emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl font-black wrap-break-word">{e.word}</h2>
          <p className="text-sm opacity-70">
            <i>{e.pos}</i> · <span className="font-mono">{e.ipa || "—"}</span> · syllables: <b>{e.syllables}</b>
          </p>
        </div>
        <button className={isSaved ? "btn-primary" : "btn-ghost"} onClick={() => toggleSaved(e.word)}>
          {isSaved ? "⭐ Saved" : "☆ Save"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => speak(e.word, { rate: 0.95 })}>
          🔊 Say the word
        </button>
        <button className="btn-ghost" onClick={() => speak(e.syllables.replace(/·/g, " - "), { rate: 0.6 })}>
          🐢 Slowly, by syllable
        </button>
        {online && e.audio && (
          <button className="btn-ghost" onClick={() => void new Audio(e.audio).play()}>
            🎧 Real human voice
          </button>
        )}
        <button className="btn-ghost" onClick={() => setPractise((p) => !p)}>
          🎤 Say it yourself
        </button>
      </div>
      {practise && <RepeatLine text={e.word} />}

      <SpellWord word={e.word} />

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-sky-500/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">
            English meaning {e.level ? <span className="normal-case font-normal">· {LEVEL_EMOJI[e.level]} {LEVEL_NAMES[e.level]} ({LEVEL_CEFR[e.level]})</span> : null}
          </p>
          {e.en ? (
            <button className="text-left text-lg" onClick={() => speak(e.en)}>
              🔊 {e.en}
            </button>
          ) : (
            <p className="opacity-70">See all meanings in the full entry below 👇</p>
          )}
        </div>
        <SinhalaMeaning word={e.word} si={e.si} auto={online} />
      </div>

      {e.examples.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">Example sentences (tap to hear)</p>
          {e.examples.map((x) => (
            <Example key={x} text={x} word={e.word} />
          ))}
        </div>
      )}

      <FullDetails word={e.word} preset={online ? e.full : undefined} onSearch={onSearch} />

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="opacity-60">🔎 Look up in other dictionaries:</span>
        {externalDictionaries(e.word).map((d) => (
          <a key={d.url} className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-1 font-semibold hover:bg-black/10" href={d.url} target="_blank" rel="noreferrer">
            {d.label} ↗
          </a>
        ))}
      </div>
    </article>
  );
}

/* ---------------- Sinhala meaning: admin correction > built-in > automatic ---------------- */

const SI_CACHE = "erp-si-auto";
function cachedAutoSi(word: string) {
  try {
    return (JSON.parse(localStorage.getItem(SI_CACHE) ?? "{}") as Record<string, string>)[word] ?? "";
  } catch {
    return "";
  }
}
function saveAutoSi(word: string, si: string) {
  try {
    const c = JSON.parse(localStorage.getItem(SI_CACHE) ?? "{}") as Record<string, string>;
    c[word] = si;
    localStorage.setItem(SI_CACHE, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

function SinhalaMeaning({ word, si, auto }: { word: string; si: string; auto: boolean }) {
  const custom = useCustomContent();
  const admin = custom.si?.[word.toLowerCase()];
  const [autoSi, setAutoSi] = useState("");
  const [state, setState] = useState<"" | "loading" | "none">("");
  const shown = admin || si || autoSi;

  useEffect(() => {
    if (admin || si) return;
    const c = cachedAutoSi(word);
    if (c) {
      setAutoSi(c); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    let alive = true;
    setState("loading");
    toSinhala(word).then(async (t) => {
      // Fall back to translating the English meaning when the single word has no translation.
      const res = t || (await fullEntry(word).then((f) => f?.senses[0]?.defs[0]?.si ?? "").catch(() => ""));
      if (!alive) return;
      if (res) {
        setAutoSi(res);
        saveAutoSi(word, res);
        setState("");
      } else setState("none");
    });
    return () => {
      alive = false;
    };
  }, [word, admin, si]);

  const isAuto = !admin && (auto || (!si && !!autoSi));
  return (
    <div className="rounded-2xl bg-amber-500/10 p-3">
      <p className="text-xs font-bold uppercase tracking-wide opacity-60">
        සිංහල තේරුම {isAuto && shown && <span className="normal-case font-normal">(automatic translation)</span>}
      </p>
      {shown ? (
        <p className="si text-xl font-semibold">{shown}</p>
      ) : state === "loading" ? (
        <p className="text-sm opacity-60">Translating…</p>
      ) : (
        <p className="text-sm opacity-60">No Sinhala yet. Use the Madura or Google links below.</p>
      )}
    </div>
  );
}

/* ---------------- Full dictionary entry (all meanings, synonyms, UK/US) ---------------- */

const POS_SI: Record<string, string> = {
  noun: "නාම පදය",
  verb: "ක්‍රියා පදය",
  adjective: "විශේෂණ පදය",
  adverb: "ක්‍රියා විශේෂණය",
  pronoun: "සර්වනාමය",
  preposition: "නිපාතය",
  conjunction: "සම්බන්ධක පදය",
  interjection: "අලංකාර පදය",
};

function FullDetails({ word, preset, onSearch }: { word: string; preset?: FullEntry; onSearch: (w: string) => void }) {
  const [full, setFull] = useState<FullEntry | null | undefined>(preset);
  const [state, setState] = useState<"idle" | "loading" | "none" | "offline">("idle");

  useEffect(() => {
    if (preset) return;
    let alive = true;
    setState("loading"); // eslint-disable-line react-hooks/set-state-in-effect
    fullEntry(word)
      .then((f) => {
        if (!alive) return;
        setFull(f);
        setState(f ? "idle" : "none");
      })
      .catch(() => alive && setState("offline"));
    return () => {
      alive = false;
    };
  }, [word, preset]);

  if (state === "loading") return <p className="text-sm opacity-60">📚 Loading the full dictionary entry…</p>;
  if (state === "offline") return <p className="text-xs opacity-60">📶 Connect to the internet to see all meanings, synonyms and UK/US voices.</p>;
  if (!full || !full.senses.length) return null;

  return (
    <section className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-black text-lg flex-1">📚 Full dictionary entry</h3>
        {full.audioUK && (
          <button className="btn-ghost text-sm" onClick={() => void new Audio(full.audioUK).play()}>
            🇬🇧 UK voice <span className="font-mono opacity-70">{full.ipaUK}</span>
          </button>
        )}
        {full.audioUS && (
          <button className="btn-ghost text-sm" onClick={() => void new Audio(full.audioUS).play()}>
            🇺🇸 US voice <span className="font-mono opacity-70">{full.ipaUS}</span>
          </button>
        )}
      </div>
      {full.senses.map((s) => (
        <div key={s.pos} className="rounded-2xl bg-black/5 dark:bg-white/10 p-3 flex flex-col gap-2">
          <p className="font-bold">
            <span className="rounded-full bg-sky-500 text-white text-xs px-2 py-0.5 mr-2">{s.pos}</span>
            <span className="si text-sm opacity-70">{POS_SI[s.pos] ?? ""}</span>
          </p>
          <ol className="list-decimal pl-6 flex flex-col gap-2">
            {s.defs.map((d, i) => (
              <li key={i}>
                <button className="text-left" onClick={() => speak(d.en)}>
                  {d.en}
                </button>
                {d.si && <p className="si text-sm text-amber-700 dark:text-amber-300">{d.si}</p>}
                {d.example && (
                  <button className="block text-left text-sm italic opacity-80 hover:opacity-100" onClick={() => speak(d.example!)}>
                    🔊 “{d.example}”
                  </button>
                )}
              </li>
            ))}
          </ol>
          {s.synonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="font-semibold opacity-70">Similar:</span>
              {s.synonyms.map((x) => (
                <button key={x} className="rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5" onClick={() => onSearch(x)}>
                  {x}
                </button>
              ))}
            </div>
          )}
          {s.antonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="font-semibold opacity-70">Opposite:</span>
              {s.antonyms.map((x) => (
                <button key={x} className="rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-200 px-2 py-0.5" onClick={() => onSearch(x)}>
                  {x}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      <p className="text-[11px] opacity-50">
        Full entry from Wiktionary (CC BY-SA) via the Free Dictionary API. Sinhala lines under each meaning are automatic translations and may not be perfect.
      </p>
    </section>
  );
}

/* ---------------- Quiz ---------------- */

function shuffle<T>(a: T[]) {
  return [...a].sort(() => Math.random() - 0.5);
}

function VocabQuiz({ pool }: { pool: Entry[] }) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => {
    if (round === 0) return [];
    const picked = shuffle(pool).slice(0, 10);
    return picked.map((e, i) => {
      const toSinhala = i % 2 === 0;
      const wrong = shuffle(DICTIONARY.filter((x) => x.word !== e.word)).slice(0, 3);
      const options = shuffle([e, ...wrong]);
      return { e, toSinhala, options };
    });
  }, [round, pool]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  if (round === 0 || i >= questions.length) {
    return (
      <div className="card flex flex-col items-center text-center gap-3 py-8">
        <p className="text-5xl">{round === 0 ? "🧠" : score >= 8 ? "🏆" : "💪"}</p>
        {round > 0 && (
          <p className="text-2xl font-black">
            Score: {score} / {questions.length}
          </p>
        )}
        <p className="opacity-70">10 questions: hear the word and choose the Sinhala meaning, or read the Sinhala and choose the English word.</p>
        <button
          className="btn-primary text-lg px-6 py-3"
          onClick={() => {
            setRound((r) => r + 1);
            setI(0);
            setScore(0);
            setPicked(null);
          }}
        >
          ▶ {round === 0 ? "Start quiz" : "Play again"}
        </button>
      </div>
    );
  }

  const q = questions[i];
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm opacity-70">
        <span>
          Question {i + 1} / {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>
      {q.toSinhala ? (
        <button className="text-4xl font-black text-left" onClick={() => speak(q.e.word)}>
          🔊 {q.e.word}
        </button>
      ) : (
        <p className="si text-3xl font-bold">{q.e.si}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-2">
        {q.options.map((o) => {
          const right = o.word === q.e.word;
          const show = picked !== null;
          return (
            <button
              key={o.word}
              disabled={show}
              onClick={() => {
                setPicked(o.word);
                if (right) setScore((s) => s + 1);
                speak(q.e.word);
              }}
              className={`rounded-2xl px-4 py-3 text-left font-semibold border transition ${
                show && right ? "bg-emerald-500 text-white border-emerald-500" : show && picked === o.word ? "bg-rose-500 text-white border-rose-500" : "border-black/10 dark:border-white/15 hover:bg-sky-50 dark:hover:bg-white/10"
              } ${q.toSinhala ? "si text-lg" : ""}`}
            >
              {q.toSinhala ? o.si : o.word}
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

/* ---------------- Main page ---------------- */

function Hero() {
  const photo = usePhoto("dict:hero");
  return (
    <section className="relative overflow-hidden rounded-4xl text-white min-h-56 flex shadow-[0_24px_50px_-18px_rgba(14,165,233,0.7)]">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-sky-500 to-indigo-700" />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-indigo-950/90 via-indigo-900/60 to-transparent" />
      <div className="relative p-6 sm:p-8 flex flex-col justify-center gap-2 max-w-xl">
        <h1 className="text-4xl sm:text-5xl font-black drop-shadow-lg">📖 Talking Dictionary</h1>
        <p className="text-white/90">
          Hear every word, spell it letter by letter, and learn the meaning in English and <span className="si">සිංහල</span>, with example sentences.
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

/** A word from the 5,000-word list, shaped like a dictionary entry. */
function fromList(x: ListWord, adminSi?: Record<string, string>): Entry {
  return {
    word: x.w,
    pos: "",
    ipa: "",
    syllables: guessSyllables(x.w),
    emoji: LEVEL_EMOJI[x.l],
    en: x.d,
    si: adminSi?.[x.w] || x.s,
    examples: [],
    topic: "verbs",
    level: x.l,
  };
}

const PAGE = 60;

function AllWords({ words, si, onOpen }: { words: ListWord[]; si: Record<string, string>; onOpen: (e: Entry) => void }) {
  const [level, setLevel] = useState<0 | 1 | 2 | 3 | 4 | 5>(1);
  const [letter, setLetter] = useState("");
  const [find, setFind] = useState("");
  const [shown, setShown] = useState(PAGE);
  if (!words.length) return <p className="card opacity-70">Loading 5,000 words…</p>;
  const f = find.trim().toLowerCase();
  const list = words.filter(
    (x) =>
      (!level || x.l === level) &&
      (!letter || x.w.startsWith(letter)) &&
      (!f || x.w.includes(f) || (si[x.w] || x.s).includes(find.trim()) || x.d.toLowerCase().includes(f)),
  );
  return (
    <section className="flex flex-col gap-3">
      <input
        value={find}
        onChange={(e) => {
          setFind(e.target.value);
          setShown(PAGE);
        }}
        placeholder={`🔎 Search ${level ? LEVEL_NAMES[level] : "all"} words (English, meaning or සිංහල)`}
        className="rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400"
      />
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {([1, 2, 3, 4, 5] as const).map((l) => (
          <button
            key={l}
            className={`shrink-0 ${level === l ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              setLevel(l);
              setShown(PAGE);
            }}
          >
            {LEVEL_EMOJI[l]} {LEVEL_NAMES[l]} <span className="opacity-70 text-xs">{LEVEL_CEFR[l]} · {words.filter((x) => x.l === l).length}</span>
          </button>
        ))}
        <button className={`shrink-0 ${level === 0 ? "btn-primary" : "btn-ghost"}`} onClick={() => setLevel(0)}>
          All
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {"abcdefghijklmnopqrstuvwxyz".split("").map((c) => (
          <button
            key={c}
            onClick={() => {
              setLetter(letter === c ? "" : c);
              setShown(PAGE);
            }}
            className={`h-8 w-8 rounded-lg text-sm font-bold uppercase ${letter === c ? "bg-sky-500 text-white" : "bg-black/5 dark:bg-white/10"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {list.slice(0, shown).map((x) => (
          <button key={x.w} onClick={() => onOpen(fromList(x, si))} className="card p-3 text-left flex flex-col gap-0.5 hover:-translate-y-0.5 transition">
            <span className="font-black text-lg">{x.w}</span>
            <span className="si text-sm opacity-80 min-h-5">{si[x.w] || x.s}</span>
            {x.d && <span className="text-[11px] opacity-60 line-clamp-2">{x.d}</span>}
          </button>
        ))}
      </div>
      {list.length > shown && (
        <button className="btn-ghost self-center" onClick={() => setShown(shown + PAGE)}>
          Show more ({list.length - shown} left)
        </button>
      )}
      <p className="text-[11px] opacity-50">
        Word list: New General Service List & NAWL (Browne, Culligan & Phillips), CC BY-SA 4.0. Some Sinhala from Wiktionary (CC BY-SA). Tap any word for the full
        entry; missing Sinhala is translated automatically.
      </p>
    </section>
  );
}

export function DictionaryHub() {
  const [q, setQ] = useState("");
  const [current, setCurrent] = useState<AnyEntry | null>(null);
  const [status, setStatus] = useState<"" | "loading" | "notfound" | "offline">("");
  const [topic, setTopic] = useState<TopicId | "mine">("travel");
  const [tab, setTab] = useUrlTab<"levels" | "browse" | "quiz">("levels", ["levels", "browse", "quiz"]);
  const [wordOfDay, setWordOfDay] = useState<Entry | null>(null);
  const mine = useSaved();
  const cardRef = useRef<HTMLDivElement>(null);
  const words = useWordList();
  const custom = useCustomContent();
  const curated = q.trim() && !current ? searchWords(q, 6) : [];
  const fromWords =
    q.trim().length >= 2 && !current
      ? words
          .filter((x) => x.w.startsWith(q.trim().toLowerCase()) && !curated.some((c) => c.word === x.w))
          .slice(0, 10 - curated.length)
          .map((x) => fromList(x, custom.si))
      : [];
  const suggestions = [...curated, ...fromWords];

  // Open a word passed in the link, e.g. /dictionary?w=analysis
  const linked = useRef(false);
  useEffect(() => {
    if (linked.current || !words.length) return;
    const w = new URLSearchParams(window.location.search).get("w");
    if (!w) return;
    linked.current = true;
    void search(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length]);

  useEffect(() => {
    const d = new Date();
    const day = Math.floor(d.getTime() / 86400000);
    setWordOfDay(DICTIONARY[day % DICTIONARY.length]); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function open(e: AnyEntry) {
    setCurrent(e);
    setStatus("");
    setQ(e.word);
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function search(word: string) {
    const w = word.trim();
    if (!w) return;
    const local = findWord(w);
    if (local) return open(local);
    const listed = words.find((x) => x.w === w.toLowerCase());
    if (listed) return open(fromList(listed, custom.si));
    setCurrent(null);
    setStatus("loading");
    try {
      const r = await lookupOnline(w);
      if (r) open(r);
      else setStatus("notfound");
    } catch {
      setStatus(navigator.onLine ? "notfound" : "offline");
    }
  }

  const list = topic === "mine" ? DICTIONARY.filter((e) => mine.includes(e.word)) : DICTIONARY.filter((e) => e.topic === topic);

  return (
    <div className="flex flex-col gap-6">
      <Hero />

      {/* Search */}
      <form
        className="card flex flex-col gap-2 relative"
        onSubmit={(ev) => {
          ev.preventDefault();
          void search(q);
        }}
      >
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(ev) => {
              setQ(ev.target.value);
              setCurrent(null);
              setStatus("");
            }}
            placeholder="Type any English word… (or a Sinhala word)"
            className="flex-1 rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-sky-400"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button className="btn-primary text-lg px-5">🔎 Search</button>
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s.word} type="button" className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-sm" onClick={() => open(s)}>
                {s.emoji} {s.word} <span className="si opacity-70">· {s.si}</span>
              </button>
            ))}
          </div>
        )}
        {status === "loading" && <p className="text-sm opacity-70">Looking it up online…</p>}
        {status === "notfound" && <p className="text-sm text-rose-500">Sorry, we couldn&apos;t find “{q}”. Check the spelling and try again.</p>}
        {status === "offline" && <p className="text-sm text-amber-600">You&apos;re offline. Built-in words still work; other words need internet.</p>}
      </form>

      <div ref={cardRef} className="scroll-mt-20">
        {current && <WordCard key={current.word} e={current} onSearch={(w) => void search(w)} />}
      </div>

      {wordOfDay && !current && (
        <button
          onClick={() => open(wordOfDay)}
          className="rounded-3xl bg-linear-to-r from-amber-400 to-orange-500 text-white p-5 text-left shadow-lg hover:-translate-y-0.5 transition"
        >
          <p className="text-sm font-semibold opacity-90">⭐ Word of the day</p>
          <p className="text-3xl font-black">
            {wordOfDay.emoji} {wordOfDay.word}
          </p>
          <p className="si text-lg">{wordOfDay.si}</p>
        </button>
      )}

      <nav className="flex gap-2 overflow-x-auto no-scrollbar">
        <button className={`shrink-0 ${tab === "levels" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("levels")}>
          🪜 {words.length ? words.length.toLocaleString() : "5,000"} words by level
        </button>
        <button className={`shrink-0 ${tab === "browse" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("browse")}>
          📚 Topics & My words
        </button>
        <button className={`shrink-0 ${tab === "quiz" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("quiz")}>
          🧠 Vocabulary quiz
        </button>
      </nav>

      {tab === "levels" && <AllWords words={words} si={custom.si} onOpen={open} />}

      {tab === "browse" && (
        <section className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button className={`shrink-0 ${topic === "mine" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTopic("mine")}>
              ⭐ My words ({mine.length})
            </button>
            {TOPICS.map((t) => (
              <button key={t.id} className={`shrink-0 ${topic === t.id ? "btn-primary" : "btn-ghost"}`} onClick={() => setTopic(t.id)}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          {topic !== "mine" && <p className="si text-sm opacity-70">{TOPICS.find((t) => t.id === topic)?.si}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map((e) => (
              <button key={e.word} onClick={() => open(e)} className="card p-3 text-left flex flex-col gap-1 hover:-translate-y-0.5 transition">
                <span className="text-3xl">{e.emoji}</span>
                <span className="font-black text-lg">{e.word}</span>
                <span className="si text-sm opacity-80">{e.si}</span>
                <span className="text-[11px] opacity-50 font-mono">{e.ipa}</span>
              </button>
            ))}
          </div>
          {topic === "mine" && !list.length && <p className="card opacity-70">Tap ☆ Save on any word to add it to your list.</p>}
          <p className="text-xs opacity-60">
            {DICTIONARY.length} built-in words in {TOPICS.length} topics, and you can search any other English word online.
          </p>
        </section>
      )}

      {tab === "quiz" && <VocabQuiz pool={mine.length >= 4 && topic === "mine" ? DICTIONARY.filter((e) => mine.includes(e.word)) : DICTIONARY} />}
    </div>
  );
}
