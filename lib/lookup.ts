"use client";

import type { Entry } from "./dictionary";

/**
 * Full online dictionary entry for ANY English word (Cambridge-style detail):
 * all meanings by part of speech, examples, synonyms, opposites, UK/US phonetics + real recordings.
 * - Source: Free Dictionary API (dictionaryapi.dev), built from Wiktionary (CC BY-SA, commercial use allowed with credit).
 * - Sinhala: MyMemory machine translation (free). Shown as "automatic translation".
 * Results are saved on the device so a word looked up once works offline.
 */

export type Sense = { pos: string; defs: { en: string; si?: string; example?: string }[]; synonyms: string[]; antonyms: string[] };

export type FullEntry = {
  word: string;
  ipaUK: string;
  ipaUS: string;
  audioUK?: string;
  audioUS?: string;
  audio?: string;
  senses: Sense[];
  si: string; // Sinhala for the word itself (automatic)
};

export type OnlineEntry = Entry & { online: true; siAuto: boolean; audio?: string; full: FullEntry };

const CACHE = "erp-lookup-cache-v2";

function readCache(): Record<string, FullEntry> {
  try {
    return JSON.parse(localStorage.getItem(CACHE) ?? "{}");
  } catch {
    return {};
  }
}

function writeCache(word: string, e: FullEntry) {
  try {
    const c = readCache();
    c[word] = e;
    const keys = Object.keys(c);
    if (keys.length > 300) delete c[keys[0]];
    localStorage.setItem(CACHE, JSON.stringify(c));
  } catch {
    /* storage full */
  }
}

type ApiEntry = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: { partOfSpeech: string; definitions: { definition: string; example?: string; synonyms?: string[]; antonyms?: string[] }[]; synonyms?: string[]; antonyms?: string[] }[];
};

const hasSinhala = (t: string) => /[඀-෿]/.test(t);

export async function toSinhala(text: string): Promise<string> {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=en|si`);
    if (!res.ok) return "";
    const j = (await res.json()) as { responseData?: { translatedText?: string }; matches?: { translation?: string; quality?: string | number }[] };
    const t = j.responseData?.translatedText ?? "";
    if (hasSinhala(t)) return t;
    const alt = j.matches?.find((m) => m.translation && hasSinhala(m.translation));
    return alt?.translation ?? "";
  } catch {
    return "";
  }
}

/** Rough syllable split for display (vowel groups). Not perfect, but helpful for learners. */
export function guessSyllables(word: string) {
  if (word.length <= 4 || word.includes(" ")) return word;
  const parts = word.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi);
  return parts && parts.join("").length === word.length ? parts.join("·") : word;
}

const uniq = (a: string[]) => [...new Set(a.map((s) => s.trim()).filter(Boolean))];

/** Full entry for any word (also used to enrich built-in words). Returns null if the word doesn't exist. */
export async function fullEntry(raw: string): Promise<FullEntry | null> {
  const word = raw.trim().toLowerCase();
  if (!word || !/^[a-z][a-z' -]{0,40}$/.test(word)) return null;
  const cached = readCache()[word];
  if (cached) return cached;

  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("lookup failed");
  const data = (await res.json()) as ApiEntry[];
  if (!data[0]) return null;

  const phon = data.flatMap((d) => d.phonetics ?? []);
  const audioUK = phon.find((p) => p.audio?.includes("-uk"))?.audio;
  const audioUS = phon.find((p) => p.audio?.includes("-us"))?.audio;
  const anyAudio = phon.find((p) => p.audio)?.audio;
  const texts = uniq([...(data.map((d) => d.phonetic ?? "")), ...phon.map((p) => p.text ?? "")]);

  // Merge meanings by part of speech.
  const byPos = new Map<string, Sense>();
  for (const d of data) {
    for (const m of d.meanings ?? []) {
      const s = byPos.get(m.partOfSpeech) ?? { pos: m.partOfSpeech, defs: [], synonyms: [], antonyms: [] };
      for (const def of m.definitions) {
        if (s.defs.length < 8) s.defs.push({ en: def.definition, example: def.example });
        s.synonyms.push(...(def.synonyms ?? []));
        s.antonyms.push(...(def.antonyms ?? []));
      }
      s.synonyms.push(...(m.synonyms ?? []));
      s.antonyms.push(...(m.antonyms ?? []));
      byPos.set(m.partOfSpeech, s);
    }
  }
  const senses = [...byPos.values()].map((s) => ({ ...s, synonyms: uniq(s.synonyms).slice(0, 12), antonyms: uniq(s.antonyms).slice(0, 8) }));

  // Sinhala: the word itself, then the first meaning of each part of speech (max 3 requests).
  let si = await toSinhala(word);
  for (const s of senses.slice(0, 3)) {
    const first = s.defs[0];
    if (first) first.si = await toSinhala(first.en);
  }
  if (!si) si = senses[0]?.defs[0]?.si ?? "";

  const full: FullEntry = {
    word: data[0].word,
    ipaUK: texts[0] ?? "",
    ipaUS: texts[1] ?? texts[0] ?? "",
    audioUK,
    audioUS,
    audio: audioUK ?? audioUS ?? anyAudio,
    senses,
    si,
  };
  writeCache(word, full);
  return full;
}

/** Entry shape for words that are NOT in the built-in dictionary. */
export async function lookupOnline(raw: string): Promise<OnlineEntry | null> {
  const full = await fullEntry(raw);
  if (!full) return null;
  const first = full.senses[0];
  return {
    word: full.word,
    pos: full.senses.map((s) => s.pos).join(" / "),
    ipa: full.ipaUK,
    syllables: guessSyllables(full.word),
    emoji: "📘",
    en: first?.defs[0]?.en ?? "",
    si: full.si,
    examples: full.senses.flatMap((s) => s.defs.map((d) => d.example)).filter((x): x is string => !!x).slice(0, 3),
    topic: "verbs",
    online: true,
    siAuto: true,
    audio: full.audio,
    full,
  };
}
