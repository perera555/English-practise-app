"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CustomContent, GiftCode, Grant } from "@/lib/db";
import type { Lesson, Level, Song, UnitId, VideoCategory } from "@/lib/types";
import { chapters, songs as builtInSongs } from "@/lib/content";
import { getUserId } from "@/lib/premium";
import {
  addTwisters,
  adminLogin,
  adminLogout,
  createCodes,
  deleteChapter,
  deleteCode,
  deleteSong,
  deleteTwister,
  deleteVideo,
  grantPremium,
  hideItem,
  restoreItem,
  revokePremium,
  saveChapter,
  saveSong,
  saveVideo,
} from "@/lib/adminActions";
import { VIDEO_CATEGORIES } from "@/components/Videos";
import { VideoPlayer } from "@/components/VideoPlayer";
import { dailyTalks } from "@/lib/daily";
import { stories } from "@/lib/stories";
import { speeches } from "@/lib/motivation";
import { refreshPremium } from "@/lib/premium";
import { CustomerView } from "./CustomerView";
import { PicturesTab, YouTubeFinder } from "./MediaTabs";
import { AdminGuide } from "./AdminGuide";
import type { Customer, PhotoInfo } from "@/lib/db";
import { CustomersTab, ONLINE_MS, Overview } from "./PeopleTabs";

const input = "rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2 w-full";
const area = input + " font-mono text-sm";

export function AdminLogin() {
  const [state, action, pending] = useActionState(adminLogin, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);
  return (
    <form action={action} className="card max-w-sm mx-auto flex flex-col gap-3">
      <h1 className="text-2xl font-bold">🔐 Admin login</h1>
      <input name="password" type="password" placeholder="Admin password" className={input} autoFocus required />
      <button className="btn-primary" disabled={pending}>
        {pending ? "Checking…" : "Log in"}
      </button>
      {state && !state.ok && <p className="text-rose-500 text-sm">{state.error}</p>}
    </form>
  );
}

type Props = {
  grants: Record<string, Grant>;
  codes: Record<string, GiftCode>;
  content: CustomContent;
  storage: string;
  photos: Record<string, PhotoInfo>;
  pexels: boolean;
  youtube: boolean;
  customers: Record<string, Customer>;
  seen: Record<string, number>;
  setup: { ai: boolean; payments: boolean };
};

type TabId = "overview" | "view" | "customers" | "premium" | "codes" | "library" | "pictures" | "videos" | "chapters" | "songs" | "twisters" | "guide";

const NAV: { group: string; items: { id: TabId; label: string; emoji: string }[] }[] = [
  {
    group: "",
    items: [
      { id: "overview", label: "Overview", emoji: "🏠" },
      { id: "view", label: "Customer view", emoji: "📱" },
    ],
  },
  {
    group: "People",
    items: [
      { id: "customers", label: "Customers", emoji: "👥" },
      { id: "premium", label: "Give Premium", emoji: "⭐" },
      { id: "codes", label: "Gift codes", emoji: "🎁" },
    ],
  },
  {
    group: "Content",
    items: [
      { id: "library", label: "Library", emoji: "🗂️" },
      { id: "pictures", label: "Pictures", emoji: "🖼️" },
      { id: "videos", label: "Videos", emoji: "🎬" },
      { id: "chapters", label: "Chapters", emoji: "📚" },
      { id: "songs", label: "Songs", emoji: "🎵" },
      { id: "twisters", label: "Twisters", emoji: "👅" },
    ],
  },
  { group: "Help", items: [{ id: "guide", label: "Admin guide", emoji: "📖" }] },
];

export function AdminDashboard({ grants, codes, content, storage, photos, pexels, youtube, customers, seen, setup }: Props) {
  const [tab, setTab] = useState<TabId>("overview");
  const [prefill, setPrefill] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function run(fn: () => Promise<{ ok: boolean; message?: string; error?: string; codes?: string[] }>, after?: (r: { codes?: string[] }) => void) {
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? (r.message ?? "Done ✅") : `⚠️ ${r.error}`);
      if (r.ok) after?.(r);
      router.refresh();
    });
  }

  function go(t: TabId) {
    setTab(t);
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Logged-in admins get everything unlocked straight away (no subscription needed).
  useEffect(() => {
    void refreshPremium();
  }, []);

  const onlineCount = Object.values(seen).filter((t) => Date.now() - t < ONLINE_MS).length;
  const current = NAV.flatMap((g) => g.items).find((i) => i.id === tab)!;

  return (
    <div className="grid md:grid-cols-[15rem_1fr] gap-5 items-start">
      {/* Sidebar */}
      <aside className="md:sticky md:top-20 rounded-3xl bg-linear-to-b from-slate-900 to-indigo-950 text-white p-3 shadow-xl flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
        <div className="hidden md:flex items-center gap-2 px-2 py-2 mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={36} height={36} className="rounded-xl" />
          <div>
            <div className="font-black leading-tight">SpeakUp</div>
            <div className="text-[11px] opacity-60">Admin panel</div>
          </div>
        </div>
        {NAV.map((g) => (
          <div key={g.group || "top"} className="contents md:block">
            {g.group && <p className="hidden md:block px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest opacity-50">{g.group}</p>}
            {g.items.map((i) => (
              <button
                key={i.id}
                onClick={() => go(i.id)}
                className={`shrink-0 md:w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  tab === i.id ? "bg-white text-indigo-900 shadow-[0_3px_0_rgba(0,0,0,0.3)]" : "hover:bg-white/10"
                }`}
              >
                <span>{i.emoji}</span>
                {i.label}
                {i.id === "customers" && onlineCount > 0 && (
                  <span className="ml-auto rounded-full bg-emerald-500 text-white text-[10px] px-1.5">{onlineCount}</span>
                )}
              </button>
            ))}
          </div>
        ))}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 md:mt-4 md:w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/10"
        >
          👁️ View app (as admin: everything unlocked)
        </a>
        <button
          className="shrink-0 md:w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/10 opacity-80"
          onClick={() => start(async () => { await adminLogout(); router.refresh(); })}
        >
          🚪 Log out
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-col gap-4 min-w-0">
        <header className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold mr-auto">
            {current.emoji} {current.label}
          </h1>
          <span className="text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 px-3 py-1">
            ⭐ Admins get Premium free
          </span>
        </header>
        {storage === "local-file" && (
          <p className="rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 px-3 py-2 text-sm">
            Local test storage. When the site is online (Vercel), connect Upstash Redis so changes are saved. See the Admin guide.
          </p>
        )}
        {msg && <p className="rounded-xl bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100 px-3 py-2 font-semibold">{msg}</p>}
        {pending && <p className="text-sm opacity-60">Saving…</p>}

        {tab === "overview" && (
          <Overview customers={customers} seen={seen} grants={grants} codes={codes} content={content} photos={photos} storage={storage} pexels={pexels} youtube={youtube} setup={setup} go={go} />
        )}
        {tab === "customers" && (
          <CustomersTab
            customers={customers}
            seen={seen}
            grants={grants}
            onPremium={(id) => {
              setPrefill(id);
              go("premium");
            }}
            run={(fn, after) => run(fn, after ? () => after() : undefined)}
          />
        )}
        {tab === "premium" && <UsersTab key={prefill} initialId={prefill} grants={grants} run={run} />}
        {tab === "view" && <CustomerView />}
        {tab === "codes" && <CodesTab codes={codes} run={run} />}
        {tab === "library" && <LibraryTab content={content} run={run} />}
        {tab === "pictures" && <PicturesTab photos={photos} pexels={pexels} run={run} />}
        {tab === "videos" && <VideosTab content={content} run={run} youtube={youtube} />}
        {tab === "chapters" && <ChaptersTab content={content} run={run} />}
        {tab === "songs" && <SongsTab content={content} run={run} />}
        {tab === "twisters" && <TwistersTab content={content} run={run} />}
        {tab === "guide" && <AdminGuide pexels={pexels} youtube={youtube} storage={storage} />}
      </div>
    </div>
  );
}

type Run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string; codes?: string[] }>, after?: (r: { codes?: string[] }) => void) => void;

/* ---------------- Users ---------------- */

function UsersTab({ grants, run, initialId = "" }: { grants: Record<string, Grant>; run: Run; initialId?: string }) {
  const [userId, setUserId] = useState(initialId);
  const [days, setDays] = useState("30");
  const [note, setNote] = useState("");
  const list = Object.entries(grants).sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt));
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">⭐ Upgrade a user to Premium</h2>
        <p className="text-sm opacity-70">The user finds their ID at the bottom of the Premium page in the app.</p>
        <input className={input} placeholder="User ID, e.g. u_1a2b3c…" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <button className="btn-ghost self-start text-xs" onClick={() => setUserId(getUserId())}>
          Use this device&apos;s ID
        </button>
        <select className={input} value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="365">1 year</option>
          <option value="0">Lifetime (staff / admin / testers)</option>
        </select>
        <input className={input} placeholder="Note (optional), e.g. Teacher account" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn-primary" onClick={() => run(() => grantPremium(userId, Number(days) || null, note))}>
          Give Premium
        </button>
      </div>
      <div className="card flex flex-col gap-2">
        <h2 className="font-bold text-lg">👥 Users with Premium from admin ({list.length})</h2>
        <p className="text-xs opacity-60">Store subscribers are managed in RevenueCat, Google Play Console and App Store Connect.</p>
        <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
          {list.map(([id, g]) => {
            const active = g.until === null || new Date(g.until) > new Date();
            return (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2 text-sm">
                <span className={active ? "text-emerald-500" : "text-rose-500"}>●</span>
                <code className="flex-1 truncate">{id}</code>
                <span className="text-xs opacity-70">{g.until ? `until ${new Date(g.until).toLocaleDateString()}` : "lifetime"}</span>
                <span className="text-xs opacity-60 truncate max-w-24">{g.note}</span>
                <button className="text-xs text-rose-500" onClick={() => confirm("Remove Premium from this user?") && run(() => revokePremium(id))}>
                  Remove
                </button>
              </div>
            );
          })}
          {!list.length && <p className="text-sm opacity-60">No users yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Codes ---------------- */

function CodesTab({ codes, run }: { codes: Record<string, GiftCode>; run: Run }) {
  const [count, setCount] = useState("5");
  const [days, setDays] = useState("30");
  const [made, setMade] = useState<string[]>([]);
  const list = Object.entries(codes).sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt));
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">🎁 Create gift codes</h2>
        <p className="text-sm opacity-70">Give codes to students, schools or for promotions. Users type them on the Premium page.</p>
        <input className={input} type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} />
        <select className={input} value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">7 days Premium</option>
          <option value="30">30 days Premium</option>
          <option value="365">1 year Premium</option>
          <option value="0">Lifetime Premium</option>
        </select>
        <button className="btn-primary" onClick={() => run(() => createCodes(Number(count), Number(days) || null), (r) => setMade(r.codes ?? []))}>
          Create codes
        </button>
        {made.length > 0 && <textarea className={area} rows={Math.min(10, made.length)} readOnly value={made.join("\n")} />}
      </div>
      <div className="card flex flex-col gap-2">
        <h2 className="font-bold text-lg">All codes ({list.length})</h2>
        <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
          {list.map(([code, c]) => (
            <div key={code} className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-1.5 text-sm">
              <code className="font-bold">{code}</code>
              <span className="text-xs opacity-70">{c.days ? `${c.days}d` : "lifetime"}</span>
              <span className="flex-1 text-xs truncate">{c.usedBy ? `✅ used by ${c.usedBy}` : "unused"}</span>
              <button className="text-xs text-rose-500" onClick={() => run(() => deleteCode(code))}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Chapters ---------------- */

const SCENES = chapters.map((c) => ({ id: c.id, label: `${c.emoji} ${c.title}`, scene: c.scene, sport: c.sport }));

function parseLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { speaker: l.slice(0, i).trim(), text: l.slice(i + 1).trim() } : { speaker: "Speaker", text: l };
    });
}

function parseVocab(text: string) {
  return text
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p.length >= 3 && p[1])
    .map(([emoji, word, meaning]) => ({ emoji, word, meaning }));
}

function parseQuiz(text: string) {
  return text
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p.length >= 4)
    .map((p) => {
      const last = Number(p[p.length - 1]);
      const hasAnswer = Number.isInteger(last) && last >= 1;
      const options = p.slice(1, hasAnswer ? -1 : undefined);
      return { q: p[0], options, answer: hasAnswer ? Math.min(options.length, last) - 1 : 0 };
    });
}

function ChaptersTab({ content, run }: { content: CustomContent; run: Run }) {
  const empty = {
    id: "",
    title: "",
    subtitle: "",
    emoji: "📘",
    level: "Beginner" as Level,
    unit: "city" as UnitId,
    learnerRole: "Customer",
    robot: "",
    opener: "",
    scene: SCENES[0].id,
    lines: "Waiter: Good evening. Are you ready to order?\nCustomer: Yes, I would like the soup, please.",
    vocab: "🍲 | soup | a hot liquid food",
    quiz: "What does the customer order? | Soup | Pizza | Rice | 1",
  };
  const [f, setF] = useState(empty);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function toLesson(): Lesson {
    const preset = SCENES.find((s) => s.id === f.scene) ?? SCENES[0];
    const lines = parseLines(f.lines);
    return {
      id: f.id,
      chapter: 0,
      unit: f.unit,
      title: f.title.trim(),
      subtitle: f.subtitle.trim(),
      emoji: f.emoji.trim() || "📘",
      level: f.level,
      scene: preset.scene,
      sport: f.unit === "sports" ? preset.sport : undefined,
      learnerRole: f.learnerRole.trim() || lines[1]?.speaker || "You",
      lines,
      vocab: parseVocab(f.vocab),
      quiz: parseQuiz(f.quiz),
      watch: `${f.title} English conversation`,
      robot: f.robot.trim() || `a friendly person in the situation "${f.title}"`,
      opener: f.opener.trim() || `Hello! Let's practise: ${f.title}. Are you ready?`,
    };
  }

  function edit(l: Lesson) {
    setF({
      id: l.id,
      title: l.title,
      subtitle: l.subtitle,
      emoji: l.emoji,
      level: l.level,
      unit: l.unit,
      learnerRole: l.learnerRole,
      robot: l.robot,
      opener: l.opener,
      scene: SCENES.find((s) => JSON.stringify(s.scene) === JSON.stringify(l.scene))?.id ?? SCENES[0].id,
      lines: l.lines.map((x) => `${x.speaker}: ${x.text}`).join("\n"),
      vocab: l.vocab.map((v) => `${v.emoji} | ${v.word} | ${v.meaning}`).join("\n"),
      quiz: l.quiz.map((q) => [q.q, ...q.options, q.answer + 1].join(" | ")).join("\n"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
      <div className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">{f.id ? "✏️ Edit chapter" : "➕ Add a new chapter"}</h2>
        <div className="grid sm:grid-cols-[5rem_1fr] gap-2">
          <input className={input} value={f.emoji} onChange={set("emoji")} placeholder="📘" />
          <input className={input} value={f.title} onChange={set("title")} placeholder="Title, e.g. At the Bank" />
        </div>
        <input className={input} value={f.subtitle} onChange={set("subtitle")} placeholder="Subtitle, e.g. Open an account and change money" />
        <div className="grid sm:grid-cols-3 gap-2">
          <select className={input} value={f.level} onChange={set("level")}>
            <option>Beginner</option>
            <option>Intermediate</option>
          </select>
          <select className={input} value={f.unit} onChange={set("unit")}>
            <option value="airport">✈️ Airport</option>
            <option value="hotel">🏨 Hotel</option>
            <option value="city">🏙️ City</option>
            <option value="sports">🏏 Sports</option>
          </select>
          <input className={input} value={f.learnerRole} onChange={set("learnerRole")} placeholder="Learner's role" />
        </div>
        <label className="text-sm font-semibold">
          Picture
          <select className={input} value={f.scene} onChange={set("scene")}>
            {SCENES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Dialogue: one line each, as <code>Speaker: text</code>
          <textarea className={area} rows={8} value={f.lines} onChange={set("lines")} />
        </label>
        <label className="text-sm font-semibold">
          Vocabulary: <code>emoji | word | meaning</code>
          <textarea className={area} rows={4} value={f.vocab} onChange={set("vocab")} />
        </label>
        <label className="text-sm font-semibold">
          Quiz: <code>Question | option A | option B | option C | correct number</code>
          <textarea className={area} rows={3} value={f.quiz} onChange={set("quiz")} />
        </label>
        <input className={input} value={f.robot} onChange={set("robot")} placeholder="Robot plays… e.g. a bank teller" />
        <input className={input} value={f.opener} onChange={set("opener")} placeholder="Robot's first message" />
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => run(() => saveChapter(toLesson()), () => setF(empty))}>
            💾 Save chapter
          </button>
          {f.id && (
            <button className="btn-ghost" onClick={() => setF(empty)}>
              Cancel edit
            </button>
          )}
        </div>
      </div>
      <div className="card flex flex-col gap-2">
        <h2 className="font-bold text-lg">All chapters ({chapters.length + content.chapters.length})</h2>
        <p className="text-xs opacity-60">
          👁️ View opens it like a customer sees it · ✏️ Edit changes it for everyone · 🗑️ Remove hides it (built-in chapters can be restored).
        </p>
        <div className="flex flex-col gap-1 max-h-152 overflow-y-auto pr-1">
          {[...chapters, ...content.chapters].map((base) => {
            const builtIn = chapters.includes(base);
            const c = (builtIn && content.overrides?.[base.id]) || base;
            const hidden = (content.hidden ?? []).includes(`ch:${base.id}`);
            const edited = builtIn && !!content.overrides?.[base.id];
            return (
              <div
                key={base.id}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${hidden ? "bg-rose-500/10 opacity-70" : "bg-black/5 dark:bg-white/10"}`}
              >
                <span>{c.emoji}</span>
                <span className="flex-1 min-w-0 truncate">
                  <b>Ch {c.chapter}</b> {c.title}
                  {edited && <span className="ml-1 text-[10px] rounded bg-sky-500 text-white px-1">edited</span>}
                  {hidden && <span className="ml-1 text-[10px] rounded bg-rose-500 text-white px-1">removed</span>}
                </span>
                <a className="text-xs" href={builtIn ? `/chapter/${base.id}` : `/extra?chapter=${base.id}`} target="_blank" rel="noreferrer" title="View">
                  👁️
                </a>
                <button className="text-xs text-sky-600" onClick={() => edit(c)} title="Edit">
                  ✏️
                </button>
                {hidden || edited ? (
                  <button className="text-xs text-emerald-600" onClick={() => run(() => restoreItem(`ch:${base.id}`))} title="Restore original">
                    ↩️
                  </button>
                ) : null}
                {!hidden && (
                  <button
                    className="text-xs text-rose-500"
                    onClick={() => confirm(`Remove “${c.title}” from the app?`) && run(() => deleteChapter(base.id))}
                    title="Remove"
                  >
                    🗑️
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Library: view / remove / restore built-in items ---------------- */

function LibraryTab({ content, run }: { content: CustomContent; run: Run }) {
  const ch = (unit: string) =>
    chapters
      .filter((c) => c.unit === unit)
      .map((base) => {
        const c = content.overrides?.[base.id] ?? base;
        return { key: `ch:${c.id}`, label: `Ch ${c.chapter}. ${c.emoji} ${c.title}`, href: `/chapter/${c.id}` };
      });
  const sessions = (kind: string, n: number, emoji: string) =>
    Array.from({ length: n }, (_, i) => ({ key: "", label: `${emoji} Session ${i + 1}`, href: `/${kind}/session/${i + 1}` }));
  const videos = content.videos ?? [];
  const vids = (cat: string) => videos.filter((v) => v.category === cat).map((v) => ({ key: "", label: `🎬 ${v.title}`, href: `/extra?video=${v.id}` }));

  const groups: { title: string; page?: string; items: { key: string; label: string; href: string }[] }[] = [
    { title: "✈️ Travel: Airport & flying", page: "/travel", items: ch("airport") },
    { title: "🏨 Travel: Hotel", page: "/travel", items: ch("hotel") },
    { title: "🏙️ Travel: Around the city", page: "/travel", items: [...ch("city"), ...vids("travel")] },
    { title: "🏏 Sports commentary", page: "/", items: [...ch("sports"), ...vids("sports")] },
    {
      title: "✨ New chapters (added by admin)",
      items: content.chapters.map((c) => ({ key: "", label: `Ch ${c.chapter}. ${c.emoji} ${c.title}`, href: `/extra?chapter=${c.id}` })),
    },
    {
      title: "☕ Daily conversations",
      page: "/daily",
      items: [...dailyTalks.map((d) => ({ key: `daily:${d.id}`, label: `${d.n}. ${d.emoji} ${d.title}`, href: `/daily/${d.id}` })), ...vids("daily")],
    },
    { title: "📖 Stories", page: "/stories", items: stories.map((s) => ({ key: `story:${s.id}`, label: `${s.n}. ${s.emoji} ${s.title}`, href: `/stories/${s.id}` })) },
    {
      title: "💪 Motivation",
      page: "/motivation",
      items: [...speeches.map((s) => ({ key: `speech:${s.id}`, label: `${s.n}. ${s.emoji} ${s.title}`, href: `/motivation/${s.id}` })), ...vids("motivation")],
    },
    {
      title: "🎵 Music",
      page: "/music",
      items: [
        ...builtInSongs.map((s) => ({ key: `song:${s.id}`, label: `${s.emoji} ${s.title}`, href: `/music/${s.id}` })),
        ...content.songs.map((s) => ({ key: "", label: `✨ ${s.emoji} ${s.title}`, href: `/extra?song=${s.id}` })),
        ...vids("music"),
      ],
    },
    { title: "🎬 Other videos", page: "/videos", items: [...vids("pte"), ...vids("general")] },
    { title: "🎧 Listening sessions", page: "/listening", items: sessions("listening", 10, "🎧") },
    { title: "🎤 Speaking sessions", page: "/speaking", items: sessions("speaking", 10, "🎤") },
    { title: "👅 Tongue twister sessions", page: "/twisters", items: sessions("twisters", 12, "👅") },
    { title: "🎓 PTE sessions", page: "/pte", items: sessions("pte", 6, "🎓") },
    {
      title: "📄 Other pages",
      items: [
        { key: "", label: "🤖 Robot chat", href: "/chat" },
        { key: "", label: "⭐ Premium page", href: "/premium" },
        { key: "", label: "👤 Profile / login", href: "/login" },
        { key: "", label: "❓ User guide", href: "/help" },
        { key: "", label: "🔒 Privacy policy", href: "/privacy" },
      ],
    },
  ].filter((g) => g.items.length);
  const hidden = new Set(content.hidden ?? []);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm opacity-70">
        Everything customers can see. 👁️ opens it as a customer sees it (everything is unlocked for admins). 🗑️ removes it from the app; ↩️ brings it back. To
        change a chapter&apos;s words, use 📚 Chapters; for videos, use 🎬 Videos.
      </p>
      <div className="grid lg:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.title} className="card flex flex-col gap-1">
            <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
              <span className="flex-1">
                {g.title} <span className="text-sm font-normal opacity-60">({g.items.length - g.items.filter((i) => hidden.has(i.key)).length}/{g.items.length})</span>
              </span>
              {g.page && (
                <a className="text-xs font-semibold text-sky-600" href={g.page} target="_blank" rel="noreferrer">
                  Open section ↗
                </a>
              )}
            </h2>
            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto pr-1">
              {g.items.map((i) => {
                const off = hidden.has(i.key);
                return (
                  <div key={i.href} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ${off ? "bg-rose-500/10 opacity-70" : "bg-black/5 dark:bg-white/10"}`}>
                    <span className="flex-1 truncate">
                      {i.label}
                      {off && <span className="ml-1 text-[10px] rounded bg-rose-500 text-white px-1">removed</span>}
                    </span>
                    <a href={i.href} target="_blank" rel="noreferrer" title="View">
                      👁️
                    </a>
                    {!i.key ? null : off ? (
                      <button className="text-emerald-600" title="Restore" onClick={() => run(() => restoreItem(i.key))}>
                        ↩️
                      </button>
                    ) : (
                      <button className="text-rose-500" title="Remove" onClick={() => confirm(`Remove “${i.label}”?`) && run(() => hideItem(i.key))}>
                        🗑️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Videos ---------------- */

function parseTime(t: string) {
  const parts = t.trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return NaN;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

function parseSubs(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("|");
      if (i < 0) return null;
      const start = parseTime(l.slice(0, i));
      const t = l.slice(i + 1).trim();
      return Number.isFinite(start) && t ? { start, text: t } : null;
    })
    .filter((x): x is { start: number; text: string } => !!x);
}

function VideosTab({ content, run, youtube }: { content: CustomContent; run: Run; youtube: boolean }) {
  const empty = { id: "", url: "", title: "", category: "motivation" as VideoCategory, chapterId: "", subs: "" };
  const [f, setF] = useState(empty);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const allChapters = [...chapters, ...content.chapters];
  const parsed = parseSubs(f.subs);
  const videos = content.videos ?? [];
  const [preview, setPreview] = useState<(typeof videos)[number] | null>(null);

  return (
    <div className="flex flex-col gap-4">
    <YouTubeFinder
      youtube={youtube}
      run={run}
      onPick={(r) => {
        setF({ ...f, url: `https://youtu.be/${r.id}`, title: r.title });
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }}
    />
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
      <div className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">{f.id ? "✏️ Edit video" : "➕ Add a real video"}</h2>
        <p className="text-sm opacity-70">
          Paste a YouTube link (the owner must allow embedding), or an https link to your own .mp4 file. Only use videos you are allowed to share.
        </p>
        <input className={input} value={f.url} onChange={set("url")} placeholder="https://www.youtube.com/watch?v=… or https://…/video.mp4" />
        <input className={input} value={f.title} onChange={set("title")} placeholder="Title, e.g. Checking in at a hotel (real conversation)" />
        <div className="grid sm:grid-cols-2 gap-2">
          <select className={input} value={f.category} onChange={set("category")}>
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select className={input} value={f.chapterId} onChange={set("chapterId")}>
            <option value="">Not linked to a chapter</option>
            {allChapters.map((c) => (
              <option key={c.id} value={c.id}>
                Ch {c.chapter}: {c.title}
              </option>
            ))}
          </select>
        </div>
        <label className="text-sm font-semibold">
          Subtitles (optional): one line each as <code>time | text</code>, for example <code>0:05 | Good morning, welcome!</code>
          <textarea className={area} rows={10} value={f.subs} onChange={set("subs")} placeholder={"0:00 | Good morning, how can I help you?\n0:04 | I have a reservation under Silva."} />
        </label>
        <p className="text-xs opacity-60">{parsed.length} subtitle lines read.</p>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={() =>
              run(
                () => saveVideo({ id: f.id || undefined, url: f.url, title: f.title, category: f.category, chapterId: f.chapterId, subtitles: parsed }),
                () => setF(empty),
              )
            }
          >
            💾 Save video
          </button>
          {f.id && (
            <button className="btn-ghost" onClick={() => setF(empty)}>
              Cancel edit
            </button>
          )}
        </div>
      </div>
      <div className="card flex flex-col gap-2">
        <h2 className="font-bold text-lg">Videos customers see ({videos.length})</h2>
        {preview && (
          <div className="flex flex-col gap-2">
            <VideoPlayer key={preview.id} video={preview} compact />
            <button className="btn-ghost self-start" onClick={() => setPreview(null)}>
              ✕ Close preview
            </button>
          </div>
        )}
        {videos.map((v) => (
          <div key={v.id} className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2 text-sm">
            <button title="Watch" onClick={() => setPreview(v)}>
              ▶️
            </button>
            <span className="flex-1 truncate">
              {v.title}
              <span className="ml-1 text-[10px] opacity-60">{VIDEO_CATEGORIES.find((c) => c.id === v.category)?.label}</span>
            </span>
            <a className="text-xs" href={`/extra?video=${v.id}`} target="_blank" rel="noreferrer" title="View as customer">
              👁️
            </a>
            <button
              className="text-xs text-sky-600"
              onClick={() =>
                setF({
                  id: v.id,
                  url: v.youtubeId ? `https://youtu.be/${v.youtubeId}` : v.fileUrl,
                  title: v.title,
                  category: v.category,
                  chapterId: v.chapterId,
                  subs: v.subtitles.map((s) => `${Math.floor(s.start / 60)}:${String(Math.round(s.start % 60)).padStart(2, "0")} | ${s.text}`).join("\n"),
                })
              }
            >
              Edit
            </button>
            <button className="text-xs text-rose-500" onClick={() => confirm(`Delete “${v.title}”?`) && run(() => deleteVideo(v.id))}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

/* ---------------- Songs ---------------- */

function SongsTab({ content, run }: { content: CustomContent; run: Run }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎵");
  const [mood, setMood] = useState("Happy pop");
  const [bpm, setBpm] = useState("100");
  const [style, setStyle] = useState(builtInSongs[0].id);
  const [lyrics, setLyrics] = useState("");

  function toSong(): Song {
    const base = builtInSongs.find((s) => s.id === style) ?? builtInSongs[0];
    return {
      id: "",
      title: title.trim(),
      emoji: emoji.trim() || "🎵",
      mood: mood.trim(),
      bpm: Math.max(60, Math.min(160, Number(bpm) || 100)),
      chords: base.chords,
      scene: base.scene,
      lines: lyrics.split("\n").map((t) => t.trim()).filter(Boolean).map((text) => ({ text })),
      vocab: [],
    };
  }

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
      <div className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">➕ Add a karaoke song</h2>
        <p className="text-sm opacity-70">Use only lyrics you wrote yourself or have permission to use.</p>
        <div className="grid sm:grid-cols-[5rem_1fr] gap-2">
          <input className={input} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title" />
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          <input className={input} value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Mood" />
          <input className={input} type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} placeholder="Speed (BPM)" />
          <select className={input} value={style} onChange={(e) => setStyle(e.target.value)}>
            {builtInSongs.map((s) => (
              <option key={s.id} value={s.id}>
                Music + picture like “{s.title}”
              </option>
            ))}
          </select>
        </div>
        <label className="text-sm font-semibold">
          Lyrics: one line each
          <textarea className={area} rows={10} value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
        </label>
        <button className="btn-primary self-start" onClick={() => run(() => saveSong(toSong()), () => { setTitle(""); setLyrics(""); })}>
          💾 Save song
        </button>
      </div>
      <div className="card flex flex-col gap-2">
        <h2 className="font-bold text-lg">New songs ({content.songs.length})</h2>
        {content.songs.map((s) => (
          <div key={s.id} className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2 text-sm">
            <span>{s.emoji}</span>
            <span className="flex-1">{s.title}</span>
            <button className="text-xs text-rose-500" onClick={() => confirm(`Delete “${s.title}”?`) && run(() => deleteSong(s.id))}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Twisters ---------------- */

function TwistersTab({ content, run }: { content: CustomContent; run: Run }) {
  const [text, setText] = useState("");
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card flex flex-col gap-3">
        <h2 className="font-bold text-lg">➕ Add tongue twisters</h2>
        <textarea className={area} rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={"One tongue twister per line\nBetty's blue bike bumped a big brown box."} />
        <button className="btn-primary self-start" onClick={() => run(() => addTwisters(text), () => setText(""))}>
          💾 Add
        </button>
      </div>
      <div className="card flex flex-col gap-1">
        <h2 className="font-bold text-lg">New twisters ({content.twisters.length})</h2>
        <div className="max-h-96 overflow-y-auto flex flex-col gap-1">
          {content.twisters.map((t) => (
            <div key={t.text} className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-1.5 text-sm">
              <span className="flex-1">{t.text}</span>
              <button className="text-xs text-rose-500" onClick={() => run(() => deleteTwister(t.text))}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
