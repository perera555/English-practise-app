/**
 * Sentence Patterns: builds the sentences of each book from short hand-written "frames".
 * Sentences are grouped: one base sentence is shown in every form together
 * (I am happy. / Am I happy? / I am not happy. / Am I not happy?).
 * English grammar and the Sinhala meaning are built by rules, so every sentence has Sinhala.
 */

export type Form = "pos" | "q" | "neg" | "nq";

export const FORMS: { id: Form; label: string; emoji: string; si: string }[] = [
  { id: "pos", label: "Positive", emoji: "✅", si: "ධනාත්මක වාක්‍ය" },
  { id: "q", label: "Question", emoji: "❓", si: "ප්‍රශ්න වාක්‍ය" },
  { id: "neg", label: "Negative", emoji: "❌", si: "නිෂේධනාත්මක වාක්‍ය" },
  { id: "nq", label: "Negative question", emoji: "⁉️", si: "නිෂේධනාත්මක ප්‍රශ්න" },
];

export type Sentence = {
  en: string;
  si: string;
  form: Form;
  /** Group (card) number inside its level: all forms of one base sentence share it. */
  g: number;
  /** Pattern name inside a group (Be verb: "am / is / are", "was / were", …). */
  p?: string;
  /** Quiz gap: before + answer + after = en. options[0] is the answer. */
  before: string;
  answer: string;
  after: string;
  options: string[];
};

export type LevelInfo = { title: string; formula: Partial<Record<Form, string>>; tip: string; tipSi: string };
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

const PRON: Record<Pr, { en: string; be: string; was: string; has: string; does: string; poss: string; obj: string; self: string; sposs: string; sdat: string; sacc: string }> = {
  i: { en: "I", be: "am", was: "was", has: "have", does: "do", poss: "my", obj: "me", self: "myself", sposs: "මගේ", sdat: "මට", sacc: "මාව" },
  you: { en: "you", be: "are", was: "were", has: "have", does: "do", poss: "your", obj: "you", self: "yourself", sposs: "ඔබේ", sdat: "ඔබට", sacc: "ඔබව" },
  he: { en: "he", be: "is", was: "was", has: "has", does: "does", poss: "his", obj: "him", self: "himself", sposs: "ඔහුගේ", sdat: "ඔහුට", sacc: "ඔහුව" },
  she: { en: "she", be: "is", was: "was", has: "has", does: "does", poss: "her", obj: "her", self: "herself", sposs: "ඇයගේ", sdat: "ඇයට", sacc: "ඇයව" },
  we: { en: "we", be: "are", was: "were", has: "have", does: "do", poss: "our", obj: "us", self: "ourselves", sposs: "අපේ", sdat: "අපිට", sacc: "අපිව" },
  they: { en: "they", be: "are", was: "were", has: "have", does: "do", poss: "their", obj: "them", self: "themselves", sposs: "ඔවුන්ගේ", sdat: "ඔවුන්ට", sacc: "ඔවුන්ව" },
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

/** "Would I like …?" sounds strange: questions use "you" instead of "I" (or "your friend" when "you" is in the group). */
const YOU = PEOPLE[1];
const YOUR_FRIEND: Subj = { en: "your friend", si: "ඔබේ යාළුවා", dat: "ඔබේ යාළුවාට", pr: "he" };
const asker = (s: Subj, form: Form, askYou: boolean, group: Subj[] = []) =>
  askYou && s.pr === "i" && (form === "q" || form === "nq") ? (group.includes(YOU) ? YOUR_FRIEND : YOU) : s;

/* ---------------- Sinhala verb forms (from the "-න්න" form) ---------------- */

/** කරන්න → කරනවා, ගන්න → ගන්නවා, ඉන්න → ඉන්නවා */
export const siPres = (v: string) => (/(ගන්න|ඉන්න)$/.test(v) ? v + "වා" : v.replace(/න්න$/, "නවා"));
export const siNeg = (v: string) => v + "ේ නැහැ";
export const siQ = (v: string) => siPres(v) + "ද?";
export const siNq = (v: string) => v + "ේ නැද්ද?";

const mk = (before: string, answer: string, after: string, options: string[], si: string, form: Form, g: number, p?: string): Sentence => ({
  en: before + answer + after,
  si,
  form,
  g,
  p,
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

export function modalLevel(info: LevelInfo, frames: ModalFrame[], rule: ModalRule, askYou = false): Level {
  const sentences: Sentence[] = [];
  let g = 0;
  frames.forEach(([en, si], f) => {
    const group = five(f);
    for (const s0 of group) {
      g++;
      for (const { id: form } of FORMS) {
        const s = asker(s0, form, askYou, group);
        const [b, a, after] = rule.en(form, cap(s.en), s.en, fill(en, s));
        sentences.push(mk(b, a, after, rule.options[form], rule.si(form, s.si, fill(si, s)), form, g));
      }
    }
  });
  return { ...info, sentences };
}

/* ---------------- If I were / If I could ---------------- */

/** [condition (after were / could), Sinhala condition, result (after would), Sinhala result "-න්න", options] */
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

const IF_Q = ["would", "will", "do", "did"];
const IF_NEG = ["wouldn't", "won't", "don't", "didn't"];

export function ifLevel(info: LevelInfo, frames: IfFrame[], kind: "were" | "could"): Level {
  const sentences: Sentence[] = [];
  const posOpts = kind === "were" ? ["were", "be", "been", "being"] : ["could", "can", "could to", "can to"];
  let g = 0;
  frames.forEach(([cond, condSi, res, resSi, opt], f) => {
    const people = opt === "who" ? WHO.map(() => PEOPLE[0]) : five(f, opt === "sg" ? SINGULAR : PEOPLE);
    people.forEach((s0, j) => {
      g++;
      for (const { id: form } of FORMS) {
        const ask = form === "q" || form === "nq";
        // Questions are asked to "you": If you were me, would you …? / If you could fly, would you …?
        const s = asker(s0, form, true, opt === "who" ? [] : people);
        const who = ask ? WHO_Q[j] : WHO[j];
        const c = opt === "who" ? who[0] : fill(cond, s);
        const cSi = opt === "who" ? who[1] : fill(condSi, s);
        const r = fill(res, s);
        const rSi = fill(resSi, s);
        const pr = PRON[s.pr].en;
        const siIf = kind === "were" ? `${s.si} ${cSi.endsWith("නම්") ? cSi : cSi + " නම්"}` : `${s.dat} ${cSi} පුළුවන් නම්`;
        const head = `If ${s.en} ${kind} ${c}, `;
        if (form === "pos") sentences.push(mk(`If ${s.en} `, kind, ` ${c}, ${pr} would ${r}.`, posOpts, `${siIf}, ${siPres(rSi)}.`, form, g));
        if (form === "q") sentences.push(mk(head, "would", ` ${pr} ${r}?`, IF_Q, `${siIf}, ${siQ(rSi)}`, form, g));
        if (form === "neg") sentences.push(mk(`${head}${pr} `, "wouldn't", ` ${r}.`, IF_NEG, `${siIf}, ${siNeg(rSi)}.`, form, g));
        if (form === "nq") sentences.push(mk(head, "would", ` ${pr} not ${r}?`, IF_Q, `${siIf}, ${siNq(rSi)}`, form, g));
      }
    });
  });
  return { ...info, sentences };
}

/* ---------------- Be verb: one sentence in 12 patterns × 4 forms ---------------- */

/** [English complement, Sinhala (how you "are" it: සතුටින්, ගෙදර, ලෑස්තියෙන් …)] */
export type BeFrame = [en: string, si: string];

type Four = [string, string, string, string]; // pos, q, neg, nq
type BePattern = {
  name: string;
  nameSi: string;
  /** English [before, answer, after] + options, per form. */
  en: (form: Form, S: string, s: string, p: (typeof PRON)[Pr], c: string) => [string, string, string, string[]];
  si: (c: string) => Four;
};

const modalBe = (m: string, neg: string, nameSi: string, si: (c: string) => Four): BePattern => {
  const M = cap(m);
  const qOpts = [M, `${M}s`, `${M} to`, `Do ${m}`];
  return {
    name: `${m} be`,
    nameSi,
    en: (form, S, s, _p, c) =>
      form === "pos"
        ? [`${S} `, `${m} be`, ` ${c}.`, [`${m} be`, m, `${m} is`, `${m} to be`]]
        : form === "q"
          ? ["", M, ` ${s} be ${c}?`, qOpts]
          : form === "neg"
            ? [`${S} `, `${neg} be`, ` ${c}.`, [`${neg} be`, `${m} be not`, `not ${m} be`, neg]]
            : ["", M, ` ${s} not be ${c}?`, qOpts],
    si,
  };
};

const BE_PATTERNS: BePattern[] = [
  {
    name: "am / is / are",
    nameSi: "වර්තමාන කාලය",
    en: (form, S, s, p, c) => {
      const others = ["am", "is", "are"].filter((x) => x !== p.be);
      const q = [cap(p.be), ...others.map(cap), "Do"];
      return form === "pos"
        ? [`${S} `, p.be, ` ${c}.`, [p.be, ...others, "be"]]
        : form === "q"
          ? ["", cap(p.be), ` ${s} ${c}?`, q]
          : form === "neg"
            ? [`${S} `, `${p.be} not`, ` ${c}.`, [`${p.be} not`, ...others.map((x) => `${x} not`), "not"]]
            : ["", cap(p.be), ` ${s} not ${c}?`, q];
    },
    si: (c) => [`${c} ඉන්නවා.`, `${c} ඉන්නවාද?`, `${c} ඉන්නේ නැහැ.`, `${c} ඉන්නේ නැද්ද?`],
  },
  {
    name: "was / were",
    nameSi: "අතීත කාලය",
    en: (form, S, s, p, c) => {
      const o = p.was === "was" ? "were" : "was";
      const q = [cap(p.was), cap(o), "Did", "Be"];
      return form === "pos"
        ? [`${S} `, p.was, ` ${c}.`, [p.was, o, "be", "been"]]
        : form === "q"
          ? ["", cap(p.was), ` ${s} ${c}?`, q]
          : form === "neg"
            ? [`${S} `, `${p.was} not`, ` ${c}.`, [`${p.was} not`, `${o} not`, "did not", "not was"]]
            : ["", cap(p.was), ` ${s} not ${c}?`, q];
    },
    si: (c) => [`${c} හිටියා.`, `${c} හිටියාද?`, `${c} හිටියේ නැහැ.`, `${c} හිටියේ නැද්ද?`],
  },
  {
    name: "will be",
    nameSi: "අනාගත කාලය",
    en: (form, S, s, _p, c) => {
      const q = ["Will", "Is", "Does", "Be"];
      return form === "pos"
        ? [`${S} `, "will be", ` ${c}.`, ["will be", "will", "will is", "is will"]]
        : form === "q"
          ? ["", "Will", ` ${s} be ${c}?`, q]
          : form === "neg"
            ? [`${S} `, "will not be", ` ${c}.`, ["will not be", "will be not", "not will be", "will not"]]
            : ["", "Will", ` ${s} not be ${c}?`, q];
    },
    si: (c) => [`${c} ඉඳීවි.`, `${c} ඉඳීවිද?`, `${c} නොසිටීවි.`, `${c} නොසිටීවිද?`],
  },
  {
    name: "have / has been",
    nameSi: "පූර්ණ වර්තමාන",
    en: (form, S, s, p, c) => {
      const o = p.has === "has" ? "have" : "has";
      const q = [cap(p.has), cap(o), "Is", "Did"];
      return form === "pos"
        ? [`${S} `, `${p.has} been`, ` ${c}.`, [`${p.has} been`, `${o} been`, `${p.has} be`, "is been"]]
        : form === "q"
          ? ["", cap(p.has), ` ${s} been ${c}?`, q]
          : form === "neg"
            ? [`${S} `, `${p.has} not been`, ` ${c}.`, [`${p.has} not been`, `${o} not been`, `${p.has} been not`, `${p.has} not be`]]
            : ["", cap(p.has), ` ${s} not been ${c}?`, q];
    },
    si: (c) => [`${c} ඉඳලා තියෙනවා.`, `${c} ඉඳලා තියෙනවාද?`, `${c} ඉඳලා නැහැ.`, `${c} ඉඳලා නැද්ද?`],
  },
  {
    name: "had been",
    nameSi: "පූර්ණ අතීත",
    en: (form, S, s, _p, c) => {
      const q = ["Had", "Did", "Was", "Is"];
      return form === "pos"
        ? [`${S} `, "had been", ` ${c}.`, ["had been", "had be", "had being", "was been"]]
        : form === "q"
          ? ["", "Had", ` ${s} been ${c}?`, q]
          : form === "neg"
            ? [`${S} `, "had not been", ` ${c}.`, ["had not been", "had been not", "not had been", "had not be"]]
            : ["", "Had", ` ${s} not been ${c}?`, q];
    },
    si: (c) => [`${c} ඉඳලා තිබුණා.`, `${c} ඉඳලා තිබුණාද?`, `${c} ඉඳලා තිබුණේ නැහැ.`, `${c} ඉඳලා තිබුණේ නැද්ද?`],
  },
  {
    name: "used to be",
    nameSi: "කලින් (පුරුද්දක් ලෙස)",
    en: (form, S, s, _p, c) => {
      const q = ["Did", "Do", "Was", "Used"];
      return form === "pos"
        ? [`${S} `, "used to be", ` ${c}.`, ["used to be", "use to be", "used to being", "using to be"]]
        : form === "q"
          ? ["", "Did", ` ${s} use to be ${c}?`, q]
          : form === "neg"
            ? [`${S} `, "did not use to be", ` ${c}.`, ["did not use to be", "did not used to be", "not used to be", "was not use to be"]]
            : ["", "Did", ` ${s} not use to be ${c}?`, q];
    },
    si: (c) => [`කලින් ${c} හිටියා.`, `කලින් ${c} හිටියාද?`, `කලින් ${c} හිටියේ නැහැ.`, `කලින් ${c} හිටියේ නැද්ද?`],
  },
  modalBe("can", "cannot", "හැකියාව (පුළුවන්)", (c) => [`${c} ඉන්න පුළුවන්.`, `${c} ඉන්න පුළුවන්ද?`, `${c} ඉන්න බැහැ.`, `${c} ඉන්න බැරිද?`]),
  modalBe("could", "could not", "අතීත හැකියාව", (c) => [`${c} ඉන්න පුළුවන් වුණා.`, `${c} ඉන්න පුළුවන් වුණාද?`, `${c} ඉන්න බැරි වුණා.`, `${c} ඉන්න බැරි වුණාද?`]),
  modalBe("should", "should not", "උපදෙස (ඕනේ)", (c) => [`${c} ඉන්න ඕනේ.`, `${c} ඉන්න ඕනෙද?`, `${c} ඉන්න හොඳ නැහැ.`, `${c} ඉන්න ඕනේ නැද්ද?`]),
  modalBe("must", "must not", "අනිවාර්යය", (c) => [`${c} ඉන්නම ඕනේ.`, `${c} ඉන්නම ඕනෙද?`, `${c} ඉන්න කොහෙත්ම හොඳ නැහැ.`, `${c} ඉන්න ඕනේ නැද්ද?`]),
  {
    name: "have to be",
    nameSi: "සිදු වීම (වෙනවා)",
    en: (form, S, s, p, c) => {
      const o = p.has === "has" ? "have" : "has";
      const D = cap(p.does);
      const q = [D, D === "Does" ? "Do" : "Does", "Is", "Has"];
      return form === "pos"
        ? [`${S} `, `${p.has} to be`, ` ${c}.`, [`${p.has} to be`, `${o} to be`, `${p.has} be`, `${p.has} to being`]]
        : form === "q"
          ? ["", D, ` ${s} have to be ${c}?`, q]
          : form === "neg"
            ? [`${S} `, `${p.does} not have to be`, ` ${c}.`, [`${p.does} not have to be`, `${p.does === "does" ? "do" : "does"} not have to be`, `${p.does} not has to be`, "not have to be"]]
            : ["", D, ` ${s} not have to be ${c}?`, q];
    },
    si: (c) => [`${c} ඉන්නම වෙනවා.`, `${c} ඉන්නම වෙනවාද?`, `${c} ඉන්න ඕනේ නැහැ.`, `${c} ඉන්න ඕනේ නැද්ද?`],
  },
  modalBe("might", "might not", "සමහරවිට", (c) => [`සමහරවිට ${c} ඉඳීවි.`, `සමහරවිට ${c} ඉඳීවිද?`, `සමහරවිට ${c} නොසිටීවි.`, `සමහරවිට ${c} නොසිටීවිද?`]),
];

/** The 12 Be patterns (for the rule card). */
export const BE_PATTERN_NAMES = BE_PATTERNS.map((p) => ({ name: p.name, si: p.nameSi }));
export const BE_GROUP_SIZE = BE_PATTERNS.length * FORMS.length; // 48

/** Each frame = one card: one person + one complement in all 12 patterns × 4 forms (48 sentences). */
export function beLevel(info: LevelInfo, frames: BeFrame[], start: number): Level {
  const sentences: Sentence[] = [];
  frames.forEach(([en, si], f) => {
    const s = PEOPLE[(start + f) % PEOPLE.length];
    const p = PRON[s.pr];
    const c = fill(en, s);
    const cSi = fill(si, s);
    for (const pat of BE_PATTERNS) {
      const si4 = pat.si(cSi);
      FORMS.forEach(({ id: form }, i) => {
        const [b, a, after, opts] = pat.en(form, cap(s.en), s.en, p, c);
        sentences.push(mk(b, a, after, opts, `${s.si} ${si4[i]}`, form, f + 1, pat.name));
      });
    }
  });
  return { ...info, sentences };
}
