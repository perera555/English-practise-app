import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { PG_URL, sql } from "./pg";
import type { Lesson, Song, Video } from "./types";

/**
 * The app's database.
 * - PostgreSQL (preferred): DATABASE_URL or POSTGRES_URL. Tables are created automatically.
 * - Upstash Redis REST: UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN.
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

export type StorageMode = "postgres" | "upstash" | "local-file";

export function storageMode(): StorageMode {
  if (PG_URL) return "postgres";
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

async function readFile(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}
async function writeFile(all: Record<string, unknown>) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}

/* ---------- Key → JSON value (content, grants, codes) ---------- */

export async function dbGet<K extends keyof Schema>(key: K): Promise<Schema[K]> {
  const mode = storageMode();
  let v: Schema[K] | undefined;
  if (mode === "postgres") {
    const rows = await sql<{ value: Schema[K] }>("SELECT value FROM app_kv WHERE key = $1", [key]);
    v = rows[0]?.value;
  } else if (mode === "upstash") {
    const { result } = await redis(["GET", PREFIX + key]);
    v = result ? JSON.parse(String(result)) : undefined;
  } else {
    v = (await readFile())[key] as Schema[K] | undefined;
  }
  return v ? ({ ...structuredClone(DEFAULTS[key]), ...v } as Schema[K]) : structuredClone(DEFAULTS[key]);
}

export async function dbSet<K extends keyof Schema>(key: K, value: Schema[K]) {
  const mode = storageMode();
  if (mode === "postgres") {
    await sql("INSERT INTO app_kv (key, value, updated_at) VALUES ($1, $2, now()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()", [key, JSON.stringify(value)]);
    return;
  }
  if (mode === "upstash") {
    await redis(["SET", PREFIX + key, JSON.stringify(value)]);
    return;
  }
  const all = await readFile();
  all[key] = value;
  await writeFile(all);
}

/* ---------- Redis / file hashes (fallback storage) ---------- */

async function hashAll(key: string): Promise<Record<string, string>> {
  if (storageMode() === "upstash") {
    const { result } = await redis(["HGETALL", key]);
    const arr = (result as string[] | null) ?? [];
    const out: Record<string, string> = {};
    for (let i = 0; i + 1 < arr.length; i += 2) out[arr[i]] = arr[i + 1];
    return out;
  }
  return ((await readFile())[key] as Record<string, string>) ?? {};
}

async function hashSet(key: string, field: string, value: string | null) {
  if (storageMode() === "upstash") {
    await redis(value === null ? ["HDEL", key, field] : ["HSET", key, field, value]);
    return;
  }
  const all = await readFile();
  const h = ((all[key] as Record<string, string>) ??= {});
  if (value === null) delete h[field];
  else h[field] = value;
  await writeFile(all);
}

/* ---------- Customers (profiles + last seen) ---------- */

export type Customer = { name: string; email: string; photo: string; platform: string; createdAt: string; updatedAt: string };

const USERS = PREFIX + "users";
const SEEN = PREFIX + "seen";

type CustomerRow = { user_id: string; name: string; email: string; photo: string; platform: string; created_at: Date; updated_at: Date };
const fromRow = (r: CustomerRow): Customer => ({
  name: r.name,
  email: r.email,
  photo: r.photo,
  platform: r.platform,
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
});

export async function customersAll(): Promise<Record<string, Customer>> {
  if (storageMode() === "postgres") {
    const rows = await sql<CustomerRow>("SELECT * FROM customers ORDER BY updated_at DESC");
    return Object.fromEntries(rows.map((r) => [r.user_id, fromRow(r)]));
  }
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
  const mode = storageMode();
  if (mode === "postgres") {
    const rows = await sql<CustomerRow>("SELECT * FROM customers WHERE user_id = $1", [id]);
    return rows[0] ? fromRow(rows[0]) : null;
  }
  if (mode === "upstash") {
    const { result } = await redis(["HGET", USERS, id]);
    return result ? JSON.parse(String(result)) : null;
  }
  const v = (await hashAll(USERS))[id];
  return v ? JSON.parse(v) : null;
}

export async function customerSet(id: string, c: Customer | null) {
  if (storageMode() === "postgres") {
    if (!c) await sql("DELETE FROM customers WHERE user_id = $1", [id]);
    else
      await sql(
        `INSERT INTO customers (user_id, name, email, photo, platform, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, photo = EXCLUDED.photo, platform = EXCLUDED.platform, updated_at = EXCLUDED.updated_at`,
        [id, c.name, c.email, c.photo, c.platform, c.createdAt, c.updatedAt],
      );
    return;
  }
  await hashSet(USERS, id, c ? JSON.stringify(c) : null);
}

/** Last time each user's app was open (ms since 1970). */
export async function seenAll(): Promise<Record<string, number>> {
  if (storageMode() === "postgres") {
    const rows = await sql<{ user_id: string; last_seen: string }>("SELECT user_id, last_seen FROM user_seen");
    return Object.fromEntries(rows.map((r) => [r.user_id, Number(r.last_seen)]));
  }
  const raw = await hashAll(SEEN);
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v)]));
}

export async function seenSet(id: string) {
  if (storageMode() === "postgres") {
    await sql("INSERT INTO user_seen (user_id, last_seen) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET last_seen = EXCLUDED.last_seen", [id, Date.now()]);
    return;
  }
  await hashSet(SEEN, id, String(Date.now()));
}

export async function seenDelete(id: string) {
  if (storageMode() === "postgres") {
    await sql("DELETE FROM user_seen WHERE user_id = $1", [id]);
    return;
  }
  await hashSet(SEEN, id, null);
}

/* ---------- Photos: one row / field per picture ---------- */

export type PhotoInfo = {
  url: string; // landscape image URL
  photographer: string;
  photographerUrl: string;
  pageUrl: string; // link to the photo page (attribution)
  alt: string;
};

const PHOTOS = PREFIX + "photos";

export async function photosAll(): Promise<Record<string, PhotoInfo>> {
  const mode = storageMode();
  if (mode === "postgres") {
    const rows = await sql<{ key: string; info: PhotoInfo }>("SELECT key, info FROM app_photos");
    return Object.fromEntries(rows.map((r) => [r.key, r.info]));
  }
  if (mode === "upstash") {
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
  return ((await readFile()).photos as Record<string, PhotoInfo>) ?? {};
}

export async function photoSet(key: string, info: PhotoInfo | null) {
  const mode = storageMode();
  if (mode === "postgres") {
    if (info) await sql("INSERT INTO app_photos (key, info, updated_at) VALUES ($1, $2, now()) ON CONFLICT (key) DO UPDATE SET info = EXCLUDED.info, updated_at = now()", [key, JSON.stringify(info)]);
    else await sql("DELETE FROM app_photos WHERE key = $1", [key]);
    return;
  }
  if (mode === "upstash") {
    await redis(info ? ["HSET", PHOTOS, key, JSON.stringify(info)] : ["HDEL", PHOTOS, key]);
    return;
  }
  const all = await readFile();
  const photos = ((all.photos as Record<string, PhotoInfo>) ??= {});
  if (info) photos[key] = info;
  else delete photos[key];
  await writeFile(all);
}

/* ---------- Each learner's own data (progress, notebook, settings…) ---------- */

/** What the app backs up for each learner (browser storage keys). */
export const USER_KINDS = ["erp-progress", "erp-notebook-v1", "erp-settings", "erp-profile"] as const;
export type UserKind = (typeof USER_KINDS)[number];
export type UserBackup = Partial<Record<UserKind, unknown>> & { updatedAt?: number };

export async function userDataGet(id: string): Promise<UserBackup> {
  const mode = storageMode();
  if (mode === "postgres") {
    const rows = await sql<{ kind: UserKind; data: unknown; updated_at: Date }>("SELECT kind, data, updated_at FROM user_data WHERE user_id = $1", [id]);
    const out: UserBackup = {};
    for (const r of rows) {
      out[r.kind] = r.data;
      out.updatedAt = Math.max(out.updatedAt ?? 0, new Date(r.updated_at).getTime());
    }
    return out;
  }
  const raw = (await hashAll(PREFIX + "userdata"))[id];
  return raw ? JSON.parse(raw) : {};
}

export async function userDataSet(id: string, data: UserBackup) {
  const mode = storageMode();
  if (mode === "postgres") {
    for (const kind of USER_KINDS) {
      if (data[kind] === undefined) continue;
      await sql(
        "INSERT INTO user_data (user_id, kind, data, updated_at) VALUES ($1, $2, $3, now()) ON CONFLICT (user_id, kind) DO UPDATE SET data = EXCLUDED.data, updated_at = now()",
        [id, kind, JSON.stringify(data[kind])],
      );
    }
    return;
  }
  const old = await userDataGet(id);
  await hashSet(PREFIX + "userdata", id, JSON.stringify({ ...old, ...data, updatedAt: Date.now() }));
}
