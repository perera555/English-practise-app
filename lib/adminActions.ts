"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminCookieValue, checkPassword, requireAdmin } from "./adminAuth";
import { customerGet, customerSet, dbGet, dbSet, photosAll, photoSet, seenDelete, type CustomContent, type PhotoInfo } from "./db";
import { pexelsEnabled, searchPhotos, searchYouTube, youtubeEnabled, type YouTubeResult } from "./mediaServer";
import { PHOTO_QUERIES } from "./photoQueries";
import { BUNDLED_PHOTOS } from "./bundledPhotos";
import { chapters as builtInChapters } from "./content";
import { validUserId } from "./premiumServer";
import type { Lesson, Song, Video } from "./types";

type Result = { ok: true; message?: string; codes?: string[] } | { ok: false; error: string };

/* ---------------- Login ---------------- */

export async function adminLogin(_: unknown, form: FormData): Promise<Result> {
  const pw = String(form.get("password") ?? "");
  if (!checkPassword(pw)) {
    await new Promise((r) => setTimeout(r, 900)); // slow down guessing
    return { ok: false, error: "Wrong password." };
  }
  (await cookies()).set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/* ---------------- Users & Premium ---------------- */

export async function grantPremium(userId: string, days: number | null, note: string): Promise<Result> {
  await requireAdmin();
  const id = userId.trim();
  if (!validUserId(id)) return { ok: false, error: "That user ID does not look right. It starts with u_ and is shown on the user's Premium page." };
  const grants = await dbGet("grants");
  grants[id] = {
    until: days ? new Date(Date.now() + days * 86400000).toISOString() : null,
    note: note.slice(0, 120) || (days ? `${days} days` : "Lifetime"),
    createdAt: new Date().toISOString(),
  };
  await dbSet("grants", grants);
  return { ok: true, message: `Premium given to ${id}.` };
}

export async function adminUpdateCustomer(id: string, patch: { name: string; email: string; removePhoto: boolean }): Promise<Result> {
  await requireAdmin();
  const c = await customerGet(id);
  if (!c) return { ok: false, error: "Customer not found." };
  const name = patch.name.trim().slice(0, 40);
  if (!name) return { ok: false, error: "Name can't be empty." };
  await customerSet(id, { ...c, name, email: patch.email.trim().slice(0, 80), photo: patch.removePhoto ? "" : c.photo, updatedAt: new Date().toISOString() });
  return { ok: true, message: "Customer updated." };
}

/** Deletes the customer's profile, online status and any admin-given Premium. (Store subscriptions are cancelled by the customer in their store.) */
export async function adminDeleteCustomer(id: string): Promise<Result> {
  await requireAdmin();
  await customerSet(id, null);
  await seenDelete(id);
  const grants = await dbGet("grants");
  if (grants[id]) {
    delete grants[id];
    await dbSet("grants", grants);
  }
  return { ok: true, message: "Customer deleted." };
}

export async function revokePremium(userId: string): Promise<Result> {
  await requireAdmin();
  const grants = await dbGet("grants");
  delete grants[userId];
  await dbSet("grants", grants);
  return { ok: true, message: "Premium removed." };
}

export async function createCodes(count: number, days: number | null): Promise<Result> {
  await requireAdmin();
  const n = Math.max(1, Math.min(100, Math.floor(count)));
  const codes = await dbGet("codes");
  const made: string[] = [];
  for (let i = 0; i < n; i++) {
    const raw = randomBytes(5).toString("hex").toUpperCase();
    const code = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    codes[code] = { createdAt: new Date().toISOString(), days };
    made.push(code);
  }
  await dbSet("codes", codes);
  return { ok: true, codes: made, message: `${n} gift code(s) created.` };
}

export async function deleteCode(code: string): Promise<Result> {
  await requireAdmin();
  const codes = await dbGet("codes");
  delete codes[code];
  await dbSet("codes", codes);
  return { ok: true };
}

/* ---------------- Content ---------------- */

async function updateContent(fn: (c: CustomContent) => void) {
  const c = await dbGet("content");
  fn(c);
  await dbSet("content", c);
}

function slug(s: string) {
  return (
    "x-" +
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) +
    "-" +
    randomBytes(2).toString("hex")
  );
}

export async function saveChapter(lesson: Lesson): Promise<Result> {
  await requireAdmin();
  if (!lesson.title?.trim() || !Array.isArray(lesson.lines) || lesson.lines.length < 2) {
    return { ok: false, error: "A chapter needs a title and at least 2 dialogue lines." };
  }
  // Editing a built-in chapter (1-30): save it as an override, keeping its number and sport animation.
  const builtIn = builtInChapters.find((b) => b.id === lesson.id);
  if (builtIn) {
    await updateContent((c) => {
      c.overrides ??= {};
      c.overrides[builtIn.id] = { ...lesson, id: builtIn.id, chapter: builtIn.chapter, sport: builtIn.sport, unit: builtIn.unit };
    });
    return { ok: true, message: `Chapter ${builtIn.chapter} “${lesson.title}” updated. Phones get it the next time they are online.` };
  }
  let msg = "";
  await updateContent((c) => {
    const id = lesson.id || slug(lesson.title);
    const i = c.chapters.findIndex((x) => x.id === id);
    const chapter = 30 + (i >= 0 ? i + 1 : c.chapters.length + 1);
    const clean: Lesson = { ...lesson, id, chapter };
    if (i >= 0) c.chapters[i] = clean;
    else c.chapters.push(clean);
    msg = `Chapter ${chapter} “${lesson.title}” saved. It now appears in the app.`;
  });
  return { ok: true, message: msg };
}

/** Add or correct the Sinhala meaning of a dictionary word (empty = remove the correction). */
export async function setDictSinhala(word: string, si: string): Promise<Result> {
  await requireAdmin();
  const w = word.trim().toLowerCase();
  if (!/^[a-z][a-z' -]{0,40}$/.test(w)) return { ok: false, error: "Type an English word." };
  await updateContent((c) => {
    c.si ??= {};
    if (si.trim()) c.si[w] = si.trim().slice(0, 200);
    else delete c.si[w];
  });
  return { ok: true, message: si.trim() ? `Sinhala for “${w}” saved. It reaches every phone the next time it's online.` : `Correction for “${w}” removed.` };
}

/** Hide (remove) any built-in item: "ch:id", "daily:id", "story:id", "song:id", "speech:id". */
export async function hideItem(key: string): Promise<Result> {
  await requireAdmin();
  if (!/^(ch|daily|story|song|speech):[\w-]+$/.test(key)) return { ok: false, error: "Unknown item" };
  await updateContent((c) => {
    c.hidden = [...new Set([...(c.hidden ?? []), key])];
  });
  return { ok: true, message: "Removed from the app. You can restore it any time." };
}

/** Undo a hide, and undo any edits (back to the original built-in version). */
export async function restoreItem(key: string): Promise<Result> {
  await requireAdmin();
  await updateContent((c) => {
    c.hidden = (c.hidden ?? []).filter((k) => k !== key);
    if (key.startsWith("ch:") && c.overrides) delete c.overrides[key.slice(3)];
  });
  return { ok: true, message: "Restored to the original version." };
}

export async function deleteChapter(id: string): Promise<Result> {
  await requireAdmin();
  if (builtInChapters.some((b) => b.id === id)) return hideItem(`ch:${id}`);
  await updateContent((c) => {
    c.chapters = c.chapters.filter((x) => x.id !== id).map((x, i) => ({ ...x, chapter: 31 + i }));
  });
  return { ok: true, message: "Chapter deleted." };
}

export async function saveSong(song: Song): Promise<Result> {
  await requireAdmin();
  if (!song.title?.trim() || song.lines.length < 2) return { ok: false, error: "A song needs a title and at least 2 lines." };
  await updateContent((c) => {
    const id = song.id || slug(song.title);
    const i = c.songs.findIndex((x) => x.id === id);
    const clean = { ...song, id };
    if (i >= 0) c.songs[i] = clean;
    else c.songs.push(clean);
  });
  return { ok: true, message: `Song “${song.title}” saved.` };
}

export async function deleteSong(id: string): Promise<Result> {
  await requireAdmin();
  await updateContent((c) => {
    c.songs = c.songs.filter((x) => x.id !== id);
  });
  return { ok: true, message: "Song deleted." };
}

/* ---------------- Real pictures (Pexels) ---------------- */

export async function adminSearchPhotos(query: string): Promise<{ ok: true; photos: PhotoInfo[] } | { ok: false; error: string }> {
  await requireAdmin();
  if (!pexelsEnabled()) return { ok: false, error: "Add your free PEXELS_API_KEY first (see Admin guide → Real pictures)." };
  try {
    return { ok: true, photos: await searchPhotos(query.slice(0, 100), 15) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Search failed" };
  }
}

export async function adminSetPhoto(key: string, photo: PhotoInfo | null): Promise<Result> {
  await requireAdmin();
  if (!/^[a-z]+:[\w-]+$/.test(key)) return { ok: false, error: "Bad picture key" };
  await photoSet(key, photo);
  return { ok: true, message: photo ? "Picture changed ✅" : "Picture removed (drawn picture will show)." };
}

/** Finds a real photo for every picture that doesn't have one yet. */
export async function adminAutoFillPhotos(): Promise<Result> {
  await requireAdmin();
  if (!pexelsEnabled()) return { ok: false, error: "Add your free PEXELS_API_KEY first (see Admin guide → Real pictures)." };
  const have = await photosAll();
  let added = 0;
  let failed = 0;
  for (const [key, q] of Object.entries(PHOTO_QUERIES)) {
    if (have[key] || BUNDLED_PHOTOS[key]) continue; // keep built-in photos unless the admin changes one
    try {
      const [p] = await searchPhotos(q, 1);
      if (p) {
        await photoSet(key, p);
        added++;
      }
    } catch {
      failed++;
    }
  }
  return { ok: true, message: `Added ${added} real pictures.${failed ? ` ${failed} failed. Try again in a minute.` : ""}` };
}

/* ---------------- Real videos (YouTube search) ---------------- */

export async function adminSearchYouTube(query: string, captionsOnly: boolean): Promise<{ ok: true; results: YouTubeResult[] } | { ok: false; error: string }> {
  await requireAdmin();
  if (!youtubeEnabled()) return { ok: false, error: "Add your free YOUTUBE_API_KEY first (see Admin guide → Real videos)." };
  try {
    return { ok: true, results: await searchYouTube(query.slice(0, 120), { captionsOnly }) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Search failed" };
  }
}

/** Adds one embeddable, captioned YouTube video to every built-in chapter that has none. */
export async function adminAutoAddChapterVideos(): Promise<Result> {
  await requireAdmin();
  if (!youtubeEnabled()) return { ok: false, error: "Add your free YOUTUBE_API_KEY first (see Admin guide → Real videos)." };
  const content = await dbGet("content");
  content.videos ??= [];
  let added = 0;
  for (const ch of builtInChapters) {
    if (content.videos.some((v) => v.chapterId === ch.id)) continue;
    try {
      const [best] = await searchYouTube(ch.watch, { captionsOnly: true, max: 1 });
      if (!best) continue;
      content.videos.push({
        id: slug(best.title),
        title: best.title,
        youtubeId: best.id,
        fileUrl: "",
        category: ch.unit === "sports" ? "sports" : "travel",
        chapterId: ch.id,
        subtitles: [],
      });
      added++;
    } catch {
      break; // quota or network problem: stop and keep what we have
    }
  }
  await dbSet("content", content);
  return { ok: true, message: `Added ${added} videos. Please watch them and delete any you don't like.` };
}

/** Accepts youtu.be/ID, youtube.com/watch?v=ID, /shorts/ID, /embed/ID or a bare 11-char ID. */
function youtubeIdFrom(url: string) {
  const s = url.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? "";
}

export async function saveVideo(input: Omit<Video, "id" | "youtubeId" | "fileUrl"> & { id?: string; url: string }): Promise<Result> {
  await requireAdmin();
  if (!input.title.trim()) return { ok: false, error: "Please give the video a title." };
  const youtubeId = youtubeIdFrom(input.url);
  const fileUrl = !youtubeId && /^https:\/\/\S+\.(mp4|webm|m3u8)(\?\S*)?$/i.test(input.url.trim()) ? input.url.trim() : "";
  if (!youtubeId && !fileUrl) return { ok: false, error: "Paste a YouTube link, or an https link to an .mp4 video file." };
  const subtitles = [...input.subtitles].filter((s) => s.text.trim()).sort((a, b) => a.start - b.start).slice(0, 500);
  await updateContent((c) => {
    c.videos ??= [];
    const id = input.id || slug(input.title);
    const v: Video = { id, title: input.title.trim(), youtubeId, fileUrl, category: input.category, chapterId: input.chapterId, subtitles };
    const i = c.videos.findIndex((x) => x.id === id);
    if (i >= 0) c.videos[i] = v;
    else c.videos.push(v);
  });
  return { ok: true, message: `Video “${input.title}” saved.` };
}

export async function deleteVideo(id: string): Promise<Result> {
  await requireAdmin();
  await updateContent((c) => {
    c.videos = (c.videos ?? []).filter((v) => v.id !== id);
  });
  return { ok: true, message: "Video deleted." };
}

export async function addTwisters(text: string): Promise<Result> {
  await requireAdmin();
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3)
    .slice(0, 200);
  if (!lines.length) return { ok: false, error: "Type one tongue twister per line." };
  await updateContent((c) => {
    for (const l of lines) if (!c.twisters.some((t) => t.text === l)) c.twisters.push({ group: "New", text: l.slice(0, 300) });
  });
  return { ok: true, message: `${lines.length} tongue twister(s) added.` };
}

export async function deleteTwister(text: string): Promise<Result> {
  await requireAdmin();
  await updateContent((c) => {
    c.twisters = c.twisters.filter((t) => t.text !== text);
  });
  return { ok: true };
}
