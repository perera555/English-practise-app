"use client";

import { useCallback, useEffect, useState } from "react";

/** Fired whenever a tab adds a history step, so the ‹ › buttons in the top bar can update. */
export const NAV_EVENT = "erp-nav";

/**
 * Like useState for a page's tabs, but each tab change is a real history step (?tab=…),
 * so the ‹ Back / › Forward buttons (and the phone's back button) move between tabs too.
 */
export function useUrlTab<T extends string>(initial: T, param = "tab") {
  const [tab, setTabState] = useState<T>(initial);

  useEffect(() => {
    const read = () => {
      const t = new URLSearchParams(window.location.search).get(param);
      setTabState((t as T) || initial);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [initial, param]);

  const setTab = useCallback(
    (t: T) => {
      setTabState(t);
      const url = new URL(window.location.href);
      if ((url.searchParams.get(param) || initial) === t) return;
      if (t === initial) url.searchParams.delete(param);
      else url.searchParams.set(param, t);
      window.history.pushState(null, "", url.pathname + url.search + url.hash);
      window.dispatchEvent(new Event(NAV_EVENT));
    },
    [initial, param],
  );

  return [tab, setTab] as const;
}
