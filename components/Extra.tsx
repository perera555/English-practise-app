"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCustomContent } from "@/lib/customContent";
import { ChapterView } from "./ChapterView";
import { SongPlayer } from "./SongPlayer";
import { Gate } from "./Premium";
import { Scene } from "./Scene";
import { VideoPlayer } from "./VideoPlayer";

/** Shows a chapter or song that the admin added (works offline once downloaded). */
export function ExtraView() {
  const params = useSearchParams();
  const c = useCustomContent();
  const chapterId = params.get("chapter");
  const songId = params.get("song");
  const videoId = params.get("video");

  if (videoId) {
    const video = c.videos.find((v) => v.id === videoId);
    if (!video) return <NotFound />;
    return (
      <div className="flex flex-col gap-4">
        <Link href="/videos" className="text-sm opacity-60 hover:opacity-100">
          ← All videos
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold">🎬 {video.title}</h1>
        <VideoPlayer video={video} />
      </div>
    );
  }

  if (chapterId) {
    const i = c.chapters.findIndex((x) => x.id === chapterId);
    const lesson = c.chapters[i];
    if (!lesson) return <NotFound />;
    return (
      <Gate free={false} what={`Chapter ${lesson.chapter}: ${lesson.title}`}>
        <ChapterView lesson={lesson} prev={c.chapters[i - 1]} next={c.chapters[i + 1]} hrefFor={(l) => `/extra?chapter=${l.id}`} />
      </Gate>
    );
  }
  if (songId) {
    const song = c.songs.find((s) => s.id === songId);
    if (!song) return <NotFound />;
    return (
      <div className="flex flex-col gap-4">
        <Link href="/music" className="text-sm opacity-60 hover:opacity-100">
          ← All songs
        </Link>
        <h1 className="text-3xl font-extrabold">
          {song.emoji} {song.title}
        </h1>
        <Gate free={false} what={`The song “${song.title}”`}>
          <SongPlayer song={song} />
        </Gate>
      </div>
    );
  }
  return <NotFound />;
}

function NotFound() {
  return (
    <div className="card text-center py-10">
      <p className="text-4xl">🔎</p>
      <p className="mt-2">This content could not be found. Connect to the internet once to download new content.</p>
      <Link href="/" className="btn-primary mt-4">
        Home
      </Link>
    </div>
  );
}

/** "New chapters" list for the home page. */
export function NewChapters() {
  const c = useCustomContent();
  if (!c.chapters.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-rose-500 text-white px-5 py-3 flex items-center gap-3">
        <span className="text-3xl">✨</span>
        <div>
          <h3 className="font-extrabold text-xl">New Chapters</h3>
          <p className="text-sm opacity-90">Fresh lessons added by our team · Premium</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {c.chapters.map((ch) => (
          <Link key={ch.id} href={`/extra?chapter=${ch.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 transition">
            <Scene scene={ch.scene} label={ch.title} className="rounded-2xl shadow-none" />
            <div className="flex items-start gap-2">
              <span className="text-2xl">{ch.emoji}</span>
              <div>
                <div className="text-xs font-semibold opacity-60">
                  Chapter {ch.chapter} · {ch.level}
                </div>
                <div className="font-bold">{ch.title}</div>
                <div className="text-sm opacity-70">{ch.subtitle}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function NewSongs() {
  const c = useCustomContent();
  if (!c.songs.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">✨ New songs</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {c.songs.map((s) => (
          <Link key={s.id} href={`/extra?song=${s.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 transition">
            <Scene scene={s.scene} label={s.title} />
            <div className="font-bold">
              {s.emoji} {s.title}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
