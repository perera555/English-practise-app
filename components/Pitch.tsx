"use client";

import type { Sport, SportAction } from "@/lib/types";

type Pos = { x: number; y: number; flash?: string };

const BALL: Record<Sport, Partial<Record<SportAction, Pos>>> = {
  cricket: {
    start: { x: 200, y: 112 },
    bowl: { x: 200, y: 92 },
    hit: { x: 255, y: 60 },
    run: { x: 200, y: 130 },
    four: { x: 372, y: 112, flash: "FOUR!" },
    six: { x: 330, y: 18, flash: "SIX!" },
    wicket: { x: 200, y: 140, flash: "OUT!" },
    cheer: { x: 200, y: 112 },
  },
  football: {
    start: { x: 200, y: 112 },
    pass: { x: 270, y: 70 },
    run: { x: 320, y: 120 },
    shot: { x: 380, y: 80 },
    tackle: { x: 210, y: 140, flash: "TACKLE!" },
    kick: { x: 380, y: 20 },
    goal: { x: 392, y: 112, flash: "GOAL!" },
    save: { x: 375, y: 100, flash: "SAVED!" },
    cheer: { x: 200, y: 112 },
  },
  rugby: {
    start: { x: 150, y: 112 },
    pass: { x: 230, y: 70 },
    tackle: { x: 260, y: 130, flash: "SMASH!" },
    run: { x: 330, y: 30 },
    try: { x: 380, y: 60, flash: "TRY!" },
    kick: { x: 385, y: 112 },
    cheer: { x: 200, y: 112 },
  },
  tennis: {
    start: { x: 60, y: 112 },
    serve: { x: 280, y: 80, flash: "SERVE" },
    rally: { x: 120, y: 150 },
    point: { x: 330, y: 160, flash: "WINNER!" },
    ace: { x: 330, y: 60, flash: "ACE!" },
    cheer: { x: 200, y: 112 },
  },
};

const BALL_EMOJI: Record<Sport, string> = { cricket: "🔴", football: "⚽", rugby: "🏉", tennis: "🎾" };

function Field({ sport }: { sport: Sport }) {
  const line = "rgba(255,255,255,0.75)";
  if (sport === "cricket")
    return (
      <>
        <ellipse cx="200" cy="112" rx="195" ry="108" fill="#15803d" />
        <ellipse cx="200" cy="112" rx="120" ry="66" fill="none" stroke={line} strokeDasharray="4 4" />
        <rect x="190" y="72" width="20" height="80" fill="#d9c58f" />
        <line x1="192" y1="78" x2="208" y2="78" stroke="#fff" strokeWidth="2" />
        <line x1="192" y1="146" x2="208" y2="146" stroke="#fff" strokeWidth="2" />
      </>
    );
  if (sport === "tennis")
    return (
      <>
        <rect x="10" y="10" width="380" height="205" fill="#1d4ed8" rx="6" />
        <rect x="40" y="30" width="320" height="165" fill="none" stroke={line} strokeWidth="2" />
        <line x1="200" y1="22" x2="200" y2="203" stroke="#fff" strokeWidth="3" />
        <line x1="100" y1="112" x2="300" y2="112" stroke={line} />
        <line x1="100" y1="30" x2="100" y2="195" stroke={line} />
        <line x1="300" y1="30" x2="300" y2="195" stroke={line} />
      </>
    );
  return (
    <>
      <rect x="5" y="5" width="390" height="215" fill="#16a34a" rx="6" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={5 + i * 65} y="5" width="32" height="215" fill="#15803d" />
      ))}
      <rect x="10" y="10" width="380" height="205" fill="none" stroke={line} strokeWidth="2" />
      <line x1="200" y1="10" x2="200" y2="215" stroke={line} strokeWidth="2" />
      {sport === "football" ? (
        <>
          <circle cx="200" cy="112" r="28" fill="none" stroke={line} strokeWidth="2" />
          <rect x="10" y="62" width="45" height="100" fill="none" stroke={line} strokeWidth="2" />
          <rect x="345" y="62" width="45" height="100" fill="none" stroke={line} strokeWidth="2" />
          <rect x="390" y="92" width="6" height="40" fill="#fff" />
          <rect x="4" y="92" width="6" height="40" fill="#fff" />
        </>
      ) : (
        <>
          <line x1="360" y1="10" x2="360" y2="215" stroke={line} strokeWidth="2" />
          <line x1="40" y1="10" x2="40" y2="215" stroke={line} strokeWidth="2" />
          <line x1="372" y1="95" x2="372" y2="130" stroke="#fff" strokeWidth="3" />
          <line x1="372" y1="105" x2="390" y2="105" stroke="#fff" strokeWidth="2" />
        </>
      )}
    </>
  );
}

const PLAYERS: Record<Sport, { e: string; x: number; y: number }[]> = {
  cricket: [
    { e: "🏏", x: 200, y: 150 },
    { e: "🧍", x: 200, y: 70 },
    { e: "🧤", x: 200, y: 168 },
    { e: "🧍‍♂️", x: 90, y: 60 },
    { e: "🧍‍♂️", x: 310, y: 160 },
    { e: "🧍‍♂️", x: 300, y: 50 },
  ],
  football: [
    { e: "🏃", x: 160, y: 90 },
    { e: "🏃‍♀️", x: 260, y: 140 },
    { e: "🏃", x: 300, y: 80 },
    { e: "🧤", x: 380, y: 112 },
    { e: "🏃‍♂️", x: 110, y: 150 },
  ],
  rugby: [
    { e: "🏃‍♂️", x: 150, y: 100 },
    { e: "🏃", x: 220, y: 80 },
    { e: "🏃‍♂️", x: 270, y: 140 },
    { e: "🏃", x: 320, y: 50 },
    { e: "🧍‍♂️", x: 100, y: 160 },
  ],
  tennis: [
    { e: "🧍‍♀️", x: 60, y: 120 },
    { e: "🧍", x: 340, y: 110 },
  ],
};

export function Pitch({ sport, action, tick }: { sport: Sport; action?: SportAction; tick: number }) {
  const map = BALL[sport];
  const pos = (action && map[action]) || map.start || { x: 200, y: 112 };
  const cheering = action === "cheer" || !!pos.flash;
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg bg-slate-900 aspect-video">
      <svg viewBox="0 0 400 225" className="w-full h-full" aria-label={`${sport} field animation`}>
        <Field sport={sport} />
        {PLAYERS[sport].map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y}
            fontSize="18"
            textAnchor="middle"
            dominantBaseline="middle"
            className={cheering ? "animate-bounce-small" : ""}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {p.e}
          </text>
        ))}
        <g style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 1.1s cubic-bezier(.2,.8,.2,1)" }}>
          <text fontSize="14" textAnchor="middle" dominantBaseline="middle">
            {BALL_EMOJI[sport]}
          </text>
        </g>
      </svg>
      <div className="absolute top-2 left-3 flex items-center gap-2 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
        <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> LIVE
      </div>
      {pos.flash && (
        <div key={tick} className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="animate-flash text-4xl sm:text-6xl font-black text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]">
            {pos.flash}
          </span>
        </div>
      )}
    </div>
  );
}
