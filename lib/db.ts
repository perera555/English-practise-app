import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Lesson, Song, Video } from "./types";

/**
 * Tiny key-value store.
 * - Online (Vercel): Upstash Redis REST, using UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN.
 * - Local development: a JSON file in .data/db.json.
 */

export type CustomContent = {
  chapters: Lesson[];
  songs: Song[];
  twisters: { group: string; text: string }[];
  videos: Video[];
};

export type Grant = { until: string | null; note: string; createdAt: string };
export type GiftCode = { createdAt: string; days: number | null; usedBy?: string; usedAt?: string };

type Schema = {
  content: CustomContent;
  grants: Record<string, Grant>;
  codes: Record<string, GiftCode>;
};

const DEFAULTS: Schema = {
  content: { chapters: [], songs: [], twisters: [], videos: [] },
  grants: {},
  codes: {},
};

const REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const FILE = path.join(process.cwd(), ".data", "db.json");
const PREFIX = "speakup:";

export function storageMode() {
  return REST_URL && REST_TOKEN ? "upstash" : "local-file";
}

async function redis(cmd: (string | number)[]) {
  const res = await fetch(REST_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Storage error ${res.status}`);
  return (await res.json()) as { result: unknown };
}

async function readFile(): Promise<Partial<Schema>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

export async function dbGet<K extends keyof Schema>(key: K): Promise<Schema[K]> {
  if (storageMode() === "upstash") {
    const { result } = await redis(["GET", PREFIX + key]);
    return result ? { ...DEFAULTS[key], ...JSON.parse(String(result)) } : structuredClone(DEFAULTS[key]);
  }
  const all = await readFile();
  const v = all[key] as Schema[K] | undefined;
  return v ? ({ ...structuredClone(DEFAULTS[key]), ...v } as Schema[K]) : structuredClone(DEFAULTS[key]);
}

export async function dbSet<K extends keyof Schema>(key: K, value: Schema[K]) {
  if (storageMode() === "upstash") {
    await redis(["SET", PREFIX + key, JSON.stringify(value)]);
    return;
  }
  const all = await readFile();
  all[key] = value;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}
