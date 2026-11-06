import { Suspense } from "react";
import { connection } from "next/server";
import { adminEnabled, isAdmin } from "@/lib/adminAuth";
import { dbGet, storageMode } from "@/lib/db";
import { AdminDashboard, AdminLogin } from "@/components/admin/AdminDashboard";

export const metadata = { title: "Admin · SpeakUp English", robots: { index: false } };

async function AdminInner() {
  // Read the password setting at request time, not at build time.
  await connection();
  if (!adminEnabled()) {
    return (
      <div className="card max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">🔐 Admin is not set up yet</h1>
        <p className="opacity-80">
          Add a line <code>ADMIN_PASSWORD=your-strong-password</code> (at least 8 characters) to <code>.env.local</code>, or to the Environment Variables in
          Vercel, then restart. See <code>STORE-GUIDE.md</code>.
        </p>
      </div>
    );
  }
  if (!(await isAdmin())) return <AdminLogin />;
  const [grants, codes, content] = await Promise.all([dbGet("grants"), dbGet("codes"), dbGet("content")]);
  return <AdminDashboard grants={grants} codes={codes} content={content} storage={storageMode()} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="opacity-60">Loading admin…</p>}>
      <AdminInner />
    </Suspense>
  );
}
