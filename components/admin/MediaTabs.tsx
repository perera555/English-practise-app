"use client";

import { useState, useTransition } from "react";
import { PHOTO_QUERIES } from "@/lib/photoQueries";
import { BUNDLED_PHOTOS } from "@/lib/bundledPhotos";
import { chapters, songs } from "@/lib/content";
import { dailyTalks } from "@/lib/daily";
import type { PhotoInfo } from "@/lib/db";
import type { YouTubeResult } from "@/lib/mediaServer";
import { adminAutoAddChapterVideos, adminAutoFillPhotos, adminSearchPhotos, adminSearchYouTube, adminSetPhoto } from "@/lib/adminActions";

type Run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) => void;

const input = "rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2 w-full";

function labelFor(key: string) {
  const [kind, id] = key.split(":");
  if (kind === "ch") {
    const c = chapters.find((x) => x.id === id);
    return c ? `📚 Ch ${c.chapter}: ${c.title}` : key;
  }
  if (kind === "daily") {
    const d = dailyTalks.find((x) => x.id === id);
    return d ? `☕ Daily ${d.n}: ${d.title}` : key;
  }
  if (kind === "song") {
    const s = songs.find((x) => x.id === id);
    return s ? `🎵 ${s.title}` : key;
  }
  if (kind === "story") return `📖 Story: ${id.replace(/-/g, " ")}`;
  if (kind === "speech") return `💪 Speech: ${id.replace(/-/g, " ")}`;
  if (kind === "home") return `🏠 Front page: ${id}`;
  return `🎓 PTE image ${id}`;
}

/** Admin-chosen photo, or the real photo bundled in the app. */
function currentPhoto(photos: Record<string, PhotoInfo>, k: string): (PhotoInfo & { bundled?: boolean }) | undefined {
  if (photos[k]) return photos[k];
  const b = BUNDLED_PHOTOS[k];
  return b && { url: b.src, photographer: b.author, photographerUrl: b.sourceUrl, pageUrl: b.sourceUrl, alt: "", bundled: true };
}

/* ---------------- Pictures ---------------- */

export function PicturesTab({ photos, pexels, run }: { photos: Record<string, PhotoInfo>; pexels: boolean; run: Run }) {
  const keys = Object.keys(PHOTO_QUERIES);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PhotoInfo[]>([]);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const filled = keys.filter((k) => currentPhoto(photos, k)).length;

  function search(query: string) {
    setErr("");
    start(async () => {
      const r = await adminSearchPhotos(query);
      if (r.ok) setResults(r.photos);
      else setErr(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-60">
          <h2 className="font-bold text-lg">🖼️ Real pictures</h2>
          <p className="text-sm opacity-70">
            {filled} of {keys.length} pictures are real photos. Built-in photos come from Wikimedia Commons and work offline. With a Pexels key you can swap any of them for a
            different photo.
          </p>
          {!pexels && <p className="text-sm text-amber-600 mt-1">⚠️ Add PEXELS_API_KEY to turn this on (Admin guide → Real pictures).</p>}
        </div>
        <button className="btn-primary" disabled={!pexels} onClick={() => run(adminAutoFillPhotos)}>
          ✨ Fill all missing pictures automatically
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {keys.map((k) => {
          const p = currentPhoto(photos, k);
          return (
            <div key={k} className="card p-2 flex flex-col gap-2">
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 grid place-items-center">
                {p ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={p.alt} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-sm opacity-60">Drawn picture</span>
                )}
              </div>
              <div className="text-sm font-semibold px-1">{labelFor(k)}</div>
              <div className="flex gap-2 px-1 pb-1">
                <button
                  className="btn-ghost text-xs"
                  disabled={!pexels}
                  onClick={() => {
                    setOpen(k);
                    setQ(PHOTO_QUERIES[k]);
                    setResults([]);
                    search(PHOTO_QUERIES[k]);
                  }}
                >
                  🔎 Change
                </button>
                {p && !p.bundled && (
                  <button className="text-xs text-rose-500" onClick={() => run(() => adminSetPhoto(k, null))}>
                    Reset
                  </button>
                )}
                {p?.bundled && <span className="text-[11px] opacity-50 self-center">built-in photo</span>}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setOpen(null)}>
          <div className="card w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col gap-3 bg-[var(--background)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <h3 className="font-bold flex-1">Choose a photo: {labelFor(open)}</h3>
              <button className="btn-ghost" onClick={() => setOpen(null)}>
                ✕
              </button>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                search(q);
              }}
            >
              <input className={input} value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn-primary">Search</button>
            </form>
            {pending && <p className="text-sm opacity-60">Searching…</p>}
            {err && <p className="text-sm text-rose-500">{err}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {results.map((p) => (
                <button
                  key={p.url}
                  className="rounded-xl overflow-hidden aspect-video ring-sky-400 hover:ring-4"
                  onClick={() => {
                    run(() => adminSetPhoto(open, p));
                    setOpen(null);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- YouTube search (inside the Videos tab) ---------------- */

export function YouTubeFinder({ youtube, onPick, run }: { youtube: boolean; onPick: (r: YouTubeResult) => void; run: Run }) {
  const [q, setQ] = useState("hotel check in English conversation");
  const [captions, setCaptions] = useState(true);
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="card flex flex-col gap-3">
      <h2 className="font-bold text-lg">🔎 Find real videos on YouTube</h2>
      {!youtube && <p className="text-sm text-amber-600">⚠️ Add YOUTUBE_API_KEY to turn this on (Admin guide → Real videos).</p>}
      <p className="text-sm opacity-70">
        Only videos that allow embedding are shown. Ideas: “cricket commentary highlights”, “airport English conversation”, “official music video”.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {[
          ["💪 Motivation", "motivational speech English subtitles"],
          ["🏏 Cricket", "cricket commentary highlights"],
          ["⚽ Football", "football commentary goals highlights"],
          ["🏉 Rugby", "rugby commentary best tries"],
          ["✈️ Travel", "airport English conversation"],
          ["🏨 Hotel", "hotel English conversation"],
          ["☕ Daily", "daily English conversation practice"],
          ["🎵 Music", "official music video lyrics"],
          ["🎓 PTE", "PTE speaking tips"],
        ].map(([label, query]) => (
          <button key={label} type="button" className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-semibold" onClick={() => setQ(query)}>
            {label}
          </button>
        ))}
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setErr("");
          start(async () => {
            const r = await adminSearchYouTube(q, captions);
            if (r.ok) setResults(r.results);
            else setErr(r.error);
          });
        }}
      >
        <input className={input + " flex-1 min-w-60 w-auto"} value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={captions} onChange={(e) => setCaptions(e.target.checked)} /> Only with subtitles
        </label>
        <button className="btn-primary" disabled={!youtube || pending}>
          {pending ? "Searching…" : "Search"}
        </button>
        <button type="button" className="btn-ghost" disabled={!youtube} onClick={() => confirm("Add one video to every chapter that has none?") && run(adminAutoAddChapterVideos)}>
          ✨ Auto-add a video to every chapter
        </button>
      </form>
      {err && <p className="text-sm text-rose-500">{err}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r) => (
          <div key={r.id} className="rounded-2xl bg-black/5 dark:bg-white/10 p-2 flex flex-col gap-1.5">
            <a href={`https://www.youtube.com/watch?v=${r.id}`} target="_blank" rel="noreferrer" className="relative aspect-video rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.thumb} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white rounded px-1">▶ preview</span>
            </a>
            <div className="text-sm font-semibold line-clamp-2">{r.title}</div>
            <div className="text-xs opacity-60">{r.channel}</div>
            <button className="btn-primary text-sm" onClick={() => onPick(r)}>
              ➕ Use this video
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
