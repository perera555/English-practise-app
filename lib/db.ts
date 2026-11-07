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
  /** Admin edits of built-in chapters (by chapter id). */
  overrides: Record<string, Lesson>;
  /** Built-in items the admin removed, e.g. "ch:cafe", "daily:bank", "story:x", "song:x", "speech:x". */
  hidden: string[];
  /** Admin-written Sinhala meanings for dictionary words (lowercase word → Sinhala). */
  si: Record<string, string>;
};

export type Grant = { until: string | null; note: string; createdAt: string };
export type GiftCode = { createdAt: string; days: number | null; usedBy?: string; usedAt?: string };

type Schema = {
  content: CustomContent;
  grants: Record<string, Grant>;
  codes: Record<string, GiftCode>;
};

const DEFAULTS: Schema = {
  content: { chapters: [], songs: [], twisters: [], videos: [], overrides: {}, hidden: [], si: {} },
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

/* ---------- Customers (profiles + last seen) ---------- */

export type Customer = { name: string; email: string; photo: string; platform: string; createdAt: string; updatedAt: string };

const USERS = PREFIX + "users";
const SEEN = PREFIX + "seen";

async function hashAll(key: string): Promise<Record<string, string>> {
  if (storageMode() === "upstash") {
    const { result } = await redis(["HGETALL", key]);
    const arr = (result as string[] | null) ?? [];
    const out: Record<string, string> = {};
    for (let i = 0; i + 1 < arr.length; i += 2) out[arr[i]] = arr[i + 1];
    return out;
  }
  return (((await readFile()) as Record<string, unknown>)[key] as Record<string, string>) ?? {};
}

async function hashSet(key: string, field: string, value: string | null) {
  if (storageMode() === "upstash") {
    await redis(value === null ? ["HDEL", key, field] : ["HSET", key, field, value]);
    return;
  }
  const all = (await readFile()) as Record<string, unknown>;
  const h = ((all[key] as Record<string, string>) ??= {});
  if (value === null) delete h[field];
  else h[field] = value;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function customersAll(): Promise<Record<string, Customer>> {
  const raw = await hashAll(USERS);
  const out: Record<string, Customer> = {};
  for (const [k, v] of Object.entries(raw)) {
    try {
      out[k] = JSON.parse(v);
    } catch {
      /* skip */
    }
  }
  return out;
}

export async function customerGet(id: string): Promise<Customer | null> {
  if (storageMode() === "upstash") {
    const { result } = await redis(["HGET", USERS, id]);
    return result ? JSON.parse(String(result)) : null;
  }
  const v = (await hashAll(USERS))[id];
  return v ? JSON.parse(v) : null;
}

export async function customerSet(id: string, c: Customer | null) {
  await hashSet(USERS, id, c ? JSON.stringify(c) : null);
}

/** Last time each user's app was open (ms since 1970). */
export async function seenAll(): Promise<Record<string, number>> {
  const raw = await hashAll(SEEN);
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v)]));
}

export async function seenSet(id: string) {
  await hashSet(SEEN, id, String(Date.now()));
}

export async function seenDelete(id: string) {
  await hashSet(SEEN, id, null);
}

/* ---------- Photos: one field per picture (safe for many writes at once) ---------- */

export type PhotoInfo = {
  url: string; // landscape image URL
  photographer: string;
  photographerUrl: string;
  pageUrl: string; // link to the photo page (attribution)
  alt: string;
};

const PHOTOS = PREFIX + "photos";

export async function photosAll(): Promise<Record<string, PhotoInfo>> {
  if (storageMode() === "upstash") {
    const { result } = await redis(["HGETALL", PHOTOS]);
    const arr = (result as string[] | null) ?? [];
    const out: Record<string, PhotoInfo> = {};
    for (let i = 0; i + 1 < arr.length; i += 2) {
      try {
        out[arr[i]] = JSON.parse(arr[i + 1]);
      } catch {
        /* skip bad entry */
      }
    }
    return out;
  }
  return ((await readFile()) as { photos?: Record<string, PhotoInfo> }).photos ?? {};
}

export async function photoSet(key: string, info: PhotoInfo | null) {
  if (storageMode() === "upstash") {
    await redis(info ? ["HSET", PHOTOS, key, JSON.stringify(info)] : ["HDEL", PHOTOS, key]);
    return;
  }
  const all = (await readFile()) as Partial<Schema> & { photos?: Record<string, PhotoInfo> };
  all.photos ??= {};
  if (info) all.photos[key] = info;
  else delete all.photos[key];
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
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
