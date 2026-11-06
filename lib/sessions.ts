import { SESSION_COUNT } from "./pte";
import { TWISTER_SESSIONS } from "./twisters";

/** What free users get. Everything else needs Premium. */
export const FREE = {
  chapters: 5, // chapters 1-5
  sessions: 1, // session 1 of each kind
  songs: 2, // first 2 songs
};

export type SessionKind = "listening" | "speaking" | "pte" | "twisters";

export const SESSION_TOTALS: Record<SessionKind, number> = {
  listening: 10,
  speaking: 10,
  pte: SESSION_COUNT,
  twisters: TWISTER_SESSIONS,
};
