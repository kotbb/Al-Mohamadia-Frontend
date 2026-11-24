"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUrlState } from "./use-url-state";

/** Persist the selected account ID; display-name hydration must not clear inactive filters. */
export function useUrlAccountFilter(
  key: string,
  lookup: (id: string, signal?: AbortSignal) => Promise<{ id: string; name: string }>,
) {
  const [id, setId] = useUrlState(key, "");
  const [names, setNames] = useState<Record<string, string>>({});
  const label = id ? names[id] : undefined;
  useEffect(() => {
    if (!id || label !== undefined) return;
    const controller = new AbortController();
    lookup(id, controller.signal)
      .then((account) => {
        if (!controller.signal.aborted) setNames((current) => ({ ...current, [id]: account.name }));
      })
      .catch(() => {
        if (!controller.signal.aborted) setNames((current) => ({ ...current, [id]: id }));
      });
    return () => controller.abort();
  }, [id, label, lookup]);
  const selected = useMemo(() => (id ? { id, name: label ?? id } : null), [id, label]);
  const select = useCallback(
    (account: { id: string; name: string } | null) => {
      if (account) setNames((current) => ({ ...current, [account.id]: account.name }));
      setId(account?.id ?? "");
    },
    [setId],
  );
  return [selected, select] as const;
}
