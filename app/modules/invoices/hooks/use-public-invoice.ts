"use client";
import { useEffect, useState } from "react";
import { getPublicInvoice } from "../services/invoices.service";
import { downloadInvoicePdf } from "../utils/invoice-pdf";
import type { PublicInvoice } from "../types/invoices.types";

export function usePublicInvoice(token: string) {
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    getPublicInvoice(token, controller.signal)
      .then((data) => {
        setInvoice(data);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "فشل تحميل الفاتورة");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [token]);

  async function handleDownload() {
    if (!invoice) return;
    setIsDownloading(true);
    try {
      await downloadInvoicePdf("public-invoice-sheet", invoice.invoiceNumber);
    } catch {
      // silent
    } finally {
      setIsDownloading(false);
    }
  }
  return { invoice, isLoading, error, isDownloading, handleDownload };
}
