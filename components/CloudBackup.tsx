"use client";

import { useEffect, useState } from "react";
import { backupNow, lastBackup, restoreFromCode, startCloudSync } from "@/lib/cloudSync";

/** Starts the automatic cloud backup (mounted once in the layout). */
export function CloudSync() {
  useEffect(() => startCloudSync(), []);
  return null;
}

/** ☁️ Backup code + "use my data on another device" (on the profile page). */
export function CloudBackupCard({ userId }: { userId: string }) {
  const [last, setLast] = useState(0);
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setLast(lastBackup()), []); // eslint-disable-line react-hooks/set-state-in-effect

  return (
    <div className="card flex flex-col gap-3">
      <h2 className="text-lg font-black">☁️ Online backup</h2>
      <p className="text-sm opacity-80">
        Your progress, notebook and settings are saved in the online database automatically. To use them on another phone or computer, open your profile there and enter this backup code.
      </p>
      <p className="si text-sm opacity-80">ඔබේ දත්ත ස්වයංක්‍රීයව සුරැකේ. වෙනත් උපාංගයකදී මෙම කේතය ඇතුළත් කරන්න.</p>
      <div className="flex items-center gap-2">
        <code className="select-all flex-1 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2 text-sm font-bold break-all">{userId}</code>
        <button
          className="btn-ghost text-sm"
          onClick={() => {
            navigator.clipboard?.writeText(userId).then(() => setMsg("Code copied. Keep it private: it opens your data."), () => setMsg(""));
          }}
        >
          📋 Copy
        </button>
      </div>
      <p className="text-xs opacity-60">{last ? `Last saved online: ${new Date(last).toLocaleString()}` : "Not saved online yet."}</p>
      <button
        className="btn-primary self-start"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const ok = await backupNow();
          setBusy(false);
          setLast(lastBackup());
          setMsg(ok ? "✅ Saved online." : "Could not save now (offline?). It will try again automatically.");
        }}
      >
        ☁️ Back up now
      </button>
      <details className="rounded-2xl bg-black/5 dark:bg-white/5 p-3">
        <summary className="font-bold cursor-pointer">📲 I have a backup code from another device</summary>
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-xs opacity-70">This replaces the progress and notebook on this device with the saved ones.</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="u_…"
            className="rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-2.5"
          />
          <button
            className="btn-primary self-start"
            disabled={busy || !code.trim()}
            onClick={async () => {
              if (!confirm("Replace this device's data with the data from that code?")) return;
              setBusy(true);
              const r = await restoreFromCode(code);
              setBusy(false);
              setMsg(r.message);
            }}
          >
            ⬇️ Restore my data
          </button>
        </div>
      </details>
      {msg && <p className="text-sm font-semibold">{msg}</p>}
    </div>
  );
}
