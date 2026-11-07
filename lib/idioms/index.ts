import { IDIOMS, type Expr } from "../advanced";
import { PART1 } from "./part1";
import { PART2 } from "./part2";
import { PART3 } from "./part3";
import { PART4 } from "./part4";
import { PART5 } from "./part5";
import { PART6 } from "./part6";

export type TopicExpr = Expr & { topic: string };
type Group = { topic: string; emoji: string; lines: string };

/** Turn "idiom | meaning | Sinhala | example" lines into expressions (incomplete lines are skipped). */
export function parseGroups(groups: Group[], seen = new Set<string>(), byMeaning = false): TopicExpr[] {
  const out: TopicExpr[] = [];
  for (const g of groups) {
    for (const raw of g.lines.split("\n")) {
      const [en, meaning, si, example] = raw.split("|").map((s) => s.trim());
      if (!en || !meaning || !si || !example) continue;
      // Phrasal verbs can have several meanings, so they are unique by verb + meaning.
      const key = byMeaning ? `${en.toLowerCase()}|${meaning.toLowerCase()}` : en.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ en, meaning, si, example, emoji: g.emoji, topic: g.topic });
    }
  }
  return out;
}

export const IDIOM_GROUPS: Group[] = [...PART1, ...PART2, ...PART3, ...PART4, ...PART5, ...PART6];

/** The original hand-picked expressions first ("Favourites"), then the big topic lists. */
export function withTopics(favourites: Expr[], groups: Group[], byMeaning = false): TopicExpr[] {
  const seen = new Set(favourites.map((x) => (byMeaning ? `${x.en.toLowerCase()}|${x.meaning.toLowerCase()}` : x.en.toLowerCase())));
  return [...favourites.map((x) => ({ ...x, topic: "Favourites" })), ...parseGroups(groups, seen, byMeaning)];
}

export const ALL_IDIOMS: TopicExpr[] = withTopics(IDIOMS, IDIOM_GROUPS);
