"use client";

import { useEffect, useState } from "react";
import { useUrlState } from "./use-url-state";

export function useUrlSearch(key = "q", pageKey = "page", delay = 300) {
  const [committed, setCommitted] = useUrlState(key, "");
  const [, setPage] = useUrlState(pageKey, 1);
  const [editing, setEditing] = useState({ source: committed, value: committed });
  const input = editing.source === committed ? editing.value : committed;
  useEffect(() => {
    const commit = () => {
      const next = input.trim();
      if (next === committed) return;
      setCommitted(next);
      setPage(1);
    };
    const timer = input.trim() !== committed ? window.setTimeout(commit, delay) : undefined;
    window.addEventListener?.("app:before-navigation", commit);
    window.addEventListener?.("pagehide", commit);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener?.("app:before-navigation", commit);
      window.removeEventListener?.("pagehide", commit);
    };
  }, [input, committed, delay, setCommitted, setPage]);
  return [input, (value: string) => setEditing({ source: committed, value }), committed] as const;
}
