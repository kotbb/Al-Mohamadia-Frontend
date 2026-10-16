"use client";

import type {
  LoadStatus,
  UsePriceHistoryResult,
} from "../types/use-price-history.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useEffect, useState } from "react";
import {
  getItem,
  getPriceHistory,
} from "@/app/modules/items/services/items.service";
import type {
  Item,
  PriceHistoryEntry,
} from "@/app/modules/items/types/items.types";

export function usePriceHistory(itemId: string | null): UsePriceHistoryResult {
  const describeError = useApiErrorMessage();
  const [item, setItem] = useState<Item | null>(null);
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [status, setStatus] = useState<LoadStatus>(itemId ? "loading" : "idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setHistory([]);
      setStatus("idle");
      setError(null);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    Promise.all([
      getItem(itemId, controller.signal),
      getPriceHistory(itemId, controller.signal),
    ])
      .then(([loadedItem, entries]) => {
        setItem(loadedItem);
        setHistory(entries);
        setStatus("success");
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(loadError, "Request failed");
        setItem(null);
        setHistory([]);
        setStatus("error");
        setError(message);
      });

    return () => controller.abort();
  }, [itemId]);

  return { item, history, status, error };
}
