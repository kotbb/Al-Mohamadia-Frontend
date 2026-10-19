"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { PublicInvoiceSheet } from "./public-invoice-sheet";
import { getInvoiceReceipt, getSalesInvoiceShare } from "../services/invoices.service";
import { createInvoiceFile, downloadInvoiceFile, type InvoiceFileFormat } from "../utils/invoice-file";
import type { PublicInvoice } from "../types/invoices.types";
import { receiptDisplayNumber } from "../utils/receipt-format";

type PreparedImage = { file: File; showPrices: boolean };

export function InvoiceShareModal({ invoiceId, onClose, initialShowPrices = true, initialFormat = "png" }: { invoiceId: string; onClose: () => void; initialShowPrices?: boolean; initialFormat?: InvoiceFileFormat }) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [showPrices, setShowPrices] = useState(initialShowPrices);
  const [format, setFormat] = useState<InvoiceFileFormat>(initialFormat);
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const imageReady = format === "png" && prepared?.showPrices === showPrices;
  const invoiceText = t("sharedInvoiceNumber", { number: invoice ? receiptDisplayNumber(invoice.invoiceNumber) : "" });

  useEffect(() => {
    const controller = new AbortController();
    getInvoiceReceipt(invoiceId, controller.signal).then(setInvoice).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : t("exportError"));
    });
    return () => controller.abort();
  }, [invoiceId, t]);

  useEffect(() => {
    if (format !== "png" || !invoice || !sheet.current) return;
    let active = true;
    setPrepared(null);
    void document.fonts.ready.then(() => sheet.current && createInvoiceFile(sheet.current, invoice.invoiceNumber, "png"))
      .then((file) => { if (active && file) setPrepared({ file, showPrices }); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : t("exportError")); });
    return () => { active = false; };
  }, [invoice, showPrices, format, t]);

  async function share() {
    if (!invoice || busy || (format === "png" && !imageReady)) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    setWhatsAppUrl(null);
    try {
      if (format === "pdf") {
        const payload = await getSalesInvoiceShare(invoiceId);
        const publicUrl = new URL(payload.pdfUrl);
        if (!showPrices) publicUrl.searchParams.set("prices", "off");
        const url = `https://wa.me/?text=${encodeURIComponent(`${invoiceText}\n${publicUrl.toString()}`)}`;
        setWhatsAppUrl(url);
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus(t("publicLinkReady"));
        return;
      }

      const file = prepared!.file;
      const url = `https://wa.me/?text=${encodeURIComponent(invoiceText)}`;
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: invoiceText, text: invoiceText });
          setStatus(t("shareSheetOpened"));
          return;
        } catch (reason) {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": file })]);
        setWhatsAppUrl(url);
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus(t("pasteImageHint"));
      } catch {
        downloadInvoiceFile(file);
        setWhatsAppUrl(url);
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus(t("attachImageHint"));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("exportError"));
    } finally {
      setBusy(false);
    }
  }

  return <Modal open onClose={onClose} title={t("shareInvoiceTitle", { number: invoice?.invoiceNumber ?? "…" })}>
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-text-primary">{t("priceVisibility")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {([true, false] as const).map((value) => <label key={String(value)} className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors ${showPrices === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-text-secondary hover:bg-surface-muted"}`}>
            <input type="radio" name="share-prices" className="sr-only" checked={showPrices === value} onChange={() => setShowPrices(value)} />
            <span className="font-semibold">{value ? t("withPrices") : t("withoutPrices")}</span>
          </label>)}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-text-primary">{t("shareFormat")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["png", "pdf"] as const).map((value) => <label key={value} className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors ${format === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-text-secondary hover:bg-surface-muted"}`}>
            <input type="radio" name="share-format" className="sr-only" checked={format === value} onChange={() => setFormat(value)} />
            <span className="font-semibold">{value === "png" ? t("imageFormat") : t("pdfLinkFormat")}</span>
          </label>)}
        </div>
      </fieldset>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {status && <p role="status" className="text-sm text-text-secondary">{status}</p>}
      {whatsAppUrl && <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="block text-sm font-semibold text-primary underline">{t("openWhatsApp")}</a>}
      <button type="button" disabled={!invoice || busy || (format === "png" && !imageReady)} onClick={() => void share()} className="ds-focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#20c45b] disabled:cursor-wait disabled:opacity-50">
        <WhatsAppIcon />{busy || (format === "png" && !imageReady) ? t("preparingFile") : t("whatsappOnly")}
      </button>
      {invoice && format === "png" && <div aria-hidden="true" style={{ position: "fixed", left: "-10000px", top: 0, width: "148mm", pointerEvents: "none" }}><PublicInvoiceSheet invoice={invoice} showPrices={showPrices} compact id="share-invoice-sheet" printAreaRef={sheet} /></div>}
    </div>
  </Modal>;
}

function WhatsAppIcon() {
  return <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17.5 6.5A7.8 7.8 0 0 0 12 4.2C7.7 4.2 4.2 7.7 4.2 12c0 1.4.4 2.7 1.1 3.9L4 20l4.3-1.1c1.1.6 2.4 1 3.7 1 4.3 0 7.8-3.5 7.8-7.8 0-2.1-.8-4.1-2.3-5.6Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/><path d="M15.3 14.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.1-.2.2-.4.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.4.1-.1.1-.2.2-.3 0-.1 0-.2-.1-.3s-.5-1.2-.7-1.6c-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.1-.4-.2Z" fill="currentColor"/></svg>;
}
