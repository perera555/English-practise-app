"use client";

import { useState } from "react";
import type { CustomContent, Customer, GiftCode, Grant, PhotoInfo } from "@/lib/db";
import { PHOTO_QUERIES } from "@/lib/photoQueries";
import { BUNDLED_PHOTOS } from "@/lib/bundledPhotos";
import { Avatar } from "../Avatar";
import { adminDeleteCustomer, adminUpdateCustomer } from "@/lib/adminActions";

export const ONLINE_MS = 3 * 60 * 1000;

function ago(t?: number) {
  if (!t) return "never";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 180) return "now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} days ago`;
}

const activeGrant = (g?: Grant) => !!g && (g.until === null || new Date(g.until) > new Date());

function StatCard({ emoji, value, label, color, onClick }: { emoji: string; value: string | number; label: string; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl p-4 text-left text-white bg-linear-to-br ${color} shadow-[0_6px_0_rgba(0,0,0,0.18),0_14px_24px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition`}
    >
      <span className="absolute -right-3 -top-3 text-6xl opacity-25">{emoji}</span>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </button>
  );
}

type GoFn = (t: "customers" | "premium" | "codes" | "pictures" | "videos" | "chapters" | "guide") => void;

export function Overview({
  customers,
  seen,
  grants,
  codes,
  content,
  photos,
  storage,
  pexels,
  youtube,
  setup,
  go,
}: {
  customers: Record<string, Customer>;
  seen: Record<string, number>;
  grants: Record<string, Grant>;
  codes: Record<string, GiftCode>;
  content: CustomContent;
  photos: Record<string, PhotoInfo>;
  storage: string;
  pexels: boolean;
  youtube: boolean;
  setup: { ai: boolean; payments: boolean };
  go: GoFn;
}) {
  const ids = Object.keys(customers);
  const online = Object.entries(seen).filter(([, t]) => Date.now() - t < ONLINE_MS);
  const today = Object.values(seen).filter((t) => Date.now() - t < 86400000).length;
  const premium = Object.values(grants).filter(activeGrant).length;
  const unused = Object.values(codes).filter((c) => !c.usedBy).length;
  const realPhotos = Object.keys(PHOTO_QUERIES).filter((k) => photos[k] || BUNDLED_PHOTOS[k]).length;
  const recent = ids.sort((a, b) => (seen[b] ?? 0) - (seen[a] ?? 0)).slice(0, 6);

  const checklist = [
    {
      ok: storage !== "local-file",
      label: storage === "postgres" ? "Online database (PostgreSQL)" : storage === "upstash" ? "Online database (Upstash)" : "Online database (PostgreSQL)",
      tip: "DATABASE_URL (Vercel → Storage → Neon Postgres)",
    },
    { ok: setup.ai, label: "AI robot (Anthropic key)", tip: "ANTHROPIC_API_KEY" },
    { ok: setup.payments, label: "Payments (RevenueCat)", tip: "REVENUECAT_SECRET_KEY" },
    { ok: youtube, label: "YouTube video search", tip: "YOUTUBE_API_KEY" },
    { ok: pexels, label: "Pexels photo search (optional)", tip: "PEXELS_API_KEY" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard emoji="👥" value={ids.length} label="Customers" color="from-sky-500 to-indigo-600" onClick={() => go("customers")} />
        <StatCard emoji="🟢" value={online.length} label="Online now" color="from-emerald-500 to-teal-600" onClick={() => go("customers")} />
        <StatCard emoji="📅" value={today} label="Active today" color="from-amber-500 to-orange-600" onClick={() => go("customers")} />
        <StatCard emoji="⭐" value={premium} label="Premium (admin-given)" color="from-fuchsia-500 to-purple-600" onClick={() => go("premium")} />
        <StatCard emoji="🎁" value={unused} label="Unused gift codes" color="from-rose-500 to-pink-600" onClick={() => go("codes")} />
        <StatCard emoji="🖼️" value={`${realPhotos}/${Object.keys(PHOTO_QUERIES).length}`} label="Real pictures" color="from-cyan-500 to-sky-600" onClick={() => go("pictures")} />
        <StatCard emoji="🎬" value={content.videos?.length ?? 0} label="Videos" color="from-red-500 to-rose-700" onClick={() => go("videos")} />
        <StatCard emoji="📚" value={30 + content.chapters.length} label="Chapters" color="from-lime-500 to-green-700" onClick={() => go("chapters")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card flex flex-col gap-2">
          <div className="flex items-center">
            <h2 className="font-bold text-lg flex-1">🕒 Recently active customers</h2>
            <button className="text-sm text-sky-600 font-semibold" onClick={() => go("customers")}>
              See all →
            </button>
          </div>
          {recent.map((id) => {
            const c = customers[id];
            const on = Date.now() - (seen[id] ?? 0) < ONLINE_MS;
            return (
              <div key={id} className="flex items-center gap-3 rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2">
                <Avatar name={c.name} photo={c.photo} online={on} size={38} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.name}</div>
                  <div className={`text-xs ${on ? "text-emerald-600 font-semibold" : "opacity-60"}`}>{on ? "● Online now" : `Last seen ${ago(seen[id])}`}</div>
                </div>
                {activeGrant(grants[id]) && <span className="text-xs rounded-full bg-amber-400 text-black font-bold px-2 py-0.5">⭐</span>}
              </div>
            );
          })}
          {!recent.length && <p className="text-sm opacity-60">No customers yet. They appear here after they create a profile in the app.</p>}
        </div>

        <div className="card flex flex-col gap-2">
          <h2 className="font-bold text-lg">✅ Setup checklist</h2>
          {checklist.map((c) => (
            <div key={c.label} className="flex items-center gap-3 rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2">
              <span className="text-xl">{c.ok ? "✅" : "⚠️"}</span>
              <div className="flex-1">
                <div className="font-semibold">{c.label}</div>
                {!c.ok && <div className="text-xs opacity-60">Add {c.tip}</div>}
              </div>
            </div>
          ))}
          <button className="btn-ghost self-start mt-1" onClick={() => go("guide")}>
            📖 How to set these up
          </button>
        </div>
      </div>
    </div>
  );
}

type Run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>, after?: () => void) => void;

/** View / edit / delete one customer. */
function CustomerModal({
  id,
  c,
  seenAt,
  grant,
  onClose,
  onPremium,
  run,
}: {
  id: string;
  c: Customer;
  seenAt?: number;
  grant?: Grant;
  onClose: () => void;
  onPremium: (id: string) => void;
  run: Run;
}) {
  const [name, setName] = useState(c.name);
  const [email, setEmail] = useState(c.email);
  const [removePhoto, setRemovePhoto] = useState(false);
  const on = Date.now() - (seenAt ?? 0) < ONLINE_MS;
  const input = "rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2 w-full";
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-3 bg-background" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <Avatar name={c.name} photo={removePhoto ? "" : c.photo} online={on} size={88} />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black truncate">{c.name}</h3>
            <p className={`text-sm font-semibold ${on ? "text-emerald-600" : "opacity-60"}`}>{on ? "● Online now" : `● Offline · last seen ${ago(seenAt)}`}</p>
            <p className="text-xs opacity-60 mt-1">
              📱 {c.platform} · Joined {new Date(c.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs mt-1">
              {activeGrant(grant) ? (
                <span className="rounded-full bg-amber-400 text-black font-bold px-2 py-0.5">
                  ⭐ Premium {grant?.until ? `until ${new Date(grant.until).toLocaleDateString()}` : "lifetime"}
                </span>
              ) : (
                <span className="opacity-60">No admin-given Premium (store subscriptions: see RevenueCat)</span>
              )}
            </p>
          </div>
          <button className="btn-ghost min-h-0! py-1!" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <code className="text-[11px] opacity-60 select-all break-all">{id}</code>
        <label className="text-sm font-semibold flex flex-col gap-1">
          Name
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="text-sm font-semibold flex flex-col gap-1">
          Email
          <input className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {c.photo && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} /> Remove profile picture (if it is not suitable)
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => run(() => adminUpdateCustomer(id, { name, email, removePhoto }), onClose)}>
            💾 Save changes
          </button>
          <button className="btn-ghost" onClick={() => onPremium(id)}>
            ⭐ Give Premium
          </button>
          {c.email && (
            <a className="btn-ghost" href={`mailto:${c.email}`}>
              ✉️ Email
            </a>
          )}
          <button
            className="btn-danger"
            onClick={() => confirm(`Delete ${c.name}? This removes their profile and any Premium you gave them.`) && run(() => adminDeleteCustomer(id), onClose)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomersTab({
  customers,
  seen,
  grants,
  onPremium,
  run,
}: {
  customers: Record<string, Customer>;
  seen: Record<string, number>;
  grants: Record<string, Grant>;
  onPremium: (id: string) => void;
  run: Run;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "premium">("all");
  const rows = Object.entries(customers)
    .filter(([id, c]) => {
      const text = `${c.name} ${c.email} ${id}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (filter === "online") return Date.now() - (seen[id] ?? 0) < ONLINE_MS;
      if (filter === "premium") return activeGrant(grants[id]);
      return true;
    })
    .sort(([a], [b]) => (seen[b] ?? 0) - (seen[a] ?? 0));

  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Search name, email or ID"
          className="flex-1 min-w-48 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2"
        />
        {(["all", "online", "premium"] as const).map((f) => (
          <button key={f} className={filter === f ? "btn-primary" : "btn-ghost"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "online" ? "🟢 Online" : "⭐ Premium"}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {rows.map(([id, c]) => {
          const on = Date.now() - (seen[id] ?? 0) < ONLINE_MS;
          const prem = activeGrant(grants[id]);
          return (
            <div key={id} className="card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} photo={c.photo} online={on} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-lg truncate">{c.name}</div>
                  <div className={`text-xs ${on ? "text-emerald-600 font-semibold" : "opacity-60"}`}>{on ? "● Online now" : `● Offline · last seen ${ago(seen[id])}`}</div>
                  {c.email && (
                    <a className="text-xs text-sky-600 truncate block" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5">📱 {c.platform}</span>
                <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5">Joined {new Date(c.createdAt).toLocaleDateString()}</span>
                {prem && <span className="rounded-full bg-amber-400 text-black font-bold px-2 py-0.5">⭐ Premium</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn-primary text-xs min-h-0! py-1.5!" onClick={() => setSel(id)}>
                  👁️ View / ✏️ Edit
                </button>
                <button className="btn-ghost text-xs min-h-0! py-1.5!" onClick={() => onPremium(id)}>
                  ⭐ Premium
                </button>
                <button
                  className="text-xs text-rose-500 ml-auto"
                  onClick={() => confirm(`Delete ${c.name}?`) && run(() => adminDeleteCustomer(id))}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!rows.length && <p className="card text-center opacity-60 py-8">No customers found.</p>}
      {sel && customers[sel] && (
        <CustomerModal id={sel} c={customers[sel]} seenAt={seen[sel]} grant={grants[sel]} onClose={() => setSel(null)} onPremium={onPremium} run={run} />
      )}
      <p className="text-xs opacity-60">
        Customers who pay in the stores are managed automatically. See them in RevenueCat. “Online” means the app was open in the last 3 minutes.
      </p>
    </div>
  );
}
