"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PublicInvoiceSheet } from "../components/public-invoice-sheet";
import { InvoiceShareModal } from "../components/invoice-share-modal";
import { getInvoiceReceipt } from "../services/invoices.service";
import { createInvoiceFile, downloadInvoiceFile, type InvoiceFileFormat } from "../utils/invoice-file";
import type { PublicInvoice } from "../types/invoices.types";

export function InvoiceExportPage({ invoiceId }: { invoiceId: string }) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrices, setShowPrices] = useState(true);
  const [format, setFormat] = useState<InvoiceFileFormat>("png");
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    getInvoiceReceipt(invoiceId, controller.signal).then(setInvoice).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : t("exportError"));
    });
    return () => controller.abort();
  }, [invoiceId, t]);

  async function download() {
    if (!invoice || !sheet.current) return;
    setBusy(true);
    setError(null);
    try {
      await document.fonts.ready;
      downloadInvoiceFile(await createInvoiceFile(sheet.current, invoice.invoiceNumber, format));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("exportError"));
    } finally {
      setBusy(false);
    }
  }

  return <div className="min-h-screen bg-background text-text-primary" dir={locale === "ar" ? "rtl" : "ltr"}>
    <header className="print:hidden sticky top-0 z-10 border-b border-border bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("exportTitle")}</p>
          <h1 className="text-xl font-bold">{invoice ? t("sharedInvoiceNumber", { number: invoice.invoiceNumber }) : t("loadingInvoice")}</h1>
        </div>
        <Link href={`/invoices/${invoiceId}`} className="ds-focus-ring rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-muted">{t("backToInvoice")}</Link>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-border/60 px-5 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <fieldset className="flex items-center gap-1 rounded-xl border border-border bg-surface-muted p-1">
            <legend className="sr-only">{t("format")}</legend>
            {(["pdf", "png"] as const).map((value) => <label key={value} className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${format === value ? "bg-surface text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
              <input type="radio" name="export-format" className="sr-only" checked={format === value} onChange={() => setFormat(value)} />
              {value === "pdf" ? "PDF · A4" : "PNG · A5"}
            </label>)}
          </fieldset>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold">
            <input type="checkbox" checked={showPrices} onChange={(event) => setShowPrices(event.target.checked)} className="h-4 w-4 accent-primary" />
            {t("showPrices")}
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={!invoice || busy} onClick={() => window.print()} className="ds-focus-ring rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">{t("print")}</button>
          <button type="button" disabled={!invoice || busy} onClick={() => void download()} className="ds-focus-ring rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-muted disabled:opacity-50">{busy ? t("saving") : t("downloadFile")}</button>
          <button type="button" disabled={!invoice || busy} onClick={() => setShareOpen(true)} className="ds-focus-ring flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20c45b] disabled:opacity-50"><svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17.5 6.5A7.8 7.8 0 0 0 12 4.2C7.7 4.2 4.2 7.7 4.2 12c0 1.4.4 2.7 1.1 3.9L4 20l4.3-1.1c1.1.6 2.4 1 3.7 1 4.3 0 7.8-3.5 7.8-7.8 0-2.1-.8-4.1-2.3-5.6Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/><path d="M15.3 14.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.1-.2.2-.4.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.4.1-.1.1-.2.2-.3 0-.1 0-.2-.1-.3s-.5-1.2-.7-1.6c-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.1-.4-.2Z" fill="currentColor"/></svg>{t("whatsappOnly")}</button>
        </div>
      </div>
    </header>
    {error && <p role="alert" className="mx-auto max-w-3xl p-4 text-danger">{error}</p>}
    {!invoice && !error && <p className="p-8 text-center">{t("loadingInvoice")}</p>}
    {invoice && <div className="mx-auto py-8 px-3 print:p-0" style={{ width: format === "pdf" ? "min(100%, 210mm)" : "min(100%, 148mm)" }}>
      <PublicInvoiceSheet invoice={invoice} showPrices={showPrices} compact={format === "png"} id="export-invoice-sheet" printAreaRef={sheet} />
    </div>}
    {shareOpen && <InvoiceShareModal invoiceId={invoiceId} initialShowPrices={showPrices} initialFormat={format} onClose={() => setShareOpen(false)} />}
    <style>{`@media print { @page { size: ${format === "pdf" ? "A4" : "A5"} portrait; margin: 0; } body * { visibility: hidden !important; } #export-invoice-sheet, #export-invoice-sheet * { visibility: visible !important; } #export-invoice-sheet { position: absolute; inset: 0 auto auto 0; width: ${format === "pdf" ? "210mm" : "148mm"}; box-shadow: none !important; } }`}</style>
  </div>;
}
