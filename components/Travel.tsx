"use client";

import Link from "next/link";
import { useState } from "react";
import { getChapter } from "@/lib/content";
import { isHidden, useCustomContent } from "@/lib/customContent";
import { usePhoto } from "@/lib/photos";
import { useProgress, PARTS } from "@/lib/settings";
import { FREE } from "@/lib/sessions";
import { speak } from "@/lib/speech";
import { Scene, photoCredit } from "./Scene";
import { RepeatLine } from "./Practice";
import { LockBadge } from "./Premium";

/** The journey, in order: each stop is a chapter. */
const JOURNEY: { stage: string; ids: string[] }[] = [
  { stage: "✈️ Before you fly", ids: ["booking-a-flight"] },
  { stage: "🛫 At the airport", ids: ["airport-check-in", "security-check", "at-the-gate"] },
  { stage: "☁️ In the air", ids: ["on-the-plane"] },
  { stage: "🛬 Arriving", ids: ["immigration-customs", "lost-luggage", "taking-a-taxi"] },
  { stage: "🏨 At the hotel", ids: ["hotel-check-in", "room-problem", "room-service", "concierge"] },
  { stage: "🏙️ Exploring the city", ids: ["asking-directions", "train-station", "restaurant", "cafe", "shopping"] },
  { stage: "🩺 If something goes wrong", ids: ["pharmacy", "emergency"] },
  { stage: "🏠 Going home", ids: ["hotel-check-out"] },
];

const PHRASES: { group: string; items: string[] }[] = [
  {
    group: "🛫 Airport",
    items: ["Where is the check-in desk for Sky Air?", "Can I have a window seat, please?", "Which gate does my flight leave from?", "Is the flight on time?"],
  },
  {
    group: "🏨 Hotel",
    items: ["I have a reservation under the name Silva.", "What time is breakfast?", "Could I have a late check-out, please?", "The air conditioning is not working."],
  },
  {
    group: "🏙️ City",
    items: ["Excuse me, how do I get to the train station?", "How much is a ticket to the city centre?", "Could you take a photo of us, please?", "Is it far from here?"],
  },
  {
    group: "🍽️ Food",
    items: ["A table for two, please.", "What do you recommend?", "I'm allergic to nuts.", "Could we have the bill, please?"],
  },
  {
    group: "🆘 Help",
    items: ["Please call an ambulance.", "I've lost my passport.", "Where is the nearest pharmacy?", "Can you speak more slowly, please?"],
  },
];

function TravelHero() {
  const photo = usePhoto("ch:at-the-gate");
  return (
    <section className="relative overflow-hidden rounded-[2rem] text-white min-h-[18rem] flex shadow-[0_24px_50px_-18px_rgba(14,165,233,0.7)]">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-indigo-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-950/90 via-sky-900/60 to-transparent" />
      <div className="relative p-6 sm:p-10 flex flex-col justify-center gap-3 max-w-xl">
        <span className="self-start rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold ring-1 ring-white/30">✈️ Travel English</span>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight drop-shadow-lg">Your trip, step by step</h1>
        <p className="text-white/90">From booking your ticket to flying home. Practise every real situation before you travel.</p>
        <Link href="/chapter/booking-a-flight" className="btn-primary self-start text-lg px-6 py-3">
          ▶ Start the journey
        </Link>
      </div>
      {photo && (
        <a href={photo.pageUrl} target="_blank" rel="noreferrer" className="absolute bottom-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
          📷 {photoCredit(photo)}
        </a>
      )}
    </section>
  );
}

export function TravelHub() {
  const progress = useProgress();
  const custom = useCustomContent();
  const { videos } = custom;
  const travelVideos = videos.filter((v) => v.category === "travel");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <TravelHero />

      {/* Journey timeline */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-extrabold">🗺️ The journey</h2>
        <ol className="relative flex flex-col gap-6 border-l-4 border-dashed border-sky-300 dark:border-sky-700 pl-5 ml-3">
          {JOURNEY.map((s) => (
            <li key={s.stage} className="relative">
              <span className="absolute -left-[2.15rem] top-0 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-[0_3px_0_rgba(0,0,0,0.25)]">
                ●
              </span>
              <h3 className="font-bold text-lg mb-2">{s.stage}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {s.ids.map((id) => {
                  const c = custom.overrides?.[id] ?? getChapter(id);
                  if (!c || isHidden(custom, `ch:${id}`)) return null;
                  const done = (progress.done[c.id]?.length ?? 0) >= PARTS.length;
                  return (
                    <Link key={id} href={`/chapter/${id}`} className="group relative overflow-hidden rounded-3xl shadow-lg hover:-translate-y-1 transition">
                      <Scene scene={c.scene} label={c.title} photoKey={`ch:${c.id}`} className="rounded-3xl shadow-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white flex items-end gap-2">
                        <div className="flex-1">
                          <div className="text-[11px] font-semibold opacity-80">Chapter {c.chapter}</div>
                          <div className="font-black text-lg leading-tight drop-shadow">
                            {c.emoji} {c.title}
                          </div>
                        </div>
                        {done && <span title="Completed">🏆</span>}
                        <LockBadge free={c.chapter <= FREE.chapters} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Travel videos */}
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">🎬 Real travel videos</h2>
        {travelVideos.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {travelVideos.map((v) => (
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
        ) : (
          <p className="card opacity-70">Real airport and hotel conversation videos are coming soon. Each chapter also has a link to watch real videos.</p>
        )}
      </section>

      {/* Survival phrases */}
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">🆘 Travel survival phrases</h2>
        <p className="opacity-70">Tap a phrase to hear it. Tap 🎤 to practise saying it.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {PHRASES.map((g) => (
            <div key={g.group} className="card flex flex-col gap-2">
              <h3 className="font-bold">{g.group}</h3>
              {g.items.map((p) => (
                <div key={p} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button className="flex-1 text-left rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2 hover:bg-sky-100 dark:hover:bg-sky-500/20" onClick={() => speak(p)}>
                      🔊 {p}
                    </button>
                    <button className="btn-ghost !min-h-0 !py-2" onClick={() => setOpen(open === p ? null : p)} aria-label="Practise">
                      🎤
                    </button>
                  </div>
                  {open === p && <RepeatLine text={p} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
