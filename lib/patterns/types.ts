/**
 * Zero to Hero sentence patterns.
 * Each sentence has one gap written as [correct|wrong|wrong]: the FIRST option is correct.
 */
export type Pattern = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  title: string;
  formula: string;
  tip: string;
  si: string; // short Sinhala explanation
  sentences: string[];
};

export const P = (id: string, level: Pattern["level"], title: string, formula: string, tip: string, si: string, sentences: string[]): Pattern => ({
  id,
  level,
  title,
  formula,
  tip,
  si,
  sentences,
});

/** Extra wrong answers for patterns with a small, closed set of choices (never correct in that pattern). */
const EXTRA: Record<string, string[]> = {
  "be-noun": ["be", "being", "been"],
  "be-adjective": ["be", "being", "been"],
  "this-that": ["Them", "Their"],
  "there-is": ["be", "been"],
  "have-has": ["having", "haves"],
  "do-does": ["Doing", "Done"],
  "dont-doesnt": ["not", "isn't"],
  "can-cant": ["could to", "able"],
  articles: ["these", "those"],
  "prepositions-place": ["of", "with"],
  possessives: ["mine", "yours", "hers"],
  "was-were": ["be", "been"],
  "much-many": ["lot", "every"],
  "ever-already-yet": ["since", "ago"],
  "for-since": ["ago", "from"],
  "too-enough": ["very enough", "so much enough"],
  "relative-clauses": ["whose", "what"],
  "should-must": ["musts", "shoulds"],
  "so-such": ["so a", "much"],
  "modals-deduction": ["musts", "mights"],
  "cleft-sentences": ["am", "whose", "were being"],
  "question-tags": ["isn't they", "don't it"],
};

/**
 * Four answers for a sentence (correct first): the 3 written options + 1 extra wrong answer.
 * The extra comes from the pattern's safe list, or from wrong options of other sentences
 * in the same pattern that are never a correct answer anywhere in that pattern.
 */
export function fourOptions(p: Pattern, sentence: string): string[] {
  const g = parseGap(sentence);
  if (g.options.length >= 4) return g.options.slice(0, 4);
  const all = p.sentences.map(parseGap);
  const correct = new Set(all.map((x) => x.answer.toLowerCase()));
  const have = new Set(g.options.map((o) => o.toLowerCase()));
  const fromList = (EXTRA[p.id] ?? []).filter((e) => !have.has(e.toLowerCase()));
  const fromOthers = all
    .flatMap((x) => x.options.slice(1))
    .filter((o) => !correct.has(o.toLowerCase()) && !have.has(o.toLowerCase()));
  // Deterministic order (same answers every time for the same sentence).
  const seed = [...sentence].reduce((a, c) => a + c.charCodeAt(0), 0);
  const others = [...new Set(fromOthers)];
  const rotated = others.length ? [...others.slice(seed % others.length), ...others.slice(0, seed % others.length)] : [];
  const out = [...g.options];
  for (const c of [...fromList, ...rotated]) {
    if (out.length >= 4) break;
    if (!out.some((o) => o.toLowerCase() === c.toLowerCase())) out.push(c);
  }
  return out;
}

/** "She [is|am|are] happy." → { before, answer, options, after, full } */
export function parseGap(s: string) {
  const m = s.match(/^(.*)\[([^\]]+)\](.*)$/);
  if (!m) return { before: s, answer: "", options: [] as string[], after: "", full: s };
  const options = m[2].split("|").map((o) => o.trim());
  return { before: m[1], answer: options[0], options, after: m[3], full: `${m[1]}${options[0]}${m[3]}` };
}
