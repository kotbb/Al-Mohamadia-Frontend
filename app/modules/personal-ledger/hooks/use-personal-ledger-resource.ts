"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import type { LedgerResource } from "../types/personal-ledger.types";

export function usePersonalLedgerResource<T>(load: (signal: AbortSignal) => Promise<T>, delay = 0): LedgerResource<T> {
  const t = useTranslations("personalLedger");
  const errorMessage = useApiErrorMessage();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: string | null; load?: typeof load; revision?: number }>({ data: null, error: null });
  const fallback = t("loadError");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      load(controller.signal).then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, load, revision });
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: null, error: errorMessage(error, fallback), load, revision });
      });
    }, delay);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [load, delay, revision, errorMessage, fallback]);

  const retry = useCallback(() => setRevision((value) => value + 1), []);
  const current = state.load === load && state.revision === revision;
  return { data: current ? state.data : null, loading: !current, error: current ? state.error : null, retry };
}
