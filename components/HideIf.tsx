"use client";

import type { ReactNode } from "react";
import { isHidden, useCustomContent } from "@/lib/customContent";

/** Hides its children when the admin removed this item (e.g. itemKey="song:city-lights"). */
export function HideIf({ itemKey, children }: { itemKey: string; children: ReactNode }) {
  const c = useCustomContent();
  return isHidden(c, itemKey) ? null : <>{children}</>;
}

/** Shown instead of a page when the admin removed that item. */
export function RemovedNotice() {
  return (
    <div className="card text-center py-12 flex flex-col items-center gap-3">
      <p className="text-5xl">🗂️</p>
      <p className="text-lg font-semibold">This lesson is not available any more.</p>
      <a href="/" className="btn-primary">
        Go to home
      </a>
    </div>
  );
}
