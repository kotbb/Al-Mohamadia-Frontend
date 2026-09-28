"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  downloadInvoicePdf,
  getPublicInvoice,
} from "@/app/modules/invoices/services/invoices.service";
import type { PublicInvoice } from "@/app/modules/invoices/types/invoices.types";

interface PublicInvoicePageClientProps {
  token: string;
}

function money(value: number): string {
  const amount = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
  return `${amount} ج.م`;
}

function formatDateYMD(iso: string | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function PublicInvoicePageClient({ token }: PublicInvoicePageClientProps) {
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

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
        setError(
          err instanceof Error ? err.message : "فشل تحميل الفاتورة",
        );
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

  const hasDimensions = invoice?.lines.some(
    (l) => l.thickness != null || l.width != null || l.length != null,
  );

  return (
    <div
      className="min-h-screen bg-[#f4f4f4] print:bg-white"
      dir="rtl"
      style={{
        fontFamily:
          "'Noto Sans Arabic', 'Noto Sans', 'Cairo', Arial, sans-serif",
      }}
    >
      {/* Action Bar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e0e0e0] bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
            <Image
              src="/images/icon-mark.png"
              alt="المحمدية"
              width={32}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">
            المحمدية لتجارة الأخشاب
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={isLoading || !invoice}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#222] bg-white px-3 py-2 text-sm font-semibold text-[#222] transition-colors hover:bg-[#f0f0f0] disabled:opacity-40"
          >
            <PrinterIcon />
            طباعة
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={isLoading || !invoice || isDownloading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#b85d19] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9d4e14] disabled:opacity-40"
          >
            <DownloadIcon />
            {isDownloading ? "جارٍ التحميل…" : "تحميل PDF"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[210mm] px-3 py-6 print:p-0">
        {isLoading ? (
          <div className="py-24 text-center text-[#888]">
            <div className="mb-3 text-4xl">⏳</div>
            <p>جارٍ تحميل الفاتورة…</p>
          </div>
        ) : error || !invoice ? (
          <div className="py-24 text-center">
            <div className="mb-3 text-4xl">❌</div>
            <p className="text-[#b91c1c]">{error ?? "الفاتورة غير موجودة"}</p>
          </div>
        ) : (
          /* ── A4 Invoice Sheet ── */
          <div
            ref={printAreaRef}
            id="public-invoice-sheet"
            className="bg-white text-[#1a1a1a] shadow-xl print:shadow-none"
            style={{ padding: "16mm" }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between gap-4">
              {/* Right: Invoice # & Date */}
              <div className="text-right">
                <div className="text-xl font-bold leading-tight text-[#b85d19]">
                  فاتورة #{invoice.invoiceNumber}
                </div>
                <div className="mt-1 text-xs text-[#666]">
                  {formatDateYMD(invoice.createdAt)}
                </div>
              </div>

              {/* Left: Brand */}
              <div className="flex items-center gap-2.5" dir="rtl">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image
                    src="/images/icon-mark.png"
                    alt="Logo"
                    width={36}
                    height={36}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col text-right" dir="rtl">
                  <span
                    dir="rtl"
                    className="text-[22px] font-bold text-[#1a1a1a] leading-tight"
                    style={{ letterSpacing: "0px" }}
                  >
                    المحمدية
                  </span>
                  <span
                    dir="rtl"
                    className="mt-0.5 text-[11px] text-[#777]"
                    style={{ letterSpacing: "0px" }}
                  >
                    تجارة الأخشاب والألواح
                  </span>
                </div>
              </div>
            </div>

            {/* Thick rule */}
            <hr className="mb-3.5 border-0 border-t-2 border-[#222]" />

            {/* Customer */}
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span className="font-bold text-[#444]">العميل:</span>
              <span className="font-bold text-[#111]">
                {invoice.type === "cash_sale"
                  ? "نقدي"
                  : invoice.customerName ?? "نقدي"}
              </span>
            </div>

            {/* Status banner for cancelled invoices */}
            {invoice.status === "cancelled" && (
              <div className="mb-4 rounded-md bg-[#fee2e2] p-2 text-center text-[15px] font-bold text-[#b91c1c]">
                فاتورة ملغاة
              </div>
            )}

            {/* Items table */}
            <table className="mb-5 w-full table-fixed border-collapse text-xs">
              <thead>
                <tr className="border-b-[1.5px] border-[#222] text-[#333]">
                  <th className="py-2 px-1.5 text-right text-[13px] font-bold">
                    الصنف
                  </th>
                  {hasDimensions && (
                    <>
                      <th className="w-[10%] py-2 px-1.5 text-center text-[13px] font-bold">
                        التخانة
                      </th>
                      <th className="w-[10%] py-2 px-1.5 text-center text-[13px] font-bold">
                        العرض
                      </th>
                      <th className="w-[10%] py-2 px-1.5 text-center text-[13px] font-bold">
                        الطول
                      </th>
                    </>
                  )}
                  <th className="w-[11%] py-2 px-1.5 text-center text-[13px] font-bold">
                    العدد
                  </th>
                  <th className="w-[15%] py-2 px-1.5 text-center text-[13px] font-bold">
                    سعر الوحدة
                  </th>
                  <th className="w-[16%] py-2 px-1.5 text-center text-[13px] font-bold">
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#e0e0e0] text-[12px]"
                  >
                    <td className="py-2.5 px-1.5 text-right align-top">
                      <div className="text-[13px] font-bold text-[#111]">
                        {line.itemLabel}
                      </div>
                      {line.note && (
                        <div className="mt-0.5 text-[10px] italic text-[#666]">
                          {line.note}
                        </div>
                      )}
                    </td>
                    {hasDimensions && (
                      <>
                        <td className="py-2.5 px-1.5 text-center align-top text-[#1a1a1a]">
                          {line.thickness ?? "—"}
                        </td>
                        <td className="py-2.5 px-1.5 text-center align-top text-[#1a1a1a]">
                          {line.width ?? "—"}
                        </td>
                        <td className="py-2.5 px-1.5 text-center align-top text-[#1a1a1a]">
                          {line.length ?? "—"}
                        </td>
                      </>
                    )}
                    <td className="py-2.5 px-1.5 text-center align-top font-bold text-[#1a1a1a]">
                      {line.quantity}
                    </td>
                    <td className="whitespace-nowrap py-2.5 px-1.5 text-center align-top text-[#1a1a1a]">
                      {money(line.piecePrice)}
                    </td>
                    <td className="whitespace-nowrap py-2.5 px-1.5 text-center align-top font-bold text-[#1a1a1a]">
                      {money(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-[240px]">
                <div className="mb-2 flex items-baseline justify-between gap-4 text-[13px]">
                  <span className="font-bold text-[#555]">المطلوب:</span>
                  <span className="whitespace-nowrap font-bold text-[#111]">
                    {money(invoice.total)}
                  </span>
                </div>
                {invoice.discount > 0 && (
                  <div className="mb-2 flex items-baseline justify-between gap-4 text-[13px]">
                    <span className="font-bold text-[#555]">الخصم:</span>
                    <span className="whitespace-nowrap font-bold text-[#111]">
                      {money(invoice.discount)}
                    </span>
                  </div>
                )}
                <div className="mb-2 flex items-baseline justify-between gap-4 text-[13px]">
                  <span className="font-bold text-[#555]">المدفوع:</span>
                  <span className="whitespace-nowrap font-bold text-[#111]">
                    {money(invoice.paid)}
                  </span>
                </div>
                <hr className="my-1.5 mb-2.5 border-0 border-t-[1.5px] border-[#222]" />
                <div className="flex items-baseline justify-between gap-4 text-[16px] font-bold">
                  <span className="text-[#111]">المتبقي:</span>
                  <span className="whitespace-nowrap text-[17px] text-[#b85d19]">
                    {money(invoice.remaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #public-invoice-sheet,
          #public-invoice-sheet * { visibility: visible !important; }
          #public-invoice-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

function PrinterIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"
      />
      <path d="M6 14h12v7H6v-7Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="18" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
