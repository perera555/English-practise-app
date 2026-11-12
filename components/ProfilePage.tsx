"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logOut, saveProfile, toAvatar, useProfile } from "@/lib/profile";
import { usePremium } from "@/lib/premium";
import { streak, useProgress } from "@/lib/settings";
import { Avatar } from "./Avatar";
import { CloudBackupCard } from "./CloudBackup";

export function ProfilePage() {
  const { profile, online } = useProfile();
  const { premium, userId } = usePremium();
  const progress = useProgress();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setPhoto(profile?.photo ?? "");
    setEditing(!profile);
  }, [profile]);

  useEffect(() => {
    if (!camera) return;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((s) => {
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {
        setMsg("Camera not available. Choose a picture from your gallery instead.");
        setCamera(false);
      });
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [camera]);

  async function snap() {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(-1, 0, 0, 1, c.width, 0); // mirror like a selfie
    ctx.drawImage(v, 0, 0);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.9));
    if (blob) setPhoto(await toAvatar(blob));
    setCamera(false);
  }

  async function save() {
    if (!name.trim()) return setMsg("Please type your name.");
    setBusy(true);
    const r = await saveProfile({ name, email, photo });
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    setMsg("");
    setEditing(false);
    if (!profile) router.push("/");
  }

  const input = "rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2.5 w-full";

  if (!editing && profile) {
    return (
      <div className="max-w-md mx-auto flex flex-col gap-4">
        <div className="card flex flex-col items-center text-center gap-3 py-8 bg-linear-to-b from-sky-500/10 to-fuchsia-500/10">
          <Avatar name={profile.name} photo={profile.photo} online={online} size={112} />
          <h1 className="text-2xl font-black">{profile.name}</h1>
          <p className={`text-sm font-semibold ${online ? "text-emerald-600" : "text-slate-500"}`}>{online ? "● Online" : "● Offline: practice still works"}</p>
          {profile.email && <p className="text-sm opacity-70">{profile.email}</p>}
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${premium ? "bg-amber-400 text-black" : "bg-black/5 dark:bg-white/10"}`}>
            {premium ? "⭐ Premium member" : "Free member"}
          </span>
          <div className="grid grid-cols-3 gap-2 w-full mt-2">
            <div className="rounded-2xl bg-black/5 dark:bg-white/10 p-2">
              <div className="text-xl font-black">{Object.keys(progress.done).length}</div>
              <div className="text-[11px] opacity-70">Lessons</div>
            </div>
            <div className="rounded-2xl bg-black/5 dark:bg-white/10 p-2">
              <div className="text-xl font-black">{streak(progress.days)}🔥</div>
              <div className="text-[11px] opacity-70">Day streak</div>
            </div>
            <div className="rounded-2xl bg-black/5 dark:bg-white/10 p-2">
              <div className="text-xl font-black">{progress.minutes}</div>
              <div className="text-[11px] opacity-70">Talk min</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="btn-primary" onClick={() => setEditing(true)}>
            ✏️ Edit profile
          </button>
          {!premium && (
            <Link href="/premium" className="btn-ghost">
              ⭐ Go Premium
            </Link>
          )}
          <button
            className="btn-ghost"
            onClick={async () => {
              if (confirm("Log out on this device? Your learning progress stays on this phone.")) await logOut();
            }}
          >
            🚪 Log out
          </button>
        </div>
        <CloudBackupCard userId={userId} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-4">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" width={64} height={64} className="mx-auto rounded-2xl shadow-lg" />
        <h1 className="text-3xl font-black mt-3">{profile ? "Edit your profile" : "Welcome! 👋"}</h1>
        <p className="opacity-70">{profile ? "Change your name or picture." : "Create your profile to start learning. It takes 10 seconds."}</p>
      </div>
      <div className="card flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          {camera ? (
            <div className="flex flex-col items-center gap-2">
              <video ref={videoRef} autoPlay playsInline muted className="h-48 w-48 rounded-full object-cover -scale-x-100 ring-4 ring-sky-400" />
              <div className="flex gap-2">
                <button className="btn-primary" onClick={snap}>
                  📸 Take photo
                </button>
                <button className="btn-ghost" onClick={() => setCamera(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <Avatar name={name} photo={photo} size={112} />
              <div className="flex flex-wrap gap-2 justify-center">
                <button className="btn-ghost" onClick={() => setCamera(true)}>
                  🤳 Take a selfie
                </button>
                <label className="btn-ghost cursor-pointer">
                  🖼️ Choose picture
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setPhoto(await toAvatar(f));
                    }}
                  />
                </label>
                {photo && (
                  <button className="text-xs text-rose-500" onClick={() => setPhoto("")}>
                    Remove
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <label className="text-sm font-semibold flex flex-col gap-1">
          Your name
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nimal" maxLength={40} />
        </label>
        <label className="text-sm font-semibold flex flex-col gap-1">
          Email (optional)
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={80} />
        </label>
        {msg && <p className="text-sm text-rose-500">{msg}</p>}
        <button className="btn-primary text-lg py-3" disabled={busy} onClick={save}>
          {busy ? "Saving…" : profile ? "💾 Save" : "🚀 Start learning"}
        </button>
        {profile && (
          <button className="btn-ghost" onClick={() => setEditing(false)}>
            Cancel
          </button>
        )}
        <p className="text-xs opacity-60 text-center">
          Your name and picture are shown in your profile and to our support team. See our{" "}
          <Link className="underline" href="/privacy">
            privacy policy
          </Link>
          .
        </p>
      </div>
      {!profile && <CloudBackupCard userId={userId} />}
    </div>
  );
}
