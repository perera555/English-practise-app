"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logOut, saveProfile, toAvatar, useProfile } from "@/lib/profile";
import { usePremium } from "@/lib/premium";
import { streak, useProgress } from "@/lib/settings";
import { Avatar } from "./Avatar";
import { CloudBackupCard } from "./CloudBackup";
import { OPEN_ADMIN_EVENT, adminSignIn, adminSignOut, openWebAdmin, resetAdminPassword, sendAdminCode, useAdmin } from "@/lib/adminClient";
import { isNativeApp } from "@/lib/native";

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
        <AdminAccess />
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
      <AdminAccess />
    </div>
  );
}

/* ---------------- Admin sign-in (same login page; only the admin password opens the admin panel) ---------------- */

function AdminAccess() {
  const { checked, enabled, admin } = useAdmin();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Opened from the "Admin login" button at the bottom of the page: show the password box straight away.
  useEffect(() => {
    const show = () => {
      setOpen(true);
      setTimeout(() => boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    };
    if (new URLSearchParams(window.location.search).has("admin")) show();
    window.addEventListener(OPEN_ADMIN_EVENT, show);
    return () => window.removeEventListener(OPEN_ADMIN_EVENT, show);
  }, []);

  if (checked && admin) {
    return (
      <div className="card flex flex-wrap items-center gap-2 bg-emerald-500/10">
        <p className="font-bold mr-auto">🛡️ You are signed in as admin</p>
        <Link href="/admin" className="btn-primary">
          Open admin panel
        </Link>
        <button className="btn-ghost" onClick={() => void adminSignOut()}>
          Admin log out
        </button>
      </div>
    );
  }

  if (isNativeApp()) {
    return (
      <button className="btn-ghost" onClick={openWebAdmin}>
        🔐 Admin sign in (opens the website)
      </button>
    );
  }

  if (!open) {
    return (
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        🔐 Admin sign in
      </button>
    );
  }

  if (forgot) {
    return (
      <div ref={boxRef}>
        <ForgotPassword onBack={() => setForgot(false)} onDone={() => router.push("/admin")} />
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await adminSignIn(pw);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setPw("");
    router.push("/admin");
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-3 ring-2 ring-indigo-400/60">
      <div ref={boxRef} />
      <h2 className="font-bold">🔐 Admin sign in</h2>
      <p className="text-xs opacity-70">Only for the app owner. Learners don&apos;t need this.</p>
      {checked && !enabled && (
        <p className="text-xs rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 px-2 py-1">
          Admin password is not set on this website yet. Add <code>ADMIN_PASSWORD</code> in Vercel → Settings → Environment Variables, then redeploy.
        </p>
      )}
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Admin password"
        autoComplete="current-password"
        className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2.5 w-full"
        autoFocus
        required
      />
      {err && <p className="text-sm text-rose-500">{err}</p>}
      <div className="flex gap-2">
        <button className="btn-primary flex-1" disabled={busy}>
          {busy ? "Checking…" : "Sign in as admin"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <button type="button" className="text-sm text-indigo-600 dark:text-indigo-300 underline self-center" onClick={() => setForgot(true)}>
        Forgot password? Create new password
      </button>
    </form>
  );
}

/* ---------------- Forgot password: security code by email / phone → new password ---------------- */

function ForgotPassword({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { checked, recovery, email } = useAdmin();
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const field = "rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2.5 w-full";

  async function send() {
    setBusy(true);
    setErr("");
    const r = await sendAdminCode();
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setSentTo(r.email || email || "your email");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) return setErr("The two passwords are not the same.");
    setBusy(true);
    setErr("");
    const r = await resetAdminPassword(code, pw);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    onDone();
  }

  return (
    <form onSubmit={save} className="card flex flex-col gap-3 ring-2 ring-indigo-400/60">
      <h2 className="font-bold">🔑 Create a new admin password</h2>
      {checked && !recovery ? (
        <p className="text-sm rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 px-2 py-1.5">
          Sending a security code is not set up on this website yet. See <b>Admin guide → Admin login &amp; password</b>, or ask your developer to add{" "}
          <code>RESEND_API_KEY</code> and <code>ADMIN_EMAIL</code> in Vercel.
        </p>
      ) : !sentTo ? (
        <>
          <p className="text-sm opacity-80">
            We will send a 6-digit security code to {email ? <b>{email}</b> : "the admin's email"}. Only the owner of that email (or phone) can make a new password.
          </p>
          {err && <p className="text-sm text-rose-500">{err}</p>}
          <button type="button" className="btn-primary" disabled={busy} onClick={send}>
            {busy ? "Sending…" : "📩 Send code"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100 px-2 py-1.5">
            ✅ Code sent to <b>{sentTo}</b>. It works for 10 minutes. Check your spam folder too.
          </p>
          <input className={field} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
          <input className={field} type="password" autoComplete="new-password" placeholder="New password (at least 8 characters)" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} required />
          <input className={field} type="password" autoComplete="new-password" placeholder="Type the new password again" minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          {err && <p className="text-sm text-rose-500">{err}</p>}
          <button className="btn-primary" disabled={busy || code.length !== 6}>
            {busy ? "Saving…" : "💾 Save new password"}
          </button>
          <button type="button" className="text-xs underline opacity-70 self-center" disabled={busy} onClick={send}>
            Didn&apos;t get it? Send a new code
          </button>
        </>
      )}
      <button type="button" className="btn-ghost" onClick={onBack}>
        ← Back to admin sign in
      </button>
    </form>
  );
}
