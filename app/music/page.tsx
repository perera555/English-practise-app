import Link from "next/link";
import { songs } from "@/lib/content";
import { Scene } from "@/components/Scene";
import { LockBadge } from "@/components/Premium";
import { NewSongs } from "@/components/Extra";
import { FamousSongs } from "@/components/Videos";
import { FREE } from "@/lib/sessions";

export const metadata = { title: "Music Karaoke · English Practice" };

const SEARCHES = [
  "English songs with lyrics for learners",
  "easy English songs karaoke lyrics",
  "Disney songs lyrics karaoke",
  "pop songs lyrics to learn English",
];

export default function MusicPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">🎵 Music Karaoke</h1>
        <p className="opacity-70">Sing along! The words light up in time with the music. All songs are original and made for learning.</p>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {songs.map((s, i) => (
          <Link key={s.id} href={`/music/${s.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 transition">
            <Scene scene={s.scene} label={s.title} photoKey={`song:${s.id}`} />
            <div className="flex items-center gap-2">
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <div className="font-bold">{s.title}</div>
                <div className="text-xs opacity-70">{s.mood}</div>
              </div>
              <span className="ml-auto">
                <LockBadge free={i < FREE.songs} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <NewSongs />
      <FamousSongs />
      <section className="card">
        <h2 className="font-bold text-lg mb-2">📺 Real English music with lyrics</h2>
        <p className="text-sm opacity-70 mb-3">Open YouTube lyric videos — turn on subtitles (CC) and sing along.</p>
        <div className="flex flex-wrap gap-2">
          {SEARCHES.map((q) => (
            <a key={q} className="btn-ghost" target="_blank" rel="noreferrer" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}>
              ▶ {q}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
