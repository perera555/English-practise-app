"use client";

import { useEffect, useState } from "react";
import type { Video } from "@/lib/types";
import { VideoPlayer } from "./VideoPlayer";

/** Parses .srt or .vtt subtitle files into timed lines. */
export function parseSubtitleFile(text: string) {
  const toSec = (t: string) => {
    const m = t.trim().match(/(?:(\d+):)?(\d+):(\d+)[,.](\d+)/);
    if (!m) return NaN;
    return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
  };
  const out: { start: number; text: string }[] = [];
  for (const block of text.replace(/\r/g, "").split(/\n\s*\n/)) {
    const lines = block.split("\n").filter(Boolean);
    const timeIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeIdx < 0) continue;
    const start = toSec(lines[timeIdx].split("-->")[0]);
    const words = lines
      .slice(timeIdx + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\{[^}]+\}/g, "")
      .trim();
    if (Number.isFinite(start) && words) out.push({ start, text: words });
  }
  return out;
}

/** A VLC-style player for the learner's own video files (works offline). */
export function LocalPlayer() {
  const [video, setVideo] = useState<Video | null>(null);
  const [subName, setSubName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (video?.fileUrl) URL.revokeObjectURL(video.fileUrl);
  }, [video?.fileUrl]);

  function pickVideo(f: File | undefined) {
    if (!f) return;
    setError("");
    const probe = document.createElement("video");
    if (f.type && !probe.canPlayType(f.type)) {
      setError(`This device may not play “${f.type}” files. MP4 (H.264) works on all phones.`);
    }
    setVideo((v) => ({
      id: "local",
      title: f.name.replace(/\.[^.]+$/, ""),
      youtubeId: "",
      fileUrl: URL.createObjectURL(f),
      category: "general",
      chapterId: "",
      subtitles: v?.subtitles ?? [],
    }));
  }

  async function pickSubs(f: File | undefined) {
    if (!f) return;
    const subs = parseSubtitleFile(await f.text());
    if (!subs.length) {
      setError("Could not read that subtitle file. Use an .srt or .vtt file.");
      return;
    }
    setSubName(`${f.name} · ${subs.length} lines`);
    setVideo((v) => (v ? { ...v, subtitles: subs } : v));
  }

  return (
    <section className="card flex flex-col gap-3">
      <h2 className="text-xl font-bold">📂 Play my own video</h2>
      <p className="text-sm opacity-70">
        Open a video from your phone or computer, like a movie, a lesson or a match you recorded. Add its subtitle file (.srt or .vtt) to get karaoke subtitles and
        speaking practice. Works offline.
      </p>
      <div className="flex flex-wrap gap-2">
        <label className="btn-primary cursor-pointer">
          🎞️ Choose video
          <input type="file" accept="video/*,.mkv,.mov,.mp4,.webm,.m4v" className="hidden" onChange={(e) => pickVideo(e.target.files?.[0])} />
        </label>
        <label className={`btn-ghost cursor-pointer ${video ? "" : "opacity-50 pointer-events-none"}`}>
          💬 Add subtitles (.srt / .vtt)
          <input type="file" accept=".srt,.vtt,text/vtt" className="hidden" onChange={(e) => pickSubs(e.target.files?.[0])} />
        </label>
      </div>
      {subName && <p className="text-xs opacity-70">Subtitles: {subName}</p>}
      {error && <p className="text-sm text-amber-600">{error}</p>}
      {video && (
        <div className="mt-2 flex flex-col gap-2">
          <h3 className="font-semibold">▶ {video.title}</h3>
          <VideoPlayer key={video.fileUrl + video.subtitles.length} video={video} local />
        </div>
      )}
    </section>
  );
}
