import "server-only";
import { Pool } from "pg";

/**
 * PostgreSQL connection (Neon, Supabase, Vercel Postgres, or any Postgres).
 * Set DATABASE_URL (or POSTGRES_URL) in Vercel → Settings → Environment Variables.
 * The tables are created automatically the first time they are needed.
 */
export const PG_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS app_kv (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app_photos (
  key        text PRIMARY KEY,
  info       jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS customers (
  user_id    text PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL DEFAULT '',
  photo      text NOT NULL DEFAULT '',
  platform   text NOT NULL DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_seen (
  user_id   text PRIMARY KEY,
  last_seen bigint NOT NULL
);
CREATE TABLE IF NOT EXISTS user_data (
  user_id    text NOT NULL,
  kind       text NOT NULL,
  data       jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind)
);
`;

function getPool() {
  if (!pool) {
    const local = /localhost|127\.0\.0\.1/.test(PG_URL);
    pool = new Pool({
      connectionString: PG_URL,
      max: 3,
      ssl: local || /sslmode=disable/.test(PG_URL) ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

/** Run a query (creates the tables first, once per server start). */
export async function sql<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const p = getPool();
  ready ??= p
    .query(SCHEMA)
    .then(() => undefined)
    .catch((e) => {
      ready = null;
      throw e;
    });
  await ready;
  const res = await p.query(text, params);
  return res.rows as T[];
}
