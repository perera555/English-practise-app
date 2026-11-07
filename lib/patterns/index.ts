import { LEVEL12 } from "./level12";
import { LEVEL3 } from "./level3";
import { LEVEL45 } from "./level45";
export { parseGap, fourOptions, type Pattern } from "./types";

/** Zero to Hero: 50 sentence patterns × 20 sentences = 1,000 sentences, Beginner → Advanced. */
export const PATTERNS = [...LEVEL12, ...LEVEL3, ...LEVEL45].sort((a, b) => a.level - b.level);

export const FREE_PATTERNS = 6; // first 6 patterns are free
