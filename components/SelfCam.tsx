"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePhoto } from "@/lib/photos";

/* ---------------- Global on/off switch ---------------- */

let camOn = false;
const listeners = new Set<() => void>();
function setCam(v: boolean) {
  camOn = v;
  listeners.forEach((l) => l());
}
function useCam() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => camOn,
    () => false,
  );
}

/** Button that opens / closes the "See yourself" camera. */
export function CameraButton({ className = "btn-ghost" }: { className?: string }) {
  const on = useCam();
  return (
    <button className={`${className} ${on ? "ring-2 ring-emerald-400" : ""}`} onClick={() => setCam(!on)} title="See yourself while you speak">
      📹 {on ? "Hide camera" : "See yourself"}
    </button>
  );
}

/* ---------------- Background segmentation (MediaPipe, runs on the device) ---------------- */

const MP_VERSION = "1.2.2";
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

type Segmenter = {
  segmentForVideo(v: HTMLVideoElement, ts: number): { confidenceMasks?: { getAsFloat32Array(): Float32Array; width: number; height: number }[]; close?: () => void };
  close(): void;
};

let segmenterPromise: Promise<Segmenter> | null = null;
function getSegmenter(): Promise<Segmenter> {
  segmenterPromise ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM);
    const make = (delegate: "GPU" | "CPU") =>
      ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL, delegate },
        runningMode: "VIDEO",
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    try {
      return (await make("GPU")) as unknown as Segmenter;
    } catch {
      return (await make("CPU")) as unknown as Segmenter;
    }
  })();
  segmenterPromise.catch(() => (segmenterPromise = null));
  return segmenterPromise;
}

type Bg = { kind: "none" } | { kind: "blur" } | { kind: "studio"; colors: [string, string] } | { kind: "photo"; key: string; label: string; emoji: string };

/** Real-world places (photos come from the app's real photo library). */
const PLACES: Extract<Bg, { kind: "photo" }>[] = [
  { kind: "photo", key: "ch:airport-check-in", label: "Airport", emoji: "✈️" },
  { kind: "photo", key: "ch:hotel-check-in", label: "Hotel", emoji: "🏨" },
  { kind: "photo", key: "ch:cricket-first-over", label: "Stadium", emoji: "🏟️" },
  { kind: "photo", key: "ch:cafe", label: "Café", emoji: "☕" },
  { kind: "photo", key: "ch:restaurant", label: "Restaurant", emoji: "🍽️" },
  { kind: "photo", key: "daily:holidays", label: "Beach", emoji: "🏖️" },
  { kind: "photo", key: "song:city-lights", label: "City", emoji: "🌃" },
  { kind: "photo", key: "daily:talking-work", label: "Office", emoji: "🏢" },
  { kind: "photo", key: "ch:train-station", label: "Station", emoji: "🚆" },
];

const STUDIOS: Extract<Bg, { kind: "studio" }>[] = [
  { kind: "studio", colors: ["#0ea5e9", "#c026d3"] },
  { kind: "studio", colors: ["#f59e0b", "#ef4444"] },
  { kind: "studio", colors: ["#10b981", "#1e3a8a"] },
];

function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, w: number, h: number) {
  const r = Math.max(w / img.width, h / img.height);
  const dw = img.width * r;
  const dh = img.height * r;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function drawStudio(ctx: CanvasRenderingContext2D, w: number, h: number, [a, b]: [string, string]) {
  // 3D studio: gradient wall, glowing light and a floor
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.35, w * 0.7);
  glow.addColorStop(0, "rgba(255,255,255,0.55)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  const floor = ctx.createLinearGradient(0, h * 0.72, 0, h);
  floor.addColorStop(0, "rgba(0,0,0,0)");
  floor.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
}

/* ---------------- The floating camera window ---------------- */

export function CameraBubble() {
  const on = useCam();
  return on ? <CameraWindow /> : null;
}

function CameraWindow() {
  const on = true;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const bgImg = useRef<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const [big, setBig] = useState(false);
  const [picker, setPicker] = useState(false);
  const [bg, setBg] = useState<Bg>({ kind: "none" });
  const [loadingAi, setLoadingAi] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [clip, setClip] = useState<{ url: string; ext: string } | null>(null);

  // Photos for the place backgrounds (hooks must be called unconditionally).
  const photos = [
    usePhoto(PLACES[0].key),
    usePhoto(PLACES[1].key),
    usePhoto(PLACES[2].key),
    usePhoto(PLACES[3].key),
    usePhoto(PLACES[4].key),
    usePhoto(PLACES[5].key),
    usePhoto(PLACES[6].key),
    usePhoto(PLACES[7].key),
    usePhoto(PLACES[8].key),
  ];
  const photoFor = (key: string) => photos[PLACES.findIndex((p) => p.key === key)];

  // Camera preview
  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    setError(""); // eslint-disable-line react-hooks/set-state-in-effect
    if (!navigator.mediaDevices) {
      setError("This device does not support the camera here.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError("Camera not available. Please allow camera access in your settings."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [on]);

  // Load the chosen background photo (CORS-safe so the canvas can be recorded).
  const bgUrl = bg.kind === "photo" ? photoFor(bg.key)?.url : undefined;
  useEffect(() => {
    bgImg.current = null;
    if (!bgUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => (bgImg.current = img);
    img.src = bgUrl;
  }, [bgUrl]);

  // Background replacement loop
  useEffect(() => {
    if (!on || bg.kind === "none") return;
    let stop = false;
    let raf = 0;
    const person = document.createElement("canvas");
    const pctx = person.getContext("2d", { willReadFrequently: true })!;
    setLoadingAi(true); // eslint-disable-line react-hooks/set-state-in-effect

    getSegmenter()
      .then((seg) => {
        setLoadingAi(false);
        let last = -1;
        const loop = () => {
          if (stop) return;
          raf = requestAnimationFrame(loop);
          const v = videoRef.current;
          const c = canvasRef.current;
          if (!v || !c || v.readyState < 2 || v.currentTime === last) return;
          last = v.currentTime;
          const w = v.videoWidth;
          const h = v.videoHeight;
          if (!w || !h) return;
          if (c.width !== w) {
            c.width = w;
            c.height = h;
            person.width = w;
            person.height = h;
          }
          const ctx = c.getContext("2d")!;
          const res = seg.segmentForVideo(v, performance.now());
          const masks = res.confidenceMasks ?? [];
          const mask = masks[masks.length > 1 ? 1 : 0];
          if (!mask) return res.close?.();
          const conf = mask.getAsFloat32Array();

          // 1) cut the person out of the camera frame
          pctx.drawImage(v, 0, 0, w, h);
          const frame = pctx.getImageData(0, 0, w, h);
          const d = frame.data;
          const sx = mask.width / w;
          const sy = mask.height / h;
          for (let y = 0; y < h; y++) {
            const my = Math.floor(y * sy) * mask.width;
            for (let x = 0; x < w; x++) {
              const p = conf[my + Math.floor(x * sx)];
              d[(y * w + x) * 4 + 3] = p > 0.75 ? 255 : p < 0.35 ? 0 : ((p - 0.35) / 0.4) * 255;
            }
          }
          pctx.putImageData(frame, 0, 0);
          res.close?.();

          // 2) draw the background, then the person on top (mirrored like a selfie)
          ctx.save();
          ctx.setTransform(-1, 0, 0, 1, w, 0);
          if (bg.kind === "blur") {
            ctx.filter = "blur(14px)";
            ctx.drawImage(v, 0, 0, w, h);
            ctx.filter = "none";
          } else if (bg.kind === "photo" && bgImg.current) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); // don't mirror the photo
            drawCover(ctx, bgImg.current, w, h);
            ctx.setTransform(-1, 0, 0, 1, w, 0);
          } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            drawStudio(ctx, w, h, bg.kind === "studio" ? bg.colors : STUDIOS[0].colors);
            ctx.setTransform(-1, 0, 0, 1, w, 0);
          }
          ctx.drawImage(person, 0, 0);
          ctx.restore();
        };
        loop();
      })
      .catch(() => {
        setLoadingAi(false);
        setError("Backgrounds need internet the first time. Showing your normal camera.");
        setBg({ kind: "none" });
      });

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
    };
  }, [on, bg]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  async function startRec() {
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      const videoTracks =
        bg.kind !== "none" && canvasRef.current ? canvasRef.current.captureStream(30).getVideoTracks() : (streamRef.current?.getVideoTracks() ?? []);
      const mixed = new MediaStream([...videoTracks, ...mic.getAudioTracks()]);
      const type = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const rec = new MediaRecorder(mixed, type ? { mimeType: type } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        mic.getTracks().forEach((t) => t.stop());
        const mime = rec.mimeType || "video/webm";
        setClip((old) => {
          if (old) URL.revokeObjectURL(old.url);
          return { url: URL.createObjectURL(new Blob(chunks.current, { type: mime })), ext: mime.includes("mp4") ? "mp4" : "webm" };
        });
      };
      rec.start();
      recRef.current = rec;
      setSeconds(0);
      setRecording(true);
      setTimeout(() => recRef.current?.state === "recording" && stopRec(), 60000);
    } catch {
      setError("Could not start recording. Please allow microphone access.");
    }
  }

  function stopRec() {
    recRef.current?.stop();
    setRecording(false);
  }

  const replaced = bg.kind !== "none";

  return (
    <>
      <div
        className={`fixed z-60 right-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6 ${big ? "w-72 sm:w-96" : "w-36 sm:w-48"} transition-all`}
        style={{ perspective: "900px" }}
      >
        {/* 3D frame */}
        <div
          className="rounded-[1.75rem] p-1.5 bg-linear-to-br from-sky-400 via-indigo-500 to-fuchsia-500 shadow-[0_18px_40px_-10px_rgba(79,70,229,0.7)]"
          style={{ transform: "rotateY(-6deg) rotateX(3deg)" }}
        >
          <div className="rounded-3xl overflow-hidden bg-black">
            <div className="relative aspect-3/4">
              {error && <p className="absolute inset-x-0 top-8 z-10 mx-2 rounded-lg bg-black/70 p-2 text-center text-[11px] text-white">{error}</p>}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover -scale-x-100 ${replaced ? "opacity-0" : ""}`}
              />
              <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full object-cover ${replaced ? "" : "hidden"}`} />
              {loadingAi && (
                <div className="absolute inset-0 grid place-items-center bg-black/50 text-white text-xs text-center p-3">✨ Loading background magic…</div>
              )}
              <span className="absolute top-2 left-2 rounded-full bg-black/50 text-white text-[10px] px-2 py-0.5">You</span>
              {recording && (
                <span className="absolute top-2 right-2 rounded-full bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 animate-pulse">● {seconds}s</span>
              )}
            </div>
            <div className="flex justify-around bg-linear-to-b from-slate-800 to-black text-white text-lg py-1.5">
              {!recording ? (
                <button onClick={startRec} title="Record yourself" aria-label="Record">
                  ⏺️
                </button>
              ) : (
                <button onClick={stopRec} title="Stop recording" aria-label="Stop">
                  ⏹️
                </button>
              )}
              <button onClick={() => setPicker((p) => !p)} title="Change background" aria-label="Background">
                🖼️
              </button>
              <button onClick={() => setBig((b) => !b)} title="Bigger / smaller" aria-label="Resize">
                {big ? "🔽" : "🔼"}
              </button>
              <button onClick={() => setCam(false)} title="Close camera" aria-label="Close">
                ✖️
              </button>
            </div>
          </div>
        </div>

        {picker && (
          <div className="absolute bottom-full right-0 mb-3 w-72 card bg-background flex flex-col gap-2">
            <p className="text-sm font-bold">🖼️ Put yourself in a real place</p>
            <div className="grid grid-cols-3 gap-2">
              <BgTile active={bg.kind === "none"} label="Real" onClick={() => setBg({ kind: "none" })}>
                🙂
              </BgTile>
              <BgTile active={bg.kind === "blur"} label="Blur" onClick={() => setBg({ kind: "blur" })}>
                🌫️
              </BgTile>
              {PLACES.map((p, i) => {
                const ph = photos[i];
                return (
                  <BgTile key={p.key} active={bg.kind === "photo" && bg.key === p.key} label={p.label} onClick={() => setBg(p)} image={ph?.url}>
                    {p.emoji}
                  </BgTile>
                );
              })}
              {STUDIOS.map((s, i) => (
                <BgTile
                  key={i}
                  active={bg.kind === "studio" && bg.colors[0] === s.colors[0]}
                  label={`3D studio ${i + 1}`}
                  onClick={() => setBg(s)}
                  gradient={`linear-gradient(135deg, ${s.colors[0]}, ${s.colors[1]})`}
                >
                  ✨
                </BgTile>
              ))}
            </div>
            <p className="text-[11px] opacity-60">Runs on your device. Nothing is uploaded. Real photos appear once the admin turns them on.</p>
          </div>
        )}
      </div>

      {clip && (
        <div className="fixed inset-0 z-70 bg-black/70 grid place-items-center p-4" onClick={() => setClip(null)}>
          <div className="card w-full max-w-md flex flex-col gap-3 bg-background" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">🎬 Watch yourself</h3>
            <p className="text-sm opacity-70">Look at your mouth, your face and your confidence. Try again and compare!</p>
            <video src={clip.url} controls playsInline className="w-full rounded-2xl bg-black" />
            <div className="flex flex-wrap gap-2">
              <a className="btn-ghost" href={clip.url} download={`speakup-practice.${clip.ext}`}>
                💾 Save
              </a>
              <button className="btn-primary" onClick={() => setClip(null)}>
                🔁 Practise again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BgTile({
  active,
  label,
  onClick,
  image,
  gradient,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  image?: string;
  gradient?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative aspect-4/3 rounded-xl overflow-hidden grid place-items-center text-xl bg-slate-200 dark:bg-slate-700 shadow-[0_4px_0_rgba(0,0,0,0.25)] active:translate-y-0.5 ${active ? "ring-4 ring-sky-400" : ""}`}
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" } : gradient ? { background: gradient } : undefined}
    >
      {!image && <span>{children}</span>}
      <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-0.5">{label}</span>
    </button>
  );
}
