"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/types";
import { splitWords } from "@/lib/speech";
import { RepeatLine } from "./Practice";

type YTPlayer = {
  getCurrentTime(): number;
  seekTo(s: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
};
type YTNamespace = { Player: new (el: HTMLElement, opts: object) => YTPlayer };

let ytLoading: Promise<YTNamespace> | null = null;
function loadYouTube(): Promise<YTNamespace> {
  const w = window as unknown as { YT?: YTNamespace & { loaded?: number }; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve(w.YT);
  ytLoading ??= new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(w.YT!);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return ytLoading;
}

function fmt(t: number) {
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
}

/** Plays a YouTube or .mp4 video with karaoke subtitles synced to the video time. */
export function VideoPlayer({ video, compact = false, local = false }: { video: Video; compact?: boolean; local?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLVideoElement>(null);
  const yt = useRef<YTPlayer | null>(null);
  const [time, setTime] = useState(0);
  const [online, setOnline] = useState(true);
  const [practise, setPractise] = useState<number | null>(null);
  const subs = video.subtitles;

  useEffect(() => {
    setOnline(navigator.onLine); // eslint-disable-line react-hooks/set-state-in-effect
    if (!video.youtubeId || !host.current) return;
    let cancelled = false;
    const el = document.createElement("div");
    host.current.appendChild(el);
    loadYouTube().then((YT) => {
      if (cancelled) return;
      yt.current = new YT.Player(el, {
        videoId: video.youtubeId,
        width: "100%",
        height: "100%",
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, cc_load_policy: 0 },
      });
    });
    const t = setInterval(() => {
      try {
        if (yt.current?.getCurrentTime) setTime(yt.current.getCurrentTime());
      } catch {
        /* not ready */
      }
    }, 100);
    return () => {
      cancelled = true;
      clearInterval(t);
      try {
        yt.current?.destroy();
      } catch {
        /* ignore */
      }
      yt.current = null;
      el.remove();
    };
  }, [video.youtubeId]);

  const seek = (s: number) => {
    if (yt.current) {
      yt.current.seekTo(s, true);
      yt.current.playVideo();
    } else if (fileRef.current) {
      fileRef.current.currentTime = s;
      void fileRef.current.play();
    }
  };

  let idx = -1;
  for (let i = 0; i < subs.length; i++) if (subs[i].start <= time) idx = i;
  const cur = subs[idx];
  const end = subs[idx + 1]?.start ?? (cur ? cur.start + 4 : 0);
  const words = cur ? splitWords(cur.text) : [];
  const frac = cur ? Math.min(1, (time - cur.start) / Math.max(0.5, (end - cur.start) * 0.85)) : 0;
  const lit = Math.floor(frac * words.length);

  return (
    <div className={`grid ${compact ? "" : "lg:grid-cols-[1.4fr_1fr]"} gap-4`}>
      <div className="flex flex-col gap-2">
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-xl">
          {video.youtubeId ? (
            <div ref={host} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" />
          ) : (
            <video ref={fileRef} src={video.fileUrl} controls playsInline className="w-full h-full" onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} />
          )}
          {!online && !local && (
            <div className="absolute inset-0 grid place-items-center text-white text-center p-4 bg-black/80">
              📶 Videos need an internet connection. Everything else in the app works offline.
            </div>
          )}
        </div>
        {subs.length > 0 && (
          <div className="rounded-2xl bg-black/85 text-white px-4 py-3 min-h-16 text-center text-xl font-semibold">
            {cur
              ? words.map((w, i) => (
                  <span key={i} className={i < lit ? "text-yellow-300" : ""}>
                    {w}{" "}
                  </span>
                ))
              : "▶ Press play — subtitles appear here"}
          </div>
        )}
      </div>
      {subs.length > 0 && (
        <div className="card flex flex-col gap-2 max-h-[30rem] overflow-y-auto">
          <h3 className="font-bold">📜 Subtitles: tap a line to jump there</h3>
          {subs.map((s, i) => (
            <div key={i} className={`rounded-xl px-3 py-2 ${i === idx ? "bg-sky-100 dark:bg-sky-500/20" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>
              <button className="text-left w-full" onClick={() => seek(s.start)}>
                <span className="text-xs opacity-50 mr-2 font-mono">{fmt(s.start)}</span>
                {s.text}
              </button>
              <button className="text-xs opacity-60 hover:opacity-100 mt-1" onClick={() => setPractise(practise === i ? null : i)}>
                🎤 Practise this line
              </button>
              {practise === i && (
                <div className="mt-2">
                  <RepeatLine text={s.text} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
