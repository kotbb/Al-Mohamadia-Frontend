"use client";
import { PublicInvoiceSheet } from "../components/public-invoice-sheet";
import { InvoicePrintGuidance } from "../components/invoice-print-guidance";
import { Button } from "@/app/modules/shared/components/button";
import { usePublicInvoice } from "../hooks/use-public-invoice";

import { useRef } from "react";
import Image from "next/image";

interface PublicInvoicePageClientProps {
  token: string;
  showPrices?: boolean;
  printGuidanceTitle: string;
  printGuidanceMessage: string;
}

export function PublicInvoicePageClient({
  token,
  showPrices = true,
  printGuidanceTitle,
  printGuidanceMessage,
}: PublicInvoicePageClientProps) {
  const { invoice, isLoading, error, isDownloading, handleDownload } =
    usePublicInvoice(token);
  const printAreaRef = useRef<HTMLDivElement>(null);

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
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.print()}
            disabled={isLoading || !invoice}
            className="text-sm"
          >
            <PrinterIcon />
            طباعة
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => void handleDownload()}
            disabled={isLoading || !invoice || isDownloading}
            className="text-sm"
          >
            <DownloadIcon />
            {isDownloading ? "جارٍ التحميل…" : "تحميل PDF"}
          </Button>
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
          <>
            <InvoicePrintGuidance title={printGuidanceTitle} message={printGuidanceMessage} className="mb-4" />
            <PublicInvoiceSheet invoice={invoice} showPrices={showPrices} printAreaRef={printAreaRef} />
          </>
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
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M6 14h12v7H6v-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
