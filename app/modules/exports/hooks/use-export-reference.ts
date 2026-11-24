"use client";

import { useEffect, useState } from "react";
import { getExportReference, searchExportReferences } from "../services/exports.service";
import type { ExportLookupOption } from "../types/exports.types";

export function useExportReference(field: string, value: string) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ key: string; options: ExportLookupOption[]; error: boolean } | null>(null);
  const [selected, setSelected] = useState<ExportLookupOption | null>(null);
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify([field, query, retry]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchExportReferences(field, query, controller.signal)
        .then((options) => {
          if (!controller.signal.aborted) setResult({ key, options, error: false });
        })
        .catch(() => {
          if (!controller.signal.aborted) setResult({ key, options: [], error: true });
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [field, query, key]);
  useEffect(() => {
    const controller = new AbortController();
    if (value)
      getExportReference(field, value, controller.signal)
        .then((row) => {
          if (!controller.signal.aborted) setSelected(row);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSelected({ id: value, name: "" });
        });
    return () => controller.abort();
  }, [field, value]);
  return {
    query,
    setQuery,
    select: (option: ExportLookupOption) => {
      setSelected(option);
      setQuery("");
    },
    options: result?.key === key ? result.options : [],
    selected: selected?.id === value ? selected : null,
    loading: result?.key !== key,
    error: result?.key === key && result.error,
    reload: () => setRetry((count) => count + 1),
  };
}
