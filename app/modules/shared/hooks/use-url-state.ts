"use client";

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useSearchParams } from "next/navigation";
import { readUrlState, writeUrlState } from "../utils/url-state";

/** Keep browsing selections in the URL without adding filter edits to Back history. */
export function useUrlState<T>(
  key: string,
  initial: T | (() => T),
  allowed?: readonly string[],
): [T, Dispatch<SetStateAction<T>>] {
  const params = useSearchParams();
  const [defaults] = useState(initial);
  const [choices] = useState(allowed);
  const serialized = JSON.stringify(readUrlState(new URLSearchParams(params?.toString()), key, defaults, choices));
  // Unrelated query changes (for example audit-dialog filters) keep record identity.
  const value = useMemo(() => JSON.parse(serialized) as T, [serialized]);
  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (update) => {
      const nextParams = new URLSearchParams(window.location.search);
      const current = readUrlState(nextParams, key, defaults, choices);
      const next = typeof update === "function" ? (update as (previous: T) => T)(current) : update;
      writeUrlState(nextParams, key, next, defaults);
      const query = nextParams.toString();
      const nextHref = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      if (nextHref !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        const previousState = window.history.state;
        // Let Next's public history adapter notify useSearchParams. Passing the
        // current framework state makes it treat this as an internal-only write.
        window.history.replaceState(null, "", nextHref);
        // Reattach app/third-party metadata after Next has copied its own state.
        // Both calls replace the same entry; neither adds a Back step.
        window.history.replaceState({ ...previousState, ...window.history.state }, "", nextHref);
      }
    },
    [key, defaults, choices],
  );
  return [value, setValue];
}
