"use client";

import { apiUrl } from "./api";
import { getUserId } from "./premium";

/**
 * ☁️ Cloud backup: the learner's progress, notebook, settings and profile are saved in the
 * online database (PostgreSQL) and come back on a new phone or computer.
 * Everything still works offline: the device copy is used first, the cloud is a backup.
 */

const KINDS = ["erp-progress", "erp-notebook-v1", "erp-settings", "erp-profile"] as const;
const ID_KEY = "erp-user-id";
const LAST_KEY = "erp-sync-last"; // ms of the last successful backup
const CHECKED_KEY = "erp-sync-checked"; // "1" once this device asked the cloud for old data

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage blocked */
  }
};

function snapshot(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of KINDS) {
    const raw = read(k);
    if (!raw) continue;
    try {
      out[k] = JSON.parse(raw);
    } catch {
      /* skip */
    }
  }
  return out;
}

/** True when this device has nothing worth keeping yet (a fresh install). */
function isFresh() {
  const p = read("erp-progress");
  const n = read("erp-notebook-v1");
  const noProgress = !p || p === '{"done":{},"minutes":0,"days":[],"sessions":{}}';
  const noNotes = !n || n === '{"notes":[],"saved":[]}';
  return noProgress && noNotes;
}

let lastSent = "";
let started = false;
let pauseUntil = 0; // after a failure, wait before trying again

export function lastBackup(): number {
  return Number(read(LAST_KEY) ?? 0);
}

/** Send the data now. Returns true when it was saved online. */
export async function backupNow(): Promise<boolean> {
  const data = snapshot();
  const body = JSON.stringify({ userId: getUserId(), data });
  try {
    const res = await fetch(apiUrl("/api/sync"), { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: body.length < 60000 });
    if (!res.ok) {
      pauseUntil = Date.now() + 10 * 60000;
      return false;
    }
    lastSent = JSON.stringify(data);
    write(LAST_KEY, String(Date.now()));
    return true;
  } catch {
    pauseUntil = Date.now() + 2 * 60000;
    return false;
  }
}

async function fetchBackup(id: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(apiUrl(`/api/sync?userId=${encodeURIComponent(id)}`), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function restore(data: Record<string, unknown>) {
  let any = false;
  for (const k of KINDS) {
    if (data[k] && typeof data[k] === "object") {
      write(k, JSON.stringify(data[k]));
      any = true;
    }
  }
  return any;
}

/** Use the backup code from another device: this device takes that learner's data. */
export async function restoreFromCode(code: string): Promise<{ ok: boolean; message: string }> {
  const id = code.trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) return { ok: false, message: "That code does not look right. It starts with u_." };
  const data = await fetchBackup(id);
  if (!data) return { ok: false, message: "Could not reach the online database. Check the internet and try again." };
  if (!KINDS.some((k) => data[k])) return { ok: false, message: "No saved data was found for that code." };
  write(ID_KEY, id);
  restore(data);
  write(CHECKED_KEY, "1");
  write(LAST_KEY, String(Date.now()));
  window.location.reload();
  return { ok: true, message: "Restored! Reloading…" };
}

/** Start once when the app opens. */
export function startCloudSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  // A fresh device asks the cloud once: same code (e.g. reinstalled browser data kept the code) → bring the data back.
  if (read(CHECKED_KEY) !== "1") {
    fetchBackup(getUserId()).then((data) => {
      if (!data) return; // offline: try again next time
      write(CHECKED_KEY, "1");
      if (isFresh() && restore(data)) window.location.reload();
    });
  }

  const tick = () => {
    if (Date.now() < pauseUntil) return;
    const now = JSON.stringify(snapshot());
    if (now !== lastSent && now !== "{}") backupNow();
  };
  setTimeout(tick, 5000);
  setInterval(tick, 30000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") tick();
  });
}
