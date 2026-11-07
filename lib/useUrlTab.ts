"use client";

import { useCallback, useEffect, useState } from "react";

/** Fired whenever a tab adds a history step, so the ‹ › buttons in the top bar can update. */
export const NAV_EVENT = "erp-nav";

/** The page's tabs, so the top-bar › button can open the next tab. */
let stepper: { hasNext: () => boolean; next: () => void } | null = null;
export const tabStepper = () => stepper;

/**
 * Like useState for a page's tabs, but each tab change is a real history step (?tab=…),
 * so the ‹ Back / › Forward buttons (and the phone's back button) move between tabs too.
 * Pass `order` (all tab ids) so › can also step to the next tab.
 */
export function useUrlTab<T extends string>(initial: T, order?: readonly T[], param = "tab") {
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

  const orderKey = order?.join("|") ?? "";
  useEffect(() => {
    const order = (orderKey ? orderKey.split("|") : []) as T[];
    if (!order.length) return;
    // Read the tab from the address (always up to date, even before React re-renders).
    const current = () => order.indexOf(((new URLSearchParams(window.location.search).get(param) as T) || initial));
    const me = {
      hasNext: () => current() < order.length - 1,
      next: () => {
        const i = current();
        if (i < order.length - 1) setTab(order[i + 1]);
      },
    };
    stepper = me;
    window.dispatchEvent(new Event(NAV_EVENT));
    return () => {
      if (stepper === me) stepper = null;
    };
  }, [orderKey, setTab, param, initial]);

  return [tab, setTab] as const;
}
