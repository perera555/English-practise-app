"use client";

import Link from "next/link";
import { speeches, type Speech } from "@/lib/motivation";
import { isHidden, useCustomContent } from "@/lib/customContent";
import { Karaoke } from "./Karaoke";
import { Scene } from "./Scene";
import { MicWarning, RepeatLine } from "./Practice";
import { CameraButton } from "./SelfCam";
import { VideoPlayer } from "./VideoPlayer";

const sceneFor = (s: Speech) => ({
  sky: ["#f472b6", "#fdf2f8"] as [string, string],
  ground: "#9d174d",
  items: [
    { e: "🎤", x: 50, y: 40, s: 6 },
    { e: s.emoji, x: 22, y: 25, s: 4 },
    { e: "👏", x: 78, y: 60, s: 4 },
  ],
});

export function MotivationHub() {
  const custom = useCustomContent();
  const { videos } = custom;
  const vids = videos.filter((v) => v.category === "motivation");
  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl bg-linear-to-br from-orange-500 via-rose-500 to-fuchsia-600 text-white p-6 shadow-xl">
        <p className="text-5xl">💪</p>
        <h1 className="text-3xl font-black">Motivation</h1>
        <p className="opacity-90">
          Get inspired and practise speaking like a confident speaker. Watch real motivational speeches, then deliver our speeches yourself, on camera if you like.
        </p>
      </header>

      {vids.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">🎬 Real motivational speeches</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vids.map((v) => (
              <Link key={v.id} href={`/extra?video=${v.id}`} className="card p-2 flex flex-col gap-2 hover:-translate-y-1 transition">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 grid place-items-center">
                  {v.youtubeId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-5xl">🎬</span>
                  )}
                  <span className="absolute grid place-items-center h-12 w-12 rounded-full bg-red-600 text-white text-xl shadow-lg">▶</span>
                </div>
                <div className="font-bold px-1 pb-1">{v.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">🎤 Speeches to practise ({speeches.length})</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {speeches.filter((s) => !isHidden(custom, `speech:${s.id}`)).map((s) => (
            <Link key={s.id} href={`/motivation/${s.id}`} className="card p-3 flex flex-col gap-2 hover:-translate-y-1 transition">
              <Scene scene={sceneFor(s)} label={s.title} photoKey={`speech:${s.id}`} className="rounded-2xl shadow-none" />
              <div className="flex items-start gap-2">
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <div className="text-xs font-semibold opacity-60">
                    Speech {s.n} · {s.speaker}
                  </div>
                  <div className="font-bold">{s.title}</div>
                  <div className="text-sm opacity-70 italic line-clamp-2">“{s.keyLines[0]}”</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SpeechView({ speech }: { speech: Speech }) {
  const { videos } = useCustomContent();
  const i = speeches.findIndex((x) => x.id === speech.id);
  const next = speeches[i + 1];
  const lines = speech.sentences.map((text) => ({ speaker: speech.speaker, text }));
  const related = videos.filter((v) => v.category === "motivation").slice(0, 1);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/motivation" className="text-sm opacity-60 hover:opacity-100">
        ← All motivation
      </Link>
      <div className="relative">
        <Scene scene={sceneFor(speech)} label={speech.title} photoKey={`speech:${speech.id}`} className="aspect-21/9 max-h-88" />
        <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-linear-to-t from-black/80 to-transparent p-5 text-white pointer-events-none">
          <p className="text-sm font-semibold opacity-90">
            Speech {speech.n} · {speech.speaker}
          </p>
          <h1 className="text-2xl sm:text-4xl font-black drop-shadow">
            {speech.emoji} {speech.title}
          </h1>
        </div>
      </div>

      <section className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">1. Listen to the speech 🎧</h2>
        <Karaoke lines={lines} allowRolePlay={false} />
      </section>

      <section className="card flex flex-col gap-3">
        <MicWarning />
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-lg flex-1">2. Say the power lines with energy 🔥</h2>
          <CameraButton />
        </div>
        <p className="text-sm opacity-70">Stand up, smile, look at the camera and say each line like a real speaker.</p>
        {speech.keyLines.map((t) => (
          <RepeatLine key={t} text={t} />
        ))}
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">3. Deliver the whole speech 🎤</h2>
        <p className="text-sm opacity-70">
          Turn on 📹 See yourself, choose a background (a stadium is great!), press ⏺️ to record, and read the whole speech. Then watch yourself back.
        </p>
        <ol className="list-decimal pl-6 text-lg leading-relaxed">
          {speech.sentences.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </section>

      {related.map((v) => (
        <section key={v.id} className="flex flex-col gap-2">
          <h2 className="font-bold text-lg">🎬 Watch a real speech: {v.title}</h2>
          <VideoPlayer video={v} />
        </section>
      ))}

      {next && (
        <Link href={`/motivation/${next.id}`} className="btn-primary self-end">
          Next speech: {next.title} →
        </Link>
      )}
    </div>
  );
}
