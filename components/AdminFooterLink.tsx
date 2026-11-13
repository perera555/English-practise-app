"use client";

import Link from "next/link";
import { OPEN_ADMIN_EVENT } from "@/lib/adminClient";

/** "Admin login" button at the bottom of every page. Opens the login page with the admin password box showing. */
export function AdminFooterLink() {
  return (
    <Link
      href="/login?admin=1"
      onClick={() => setTimeout(() => window.dispatchEvent(new Event(OPEN_ADMIN_EVENT)), 300)}
      className="inline-flex items-center gap-1 rounded-full border border-black/15 dark:border-white/20 px-3 py-1 font-semibold"
    >
      🔐 Admin login
    </Link>
  );
}
