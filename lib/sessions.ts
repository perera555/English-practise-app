import { SESSION_COUNT } from "./pte";
import { TWISTER_SESSIONS } from "./twisters";

export type SessionKind = "listening" | "speaking" | "pte" | "twisters";

export const SESSION_TOTALS: Record<SessionKind, number> = {
  listening: 10,
  speaking: 10,
  pte: SESSION_COUNT,
  twisters: TWISTER_SESSIONS,
};
