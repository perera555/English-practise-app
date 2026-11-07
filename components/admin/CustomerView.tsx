"use client";

import { useState } from "react";

const PAGES = [
  { path: "/", label: "🏠 Home" },
  { path: "/quiz", label: "🧠 Quiz" },
  { path: "/dictionary", label: "📖 Dictionary" },
  { path: "/native", label: "🎓 Native English" },
  { path: "/travel", label: "✈️ Travel" },
  { path: "/daily", label: "☕ Daily talk" },
  { path: "/stories", label: "📖 Stories" },
  { path: "/motivation", label: "💪 Motivation" },
  { path: "/videos", label: "🎬 Videos" },
  { path: "/chat", label: "🤖 Robot chat" },
  { path: "/listening", label: "🎧 Listening" },
  { path: "/speaking", label: "🎤 Speaking" },
  { path: "/twisters", label: "👅 Twisters" },
  { path: "/music", label: "🎵 Music" },
  { path: "/pte", label: "🎓 PTE" },
  { path: "/premium", label: "⭐ Premium page" },
  { path: "/login", label: "👤 Profile / login" },
  { path: "/help", label: "❓ User guide" },
];

/** The real customer app, shown inside the admin panel (everything unlocked for admins). */
export function CustomerView() {
  const [path, setPath] = useState("/");
  const [phone, setPhone] = useState(true);
  const [reload, setReload] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-3">
        <p className="text-sm opacity-70">
          This is the real app your customers use: every picture, video, lesson and page. As an admin, everything is unlocked here. You can tap around inside the
          screen just like a customer.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PAGES.map((p) => (
            <button
              key={p.path}
              onClick={() => setPath(p.path)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${path === p.path ? "bg-sky-500 text-white" : "bg-black/5 dark:bg-white/10"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={phone ? "btn-primary" : "btn-ghost"} onClick={() => setPhone(true)}>
            📱 Phone
          </button>
          <button className={!phone ? "btn-primary" : "btn-ghost"} onClick={() => setPhone(false)}>
            🖥️ Computer
          </button>
          <button className="btn-ghost" onClick={() => setReload((r) => r + 1)}>
            🔄 Reload
          </button>
          <a className="btn-ghost" href={path} target="_blank" rel="noreferrer">
            ↗️ Open in new tab
          </a>
        </div>
      </div>

      <div className="flex justify-center">
        {phone ? (
          <div className="rounded-[3rem] bg-slate-900 p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-4 ring-slate-700">
            <div className="mx-auto mb-2 h-1.5 w-24 rounded-full bg-slate-700" />
            <iframe
              key={`${path}-${reload}`}
              src={path}
              title="Customer app"
              className="rounded-[2.2rem] bg-white"
              style={{ width: 390, height: 780, maxWidth: "calc(100vw - 4rem)" }}
              allow="microphone; camera; autoplay; fullscreen"
            />
          </div>
        ) : (
          <iframe
            key={`${path}-${reload}-wide`}
            src={path}
            title="Customer app"
            className="w-full rounded-3xl shadow-xl ring-1 ring-black/10 bg-white"
            style={{ height: "80vh" }}
            allow="microphone; camera; autoplay; fullscreen"
          />
        )}
      </div>
    </div>
  );
}
