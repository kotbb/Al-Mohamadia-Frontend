"use client";

import { useEffect, useState } from "react";
import { getInvoiceNeighbors } from "../services/invoices.service";
import type { InvoiceNeighbors } from "../types/invoices.types";

export function useInvoiceNeighbors(invoiceId: string) {
  const [tick, setTick] = useState(0);
  const key = `${invoiceId}:${tick}`;
  const [result, setResult] = useState<{
    key: string;
    data: InvoiceNeighbors | null;
    failed: boolean;
  } | null>(null);
  const current = result?.key === key ? result : null;
  useEffect(() => {
    const controller = new AbortController();
    getInvoiceNeighbors(invoiceId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({ key, data: null, failed: true });
      });
    return () => controller.abort();
  }, [invoiceId, key]);
  return {
    neighbors: current?.data ?? null,
    failed: current?.failed ?? false,
    retry: () => setTick((value) => value + 1),
  };
}
