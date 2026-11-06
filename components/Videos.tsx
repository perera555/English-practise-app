"use client";

import Link from "next/link";
import type { VideoCategory } from "@/lib/types";
import { useCustomContent } from "@/lib/customContent";
import { VideoPlayer } from "./VideoPlayer";
import { LocalPlayer } from "./LocalPlayer";

export const VIDEO_CATEGORIES: { id: VideoCategory; label: string }[] = [
  { id: "travel", label: "✈️ Travel & hotel" },
  { id: "sports", label: "🏏 Sports commentary" },
  { id: "daily", label: "☕ Daily conversation" },
  { id: "music", label: "🎵 Music" },
  { id: "pte", label: "🎓 PTE tips" },
  { id: "general", label: "📺 General English" },
];

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export function VideosHub() {
  const { videos } = useCustomContent();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">🎬 Real English Videos</h1>
        <p className="opacity-70">Watch real English with karaoke subtitles. Tap any subtitle line to replay it, or practise saying it. Needs internet.</p>
      </header>
      <LocalPlayer />
      {!videos.length && (
        <div className="card text-center py-10">
          <p className="text-5xl">🎬</p>
          <p className="mt-2 opacity-70">Videos are coming soon. Our team adds new videos regularly.</p>
        </div>
      )}
      {VIDEO_CATEGORIES.map((cat) => {
        const list = videos.filter((v) => v.category === cat.id);
        if (!list.length) return null;
        return (
          <section key={cat.id} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">{cat.label}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((v) => (
                <Link key={v.id} href={`/extra?video=${v.id}`} className="card p-2 flex flex-col gap-2 hover:-translate-y-1 transition">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 grid place-items-center">
                    {v.youtubeId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb(v.youtubeId)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-5xl">🎬</span>
                    )}
                    <span className="absolute grid place-items-center h-12 w-12 rounded-full bg-red-600 text-white text-xl shadow-lg">▶</span>
                  </div>
                  <div className="px-1 pb-1">
                    <div className="font-bold">{v.title}</div>
                    <div className="text-xs opacity-60">{v.subtitles.length ? `${v.subtitles.length} subtitle lines` : "No subtitles"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Famous songs: official music / lyric videos the admin adds with category "music". */
export function FamousSongs() {
  const { videos } = useCustomContent();
  const list = videos.filter((v) => v.category === "music");
  if (!list.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">🌟 Famous English songs (official videos)</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map((v) => (
          <Link key={v.id} href={`/extra?video=${v.id}`} className="card p-2 flex flex-col gap-2 hover:-translate-y-1 transition">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 grid place-items-center">
              {v.youtubeId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb(v.youtubeId)} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-5xl">🎵</span>
              )}
              <span className="absolute grid place-items-center h-10 w-10 rounded-full bg-red-600 text-white shadow-lg">▶</span>
            </div>
            <div className="font-bold px-1 pb-1">{v.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Videos linked to one chapter (shown in the chapter's Watch tab). */
export function ChapterVideos({ chapterId }: { chapterId: string }) {
  const { videos } = useCustomContent();
  const list = videos.filter((v) => v.chapterId === chapterId);
  if (!list.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">🎬 Real video for this chapter</h2>
      {list.map((v) => (
        <div key={v.id} className="flex flex-col gap-2">
          <h3 className="font-semibold">{v.title}</h3>
          <VideoPlayer video={v} />
        </div>
      ))}
    </section>
  );
}
