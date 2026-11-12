/**
 * Sentence Patterns: builds 1,500 sentences per book from short hand-written "frames".
 * Each frame is used with 5 different people × 4 forms (positive, negative, question,
 * negative question) = 20 sentences. English grammar and the Sinhala meaning are built
 * by rules, so every sentence has a Sinhala meaning.
 */

export type Form = "pos" | "neg" | "q" | "nq";

export const FORMS: { id: Form; label: string; emoji: string; si: string }[] = [
  { id: "pos", label: "Positive", emoji: "✅", si: "ධනාත්මක වාක්‍ය" },
  { id: "neg", label: "Negative", emoji: "❌", si: "නිෂේධනාත්මක වාක්‍ය" },
  { id: "q", label: "Question", emoji: "❓", si: "ප්‍රශ්න වාක්‍ය" },
  { id: "nq", label: "Negative question", emoji: "⁉️", si: "නිෂේධනාත්මක ප්‍රශ්න" },
];

export type Sentence = {
  en: string;
  si: string;
  form: Form;
  /** Quiz gap: before + answer + after = en. options[0] is the answer. */
  before: string;
  answer: string;
  after: string;
  options: string[];
};

export type LevelInfo = { title: string; formula: Record<Form, string>; tip: string; tipSi: string };
export type Level = LevelInfo & { sentences: Sentence[] };

export type BookMeta = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  blurb: string;
  blurbSi: string;
};
export type Book = BookMeta & { levels: Level[] };

/* ---------------- People ---------------- */

type Pr = "i" | "you" | "he" | "she" | "we" | "they";
type Subj = { en: string; si: string; dat: string; pr: Pr };

const PRON: Record<Pr, { en: string; be: string; was: string; has: string; poss: string; obj: string; self: string; sposs: string; sdat: string; sacc: string }> = {
  i: { en: "I", be: "am", was: "was", has: "have", poss: "my", obj: "me", self: "myself", sposs: "මගේ", sdat: "මට", sacc: "මාව" },
  you: { en: "you", be: "are", was: "were", has: "have", poss: "your", obj: "you", self: "yourself", sposs: "ඔබේ", sdat: "ඔබට", sacc: "ඔබව" },
  he: { en: "he", be: "is", was: "was", has: "has", poss: "his", obj: "him", self: "himself", sposs: "ඔහුගේ", sdat: "ඔහුට", sacc: "ඔහුව" },
  she: { en: "she", be: "is", was: "was", has: "has", poss: "her", obj: "her", self: "herself", sposs: "ඇයගේ", sdat: "ඇයට", sacc: "ඇයව" },
  we: { en: "we", be: "are", was: "were", has: "have", poss: "our", obj: "us", self: "ourselves", sposs: "අපේ", sdat: "අපිට", sacc: "අපිව" },
  they: { en: "they", be: "are", was: "were", has: "have", poss: "their", obj: "them", self: "themselves", sposs: "ඔවුන්ගේ", sdat: "ඔවුන්ට", sacc: "ඔවුන්ව" },
};

export const PEOPLE: Subj[] = [
  { en: "I", si: "මම", dat: "මට", pr: "i" },
  { en: "you", si: "ඔබ", dat: "ඔබට", pr: "you" },
  { en: "he", si: "ඔහු", dat: "ඔහුට", pr: "he" },
  { en: "she", si: "ඇය", dat: "ඇයට", pr: "she" },
  { en: "we", si: "අපි", dat: "අපිට", pr: "we" },
  { en: "they", si: "ඔවුන්", dat: "ඔවුන්ට", pr: "they" },
  { en: "my brother", si: "මගේ අයියා", dat: "මගේ අයියාට", pr: "he" },
  { en: "my sister", si: "මගේ නංගී", dat: "මගේ නංගීට", pr: "she" },
  { en: "our teacher", si: "අපේ ගුරුතුමිය", dat: "අපේ ගුරුතුමියට", pr: "she" },
  { en: "the children", si: "ළමයි", dat: "ළමයින්ට", pr: "they" },
  { en: "my parents", si: "මගේ දෙමාපියෝ", dat: "මගේ දෙමාපියන්ට", pr: "they" },
  { en: "my friend", si: "මගේ යාළුවා", dat: "මගේ යාළුවාට", pr: "he" },
  { en: "Nimal", si: "නිමල්", dat: "නිමල්ට", pr: "he" },
  { en: "Kumari", si: "කුමාරි", dat: "කුමාරිට", pr: "she" },
  { en: "the students", si: "සිසුන්", dat: "සිසුන්ට", pr: "they" },
];

const SINGULAR = PEOPLE.filter((p) => ["i", "you", "he", "she"].includes(p.pr));
const PLURAL = PEOPLE.filter((p) => ["we", "they"].includes(p.pr));
const isPl = (s: Subj) => s.pr === "we" || s.pr === "they";

/** 5 different people for frame number f. */
function five(f: number, pool: Subj[] = PEOPLE): Subj[] {
  return [0, 1, 2, 3, 4].map((j) => pool[(f * 4 + j) % pool.length]);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Replace {poss} {obj} {self} (English) and {sposs} {sdat} {sacc} (Sinhala) for a person. */
function fill(text: string, s: Subj) {
  const p = PRON[s.pr];
  return text
    .replace(/\{poss\}/g, p.poss)
    .replace(/\{obj\}/g, p.obj)
    .replace(/\{self\}/g, p.self)
    .replace(/\{sposs\}/g, p.sposs)
    .replace(/\{sdat\}/g, p.sdat)
    .replace(/\{sacc\}/g, p.sacc);
}

/* ---------------- Sinhala verb forms (from the "-න්න" form) ---------------- */

/** කරන්න → කරනවා, ගන්න → ගන්නවා, ඉන්න → ඉන්නවා */
export const siPres = (v: string) => (/(ගන්න|ඉන්න)$/.test(v) ? v + "වා" : v.replace(/න්න$/, "නවා"));
export const siNeg = (v: string) => v + "ේ නැහැ";
export const siQ = (v: string) => siPres(v) + "ද?";
export const siNq = (v: string) => v + "ේ නැද්ද?";

type Four = [string, string, string, string];
const mk = (before: string, answer: string, after: string, options: string[], si: string, form: Form): Sentence => ({
  en: before + answer + after,
  si,
  form,
  before,
  answer,
  after,
  options,
});

/* ---------------- Modal books: must, should, would ---------------- */

export type ModalFrame = [en: string, si: string];

export type ModalRule = {
  /** [before, answer, after] for each form. S = subject at the start, s = subject inside a question. */
  en: (form: Form, S: string, s: string, v: string) => [string, string, string];
  options: Record<Form, string[]>;
  si: (form: Form, S: string, v: string) => string;
};

/** "Would I like …?" sounds strange: questions use "you" instead of "I". */
const YOU = PEOPLE[1];
const YOUR_FRIEND: Subj = { en: "your friend", si: "ඔබේ යාළුවා", dat: "ඔබේ යාළුවාට", pr: "he" };
/** In questions "I" becomes "you" (or "your friend" when "you" is already in the group). */
const asker = (s: Subj, form: Form, askYou: boolean, group: Subj[] = []) =>
  askYou && s.pr === "i" && (form === "q" || form === "nq") ? (group.includes(YOU) ? YOUR_FRIEND : YOU) : s;

export function modalLevel(info: LevelInfo, frames: ModalFrame[], rule: ModalRule, askYou = false): Level {
  const sentences: Sentence[] = [];
  frames.forEach(([en, si], f) => {
    const group = five(f);
    for (const s0 of group) {
      for (const { id: form } of FORMS) {
        const s = asker(s0, form, askYou, group);
        const [b, a, after] = rule.en(form, cap(s.en), s.en, fill(en, s));
        sentences.push(mk(b, a, after, rule.options[form], rule.si(form, s.si, fill(si, s)), form));
      }
    }
  });
  return { ...info, sentences };
}

/* ---------------- If I were / If I could ---------------- */

/** [condition (after were / could), Sinhala condition, result (after would), Sinhala result "-න්න"] */
export type IfFrame = [cond: string, condSi: string, res: string, resSi: string, opts?: "sg" | "who"];

const WHO: [string, string][] = [
  ["you", "ඔබ"],
  ["him", "ඔහු"],
  ["her", "ඇය"],
  ["them", "ඔවුන්"],
  ["in your place", "ඔබේ තැන හිටියා"],
];
/** Same people, asked to "you": If you were me / him / her / them / in my place … */
const WHO_Q: [string, string][] = [
  ["me", "මම"],
  ["him", "ඔහු"],
  ["her", "ඇය"],
  ["them", "ඔවුන්"],
  ["in my place", "මගේ තැන හිටියා"],
];

const IF_OPTS: Record<Exclude<Form, "pos">, string[]> = {
  neg: ["wouldn't", "won't", "don't", "didn't"],
  q: ["would", "will", "do", "did"],
  nq: ["wouldn't", "won't", "don't", "didn't"],
};

export function ifLevel(info: LevelInfo, frames: IfFrame[], kind: "were" | "could"): Level {
  const sentences: Sentence[] = [];
  const posOpts = kind === "were" ? ["were", "be", "been", "being"] : ["could", "can", "could to", "can to"];
  frames.forEach(([cond, condSi, res, resSi, opt], f) => {
    const people = opt === "who" ? WHO.map(() => PEOPLE[0]) : five(f, opt === "sg" ? SINGULAR : PEOPLE);
    people.forEach((s0, j) => {
      for (const form of ["pos", "neg", "q", "nq"] as Form[]) {
        const ask = form === "q" || form === "nq";
        // Questions are asked to "you": If you were me, would you …? / If you could fly, would you …?
        const s = asker(s0, form, true, opt === "who" ? [] : people);
        const who = ask ? WHO_Q[j] : WHO[j];
        const c = opt === "who" ? who[0] : fill(cond, s);
        const cSiRaw = opt === "who" ? who[1] : fill(condSi, s);
        const r = fill(res, s);
        const rSi = fill(resSi, s);
        const pr = PRON[s.pr].en;
        const siIf = kind === "were" ? `${s.si} ${cSiRaw.endsWith("නම්") ? cSiRaw : cSiRaw + " නම්"}` : `${s.dat} ${cSiRaw} පුළුවන් නම්`;
        const head = `If ${s.en} ${kind} ${c}, `;
        if (form === "pos") sentences.push(mk(`If ${s.en} `, kind, ` ${c}, ${pr} would ${r}.`, posOpts, `${siIf}, ${siPres(rSi)}.`, "pos"));
        if (form === "neg") sentences.push(mk(`${head}${pr} `, "wouldn't", ` ${r}.`, IF_OPTS.neg, `${siIf}, ${siNeg(rSi)}.`, "neg"));
        if (form === "q") sentences.push(mk(head, "would", ` ${pr} ${r}?`, IF_OPTS.q, `${siIf}, ${siQ(rSi)}`, "q"));
        if (form === "nq") sentences.push(mk(head, "wouldn't", ` ${pr} ${r}?`, IF_OPTS.nq, `${siIf}, ${siNq(rSi)}`, "nq"));
      }
    });
  });
  return { ...info, sentences };
}

/* ---------------- Be verb ---------------- */

export type BeFrame =
  | { k: "adj"; en: string; si: string } // happy / සතුටු  → සතුටුයි
  | { k: "noun"; en: string; enPl: string; si: string; siPl: string } // a doctor / doctors
  | { k: "inna"; en: string; si: string } // at home / ගෙදර → ගෙදර ඉන්නවා
  | { k: "been"; en: string; si: string } // (present perfect) to Kandy / මහනුවර ගිහින්
  | { k: "thing"; en: string; si: string; past?: boolean; things: [string, string, boolean?][] }; // passive

export type BeTense = "present" | "past" | "future" | "perfect" | "passive";

const BE_SI = {
  present: (a: string): Four => [`${a} ඉන්නවා`, `${a} ඉන්නේ නැහැ`, `${a} ඉන්නවාද?`, `${a} ඉන්නේ නැද්ද?`],
  past: (a: string): Four => [`${a} හිටියා`, `${a} හිටියේ නැහැ`, `${a} හිටියාද?`, `${a} හිටියේ නැද්ද?`],
  future: (a: string): Four => [`${a} ඉඳීවි`, `${a} නොසිටීවි`, `${a} ඉඳීවිද?`, `${a} නොසිටීවිද?`],
  perfect: (p: string): Four => [`${p} තියෙනවා`, `${p} නැහැ`, `${p} තියෙනවාද?`, `${p} නැද්ද?`],
  thing: (p: string, past?: boolean): Four =>
    past ? [`${p} තිබුණා`, `${p} තිබුණේ නැහැ`, `${p} තිබුණාද?`, `${p} තිබුණේ නැද්ද?`] : [`${p} තියෙනවා`, `${p} නැහැ`, `${p} තියෙනවාද?`, `${p} නැද්ද?`],
  adj: (a: string): Four => [`${a}යි`, `${a} නැහැ`, `${a}ද?`, `${a} නැද්ද?`],
  noun: (n: string): Four => [n, `${n} නෙවෙයි`, `${n}ද?`, `${n} නෙවෙයිද?`],
};

const other = (w: string, a: string, b: string) => (w === a ? b : a);

/** English [before, answer, after] + options for one be-sentence. */
function beEnglish(tense: BeTense, form: Form, S: string, s: string, pr: Pr | "it" | "pl", c: string): [string, string, string, string[]] {
  const p = pr === "it" ? null : pr === "pl" ? PRON.they : PRON[pr];
  const be = pr === "it" ? "is" : p!.be;
  const was = pr === "it" ? "was" : p!.was;
  const has = pr === "it" ? "has" : p!.has;
  const Sc = cap(S);
  if (tense === "present") {
    const rest = ["am", "is", "are"].filter((x) => x !== be);
    if (form === "pos") return [`${Sc} `, be, ` ${c}.`, [be, ...rest, "be"]];
    if (form === "neg") return [`${Sc} `, `${be} not`, ` ${c}.`, [`${be} not`, ...rest.map((x) => `${x} not`), "not is"]];
    if (form === "q") return ["", cap(be), ` ${s} ${c}?`, [cap(be), ...rest.map(cap), "Do"]];
    const nq = be === "is" ? "Isn't" : "Aren't";
    return ["", nq, ` ${s} ${c}?`, be === "am" ? ["Aren't", "Isn't", "Amn't", "Don't"] : be === "is" ? ["Isn't", "Aren't", "Don't", "Doesn't"] : ["Aren't", "Isn't", "Don't", "Amn't"]];
  }
  if (tense === "past") {
    const o = other(was, "was", "were");
    if (form === "pos") return [`${Sc} `, was, ` ${c}.`, [was, o, "be", "been"]];
    if (form === "neg") return [`${Sc} `, `${was} not`, ` ${c}.`, [`${was} not`, `${o} not`, "did not", "not was"]];
    if (form === "q") return ["", cap(was), ` ${s} ${c}?`, [cap(was), cap(o), "Did", "Be"]];
    return ["", `${cap(was)}n't`, ` ${s} ${c}?`, [`${cap(was)}n't`, `${cap(o)}n't`, "Didn't", "Don't"]];
  }
  if (tense === "future") {
    if (form === "pos") return [`${Sc} `, "will be", ` ${c}.`, ["will be", "will", "will is", "is will"]];
    if (form === "neg") return [`${Sc} `, "will not be", ` ${c}.`, ["will not be", "will be not", "will not", "not will be"]];
    if (form === "q") return ["", "Will", ` ${s} be ${c}?`, ["Will", "Is", "Does", "Be"]];
    return ["", "Won't", ` ${s} be ${c}?`, ["Won't", "Willn't", "Isn't", "Doesn't"]];
  }
  if (tense === "perfect") {
    const o = other(has, "has", "have");
    if (form === "pos") return [`${Sc} `, `${has} been`, ` ${c}.`, [`${has} been`, `${o} been`, `${has} be`, "is been"]];
    if (form === "neg") return [`${Sc} `, `${has} not been`, ` ${c}.`, [`${has} not been`, `${o} not been`, `${has} been not`, `${has} not be`]];
    if (form === "q") return ["", cap(has), ` ${s} been ${c}?`, [cap(has), cap(o), "Is", "Did"]];
    return ["", `${cap(has)}n't`, ` ${s} been ${c}?`, [`${cap(has)}n't`, `${cap(o)}n't`, "Isn't", "Didn't"]];
  }
  // passive: is/are (present) or was/were (past) + past participle
  return ["", "", "", []];
}

function passiveEnglish(past: boolean, form: Form, S: string, s: string, pl: boolean, c: string): [string, string, string, string[]] {
  const w = past ? (pl ? "were" : "was") : pl ? "are" : "is";
  const o = past ? (pl ? "was" : "were") : pl ? "is" : "are";
  const Sc = cap(S);
  if (form === "pos") return [`${Sc} `, w, ` ${c}.`, [w, o, "be", "being"]];
  if (form === "neg") return [`${Sc} `, `${w} not`, ` ${c}.`, [`${w} not`, `${o} not`, past ? "did not" : "does not", `not ${w}`]];
  if (form === "q") return ["", cap(w), ` ${s} ${c}?`, [cap(w), cap(o), past ? "Did" : "Does", "Be"]];
  return ["", `${cap(w)}n't`, ` ${s} ${c}?`, [`${cap(w)}n't`, `${cap(o)}n't`, past ? "Didn't" : "Doesn't", "Don't"]];
}

export function beLevel(info: LevelInfo, frames: BeFrame[], tense: BeTense): Level {
  const sentences: Sentence[] = [];
  const forms = FORMS.map((x) => x.id);
  frames.forEach((fr, f) => {
    if (fr.k === "thing") {
      for (const [ten, tsi, pl] of fr.things) {
        const si4 = BE_SI.thing(fr.si, fr.past);
        forms.forEach((form, i) => {
          const [b, a, after, opts] = passiveEnglish(!!fr.past, form, ten, ten, !!pl, fr.en);
          sentences.push(mk(b, a, after, opts, `${tsi} ${si4[i]}${i < 2 ? "." : ""}`, form));
        });
      }
      return;
    }
    for (const s of five(f)) {
      const pl = isPl(s);
      const c = fill(fr.k === "noun" ? (pl ? fr.enPl : fr.en) : fr.en, s);
      const siC = fill(fr.k === "noun" ? (pl ? fr.siPl : fr.si) : fr.si, s);
      const si4 =
        fr.k === "adj"
          ? BE_SI.adj(siC)
          : fr.k === "noun"
            ? BE_SI.noun(siC)
            : fr.k === "been"
              ? BE_SI.perfect(siC)
              : tense === "perfect"
                ? BE_SI.perfect(`${siC} ඉඳලා`)
                : BE_SI[tense === "past" ? "past" : tense === "future" ? "future" : "present"](siC);
      forms.forEach((form, i) => {
        const [b, a, after, opts] = beEnglish(tense, form, s.en, s.en, s.pr, c);
        sentences.push(mk(b, a, after, opts, `${s.si} ${si4[i]}${i < 2 ? "." : ""}`, form));
      });
    }
  });
  return { ...info, sentences };
}

export { SINGULAR, PLURAL };
