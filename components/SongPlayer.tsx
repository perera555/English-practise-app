"use client";

import { useEffect, useRef, useState } from "react";
import type { Song } from "@/lib/types";
import { speak, splitWords, stopSpeaking } from "@/lib/speech";
import { Scene } from "./Scene";

const BEATS_PER_LINE = 8; // two bars of 4/4
const COUNT_IN = 4;

/** Schedules a simple pop backing track: kick, snare, hi-hat, chord pad and bass. */
function scheduleBackingTrack(ctx: AudioContext, song: Song, start: number, totalBeats: number, master: GainNode) {
  const beat = 60 / song.bpm;
  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const kick = (t: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.31);
  };
  const hiss = (t: number, dur: number, vol: number, freq: number) => {
    const s = ctx.createBufferSource();
    s.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(master);
    s.start(t);
    s.stop(t + dur + 0.01);
  };
  const tone = (t: number, freq: number, dur: number, vol: number, type: OscillatorType) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.05);
    g.gain.setValueAtTime(vol, t + dur - 0.1);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  };

  // Count-in clicks
  for (let b = 0; b < COUNT_IN; b++) tone(start + b * beat, b === 0 ? 1200 : 900, 0.08, 0.2, "square");

  const musicStart = start + COUNT_IN * beat;
  for (let b = 0; b < totalBeats; b++) {
    const t = musicStart + b * beat;
    if (b % 4 === 0 || b % 4 === 2) kick(t);
    if (b % 4 === 1 || b % 4 === 3) hiss(t, 0.18, 0.35, 1500);
    hiss(t, 0.05, 0.12, 7000);
    hiss(t + beat / 2, 0.04, 0.08, 7000);
    if (b % 4 === 0) {
      const chord = song.chords[Math.floor(b / 4) % song.chords.length];
      chord.forEach((f) => tone(t, f, beat * 4, 0.05, "triangle"));
      tone(t, chord[0] / 2, beat * 1.8, 0.12, "sine");
      tone(t + beat * 2, chord[0] / 2, beat * 1.8, 0.1, "sine");
    }
  }
  return musicStart;
}

export function SongPlayer({ song }: { song: Song }) {
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);
  const [word, setWord] = useState(-1);
  const [countIn, setCountIn] = useState(0);
  const [guide, setGuide] = useState(true);
  const [volume, setVolume] = useState(0.6);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const raf = useRef(0);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spokenLine = useRef(-1);

  const beat = 60 / song.bpm;
  const totalBeats = song.lines.length * BEATS_PER_LINE + 4;

  function stop() {
    cancelAnimationFrame(raf.current);
    stopSpeaking();
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setPlaying(false);
    setLine(-1);
    setWord(-1);
    setCountIn(0);
  }

  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = guide ? volume * 0.5 : volume;
  }, [volume, guide]);

  useEffect(() => {
    lineRefs.current[line]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [line]);

  function play() {
    stop();
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = guide ? volume * 0.5 : volume;
    master.connect(ctx.destination);
    masterRef.current = master;
    const startAt = ctx.currentTime + 0.15;
    const musicStart = scheduleBackingTrack(ctx, song, startAt, totalBeats, master);
    setPlaying(true);
    spokenLine.current = -1;

    // Weight each word by its length so long words get more time.
    const timings = song.lines.map((l) => {
      const ws = splitWords(l.text);
      const weights = ws.map((w) => w.length + 2);
      const sum = weights.reduce((a, b) => a + b, 0);
      const singBeats = BEATS_PER_LINE - 1.5;
      let acc = 0;
      return weights.map((w) => {
        const s = (acc / sum) * singBeats;
        acc += w;
        return s;
      });
    });

    const loop = () => {
      if (!ctxRef.current) return;
      const t = ctx.currentTime;
      if (t < musicStart) {
        setCountIn(Math.max(1, Math.ceil((musicStart - t) / beat)));
      } else {
        setCountIn(0);
        const b = (t - musicStart) / beat;
        const li = Math.floor(b / BEATS_PER_LINE);
        if (li >= song.lines.length + 0.5) {
          stop();
          return;
        }
        if (li < song.lines.length) {
          const inLine = b - li * BEATS_PER_LINE;
          const starts = timings[li];
          let wi = -1;
          for (let k = 0; k < starts.length; k++) if (inLine >= starts[k]) wi = k;
          if (inLine > BEATS_PER_LINE - 1.5) wi = starts.length;
          setLine(li);
          setWord(wi);
          if (guide && spokenLine.current !== li) {
            spokenLine.current = li;
            const secs = (BEATS_PER_LINE - 1.5) * beat;
            const natural = (song.lines[li].text.length * 0.07) + 0.3;
            speak(song.lines[li].text, { rate: Math.min(1.25, Math.max(0.75, natural / secs)) });
          }
        } else {
          setLine(-1);
        }
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Scene scene={song.scene} label={song.title} photoKey={`song:${song.id}`} />
          {countIn > 0 && (
            <div className="absolute inset-0 grid place-items-center">
              <span key={countIn} className="animate-flash text-7xl font-black text-white drop-shadow-lg">
                {countIn}
              </span>
            </div>
          )}
        </div>
        <div className="card flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {!playing ? (
              <button className="btn-primary text-lg" onClick={play}>
                ▶ Sing along
              </button>
            ) : (
              <button className="btn-danger text-lg" onClick={stop}>
                ■ Stop
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} disabled={playing} />
            🗣️ Voice guide (reads each line on the beat)
          </label>
          <label className="flex items-center gap-2 text-sm">
            🔊 Music volume
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(+e.target.value)} />
          </label>
          <p className="text-xs opacity-70">
            {song.mood} · {song.bpm} BPM · Original song written for this app.
          </p>
        </div>
        <div className="card">
          <h3 className="font-bold mb-2">Words in this song</h3>
          <ul className="grid grid-cols-2 gap-2">
            {song.vocab.map((v) => (
              <li key={v.word} className="flex items-center gap-2 cursor-pointer" onClick={() => speak(`${v.word}. ${v.meaning}`)}>
                <span className="text-2xl">{v.emoji}</span>
                <span>
                  <b>{v.word}</b>
                  <br />
                  <span className="text-xs opacity-70">{v.meaning}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-3xl bg-gradient-to-b from-indigo-950 to-purple-950 text-white p-5 max-h-[38rem] overflow-y-auto shadow-xl">
        <div className="flex flex-col gap-3">
          {song.lines.map((l, i) => {
            const ws = splitWords(l.text);
            const active = i === line;
            return (
              <div
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${active ? "scale-105 opacity-100" : i < line ? "opacity-40" : "opacity-60"}`}
              >
                {ws.map((w, wi) => (
                  <span
                    key={wi}
                    className={`transition-colors duration-150 ${active && wi <= word ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.7)]" : ""}`}
                  >
                    {w}{" "}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
