import Link from "next/link";
import { notFound } from "next/navigation";
import { getSong, songs } from "@/lib/content";
import { SongPlayer } from "@/components/SongPlayer";
import { Gate } from "@/components/Premium";
import { FREE } from "@/lib/sessions";

export function generateStaticParams() {
  return songs.map((s) => ({ id: s.id }));
}

export default async function SongPage(props: PageProps<"/music/[id]">) {
  const { id } = await props.params;
  const song = getSong(id);
  if (!song) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/music" className="text-sm opacity-60 hover:opacity-100">
        ← All songs
      </Link>
      <h1 className="text-3xl font-extrabold">
        {song.emoji} {song.title}
      </h1>
      <Gate free={songs.indexOf(song) < FREE.songs} what={`The song “${song.title}”`}>
        <SongPlayer song={song} />
      </Gate>
    </div>
  );
}
