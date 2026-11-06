"use client";

import { useEffect, useSyncExternalStore } from "react";
import { apiUrl } from "./api";
import { getUserId } from "./premium";
import { nativePlatform } from "./native";

/** The customer's profile, saved on the device and synced to our server (for the admin's customer list). */
export type Profile = { name: string; email: string; photo: string };

const KEY = "erp-profile";
let profile: Profile | null = null;
let loaded = false;
let online = true;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  online = navigator.onLine;
  try {
    const raw = localStorage.getItem(KEY);
    profile = raw ? JSON.parse(raw) : null;
  } catch {
    profile = null;
  }
}

async function post(body: object) {
  try {
    const res = await fetch(apiUrl("/api/presence"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: getUserId(), ...body }),
    });
    const j = await res.json().catch(() => ({}));
    return res.ok ? { ok: true as const } : { ok: false as const, error: (j.error as string) ?? "Could not save." };
  } catch {
    return { ok: false as const, error: "offline" };
  }
}

/** Save (or update) the profile. Works offline too: it syncs the next time the app is online. */
export async function saveProfile(p: Profile) {
  load();
  profile = { name: p.name.trim(), email: p.email.trim(), photo: p.photo };
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    localStorage.setItem(KEY + "-dirty", "1");
  } catch {
    /* ignore */
  }
  emit();
  const r = await post({ profile: { ...profile, platform: nativePlatform() } });
  if (r.ok) localStorage.removeItem(KEY + "-dirty");
  return r.ok || r.error === "offline" ? { ok: true as const } : r;
}

export async function logOut() {
  load();
  profile = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
  await post({ profile: null });
}

/** Shrinks a picture to a small square JPEG (keeps uploads tiny). */
export async function toAvatar(file: Blob, size = 160): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const s = Math.min(img.width, img.height);
    c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    return c.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

let started = false;
function startPresence() {
  if (started || typeof window === "undefined") return;
  started = true;
  const beat = async () => {
    if (document.visibilityState !== "visible" || !navigator.onLine) return;
    const dirty = localStorage.getItem(KEY + "-dirty") === "1" && profile;
    const r = await post(dirty ? { profile: { ...profile, platform: nativePlatform() } } : {});
    if (dirty && r.ok) localStorage.removeItem(KEY + "-dirty");
  };
  void beat();
  setInterval(beat, 120000);
  const net = () => {
    online = navigator.onLine;
    emit();
    if (online) void beat();
  };
  window.addEventListener("online", net);
  window.addEventListener("offline", net);
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && void beat());
}

type Snap = { profile: Profile | null; online: boolean };
let snap: Snap = { profile: null, online: true };
const SERVER: Snap = { profile: null, online: true };

export function useProfile(): Snap {
  const s = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      if (snap.profile !== profile || snap.online !== online) snap = { profile, online };
      return snap;
    },
    () => SERVER,
  );
  useEffect(() => startPresence(), []);
  return s;
}
