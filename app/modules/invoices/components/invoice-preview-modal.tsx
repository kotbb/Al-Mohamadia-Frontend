"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getItem } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";
import {
  downloadInvoicePdf,
  getSalesInvoice,
} from "@/app/modules/invoices/services/invoices.service";
import type { SalesInvoice } from "@/app/modules/invoices/types/invoices.types";
import { Button } from "@/app/modules/shared/components/button";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string | null;
  initialInvoice?: SalesInvoice | null;
  customerName?: string | null;
  autoPrint?: boolean;
}

function isCompleteInvoice(
  inv: SalesInvoice | null | undefined,
): inv is SalesInvoice {
  return Boolean(inv && Array.isArray(inv.lines));
}

export function InvoicePreviewModal({
  open,
  onClose,
  invoiceId,
  initialInvoice,
  customerName: initialCustomerName,
  autoPrint = false,
}: InvoicePreviewModalProps) {
  const t = useTranslations("invoices");
  const tShared = useTranslations("shared");

  const [invoice, setInvoice] = useState<SalesInvoice | null>(() =>
    isCompleteInvoice(initialInvoice) ? initialInvoice : null,
  );
  const [customerName, setCustomerName] = useState<string | null>(
    initialCustomerName ?? null,
  );
  const [itemsById, setItemsById] = useState<Record<string, Item>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const didAutoPrint = useRef(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setInvoice(null);
      setLoadError(null);
      setItemsById({});
      didAutoPrint.current = false;
      return;
    }

    if (!invoiceId) return;

    let cancelled = false;
    const controller = new AbortController();

    const currentId = invoiceId;
    async function loadData() {
      if (!currentId) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        let inv =
          isCompleteInvoice(initialInvoice) && initialInvoice.id === currentId
            ? initialInvoice
            : null;
        if (!inv) {
          inv = await getSalesInvoice(currentId, controller.signal);
        }
        if (cancelled) return;
        setInvoice(inv);

        // Fetch items metadata for labels & dimensions
        const uniqueItemIds = Array.from(
          new Set((inv.lines ?? []).map((l) => l.itemId)),
        );
        const fetchedItems = await Promise.all(
          uniqueItemIds.map(async (id) => {
            try {
              const itm = await getItem(id, controller.signal);
              return [id, itm] as const;
            } catch {
              return [id, null] as const;
            }
          }),
        );
        if (cancelled) return;
        const itemMap: Record<string, Item> = {};
        for (const [id, item] of fetchedItems) {
          if (item) itemMap[id] = item;
        }
        setItemsById(itemMap);
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Load failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
      controller.abort();
      didAutoPrint.current = false;
    };
  }, [open, invoiceId, initialInvoice]);

  useEffect(() => {
    if (initialCustomerName) {
      setCustomerName(initialCustomerName);
    }
  }, [initialCustomerName]);

  useEffect(() => {
    if (
      autoPrint &&
      !isLoading &&
      invoice &&
      Array.isArray(invoice.lines) &&
      !didAutoPrint.current
    ) {
      didAutoPrint.current = true;
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [autoPrint, isLoading, invoice]);

  if (!open) return null;

  async function handleDownloadPdf() {
    if (!invoice) return;
    setIsDownloading(true);
    try {
      await downloadInvoicePdf("printable-invoice-sheet", invoice.invoiceNumber);
    } catch {
      // Non-blocking: download failed silently
    } finally {
      setIsDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function formatDateYMD(value: string | undefined): string {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  function formatMoneyValue(value: number): string {
    const amount = value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    });
    return `${amount} ج.م`;
  }

  const hasDimensions = Boolean(
    invoice?.lines?.some(
      (l) => l.thickness != null || l.width != null || l.length != null,
    ),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="presentation"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm transition-opacity"
        aria-label={tShared("closeDialog")}
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        {/* Top Header Bar with Actions */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3.5">
          <div className="flex items-center gap-2">
            <PrinterIcon />
            <h2
              id="preview-title"
              className="text-base sm:text-lg font-bold text-text-primary"
            >
              {t("previewTitle")}
            </h2>
            {invoice?.invoiceNumber && (
              <span
                dir="ltr"
                className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs font-semibold text-text-secondary"
              >
                #{invoice.invoiceNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              disabled={isLoading || !invoice || !invoice.lines}
              className="gap-1.5"
            >
              <PrinterIcon />
              <span>{t("print")}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleDownloadPdf()}
              disabled={isLoading || isDownloading || !invoice || !invoice.lines}
              className="gap-1.5"
            >
              <DownloadIcon />
              <span>{isDownloading ? t("saving") : t("downloadPdf")}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              {t("modalCancel")}
            </Button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          {isLoading || (!invoice && !loadError) || (invoice && !invoice.lines && !loadError) ? (
            <div className="py-16">
              <LoadingState message={tShared("loading")} />
            </div>
          ) : loadError || !invoice || !invoice.lines ? (
            <div className="p-8 text-center text-sm text-danger">
              {loadError ?? t("detailError")}
            </div>
          ) : (
            /* The Printable A4 Sheet matching the PDF exactly */
            <div
              ref={printAreaRef}
              id="printable-invoice-sheet"
              className="mx-auto w-full max-w-[210mm] min-h-[297mm] rounded-sm bg-white p-[16mm] shadow-xl text-[#1a1a1a] print:m-0 print:w-full print:max-w-none print:min-h-0 print:border-none print:p-[16mm] print:shadow-none"
              dir="rtl"
              style={{
                fontFamily:
                  "var(--font-noto-sans-arabic), var(--font-noto-sans), 'Noto Sans Arabic', 'Noto Sans', sans-serif",
              }}
            >
              {/* Header: Invoice # & Date (right in RTL), Brand Mark & Name (left in RTL) */}
              <div className="flex items-center justify-between gap-4 mb-5">
                {/* Header Invoice (right) */}
                <div className="text-right">
                  <div className="text-xl font-bold text-[#b85d19] leading-tight">
                    فاتورة #{invoice.invoiceNumber}
                  </div>
                  <div className="mt-1 text-xs text-[#666]">
                    {formatDateYMD(invoice.createdAt)}
                  </div>
                </div>

                {/* Header Brand */}
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

              {/* Thick Rule */}
              <hr className="border-0 border-t-2 border-[#222] mb-3.5" />

              {/* Customer Row */}
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="font-bold text-[#444]">العميل:</span>
                <span className="font-bold text-[#111]">
                  {invoice.type === "cash_sale"
                    ? "نقدي"
                    : customerName || "نقدي"}
                </span>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse table-fixed mb-5 text-xs">
                <thead>
                  <tr className="border-b-[1.5px] border-[#222] text-[#333]">
                    <th className="py-2 px-1.5 text-right font-bold text-[13px]">
                      الصنف
                    </th>
                    {hasDimensions && (
                      <>
                        <th className="w-[10%] py-2 px-1.5 text-center font-bold text-[13px]">
                          التخانة
                        </th>
                        <th className="w-[10%] py-2 px-1.5 text-center font-bold text-[13px]">
                          العرض
                        </th>
                        <th className="w-[10%] py-2 px-1.5 text-center font-bold text-[13px]">
                          الطول
                        </th>
                      </>
                    )}
                    <th className="w-[11%] py-2 px-1.5 text-center font-bold text-[13px]">
                      العدد
                    </th>
                    <th className="w-[15%] py-2 px-1.5 text-center font-bold text-[13px]">
                      سعر الوحدة
                    </th>
                    <th className="w-[16%] py-2 px-1.5 text-center font-bold text-[13px]">
                      الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line, idx) => {
                    const item = itemsById[line.itemId];
                    const itemLabel = item ? item.name : `صنف #${idx + 1}`;

                    return (
                      <tr
                        key={`${line.itemId}-${idx}`}
                        className="border-b border-[#e0e0e0] text-[12px]"
                      >
                        <td className="py-2.5 px-1.5 text-right align-top">
                          <div className="font-bold text-[#111] text-[13px]">
                            {itemLabel}
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
                              {line.thickness != null ? line.thickness : "-"}
                            </td>
                            <td className="py-2.5 px-1.5 text-center align-top text-[#1a1a1a]">
                              {line.width != null ? line.width : "-"}
                            </td>
                            <td className="py-2.5 px-1.5 text-center align-top text-[#1a1a1a]">
                              {line.length != null ? line.length : "-"}
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-1.5 text-center align-top font-bold text-[#1a1a1a]">
                          {line.quantity}
                        </td>
                        <td className="py-2.5 px-1.5 text-center align-top whitespace-nowrap text-[#1a1a1a]">
                          {formatMoneyValue(line.piecePrice)}
                        </td>
                        <td className="py-2.5 px-1.5 text-center align-top whitespace-nowrap font-bold text-[#1a1a1a]">
                          {formatMoneyValue(line.lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="mt-4 flex justify-end">
                <div className="w-[240px]">
                  <div className="flex justify-between items-baseline gap-4 text-[13px] mb-2">
                    <span className="font-bold text-[#555]">المطلوب:</span>
                    <span className="font-bold text-[#111] whitespace-nowrap">
                      {formatMoneyValue(invoice.total)}
                    </span>
                  </div>

                  {invoice.discount > 0 && (
                    <div className="flex justify-between items-baseline gap-4 text-[13px] mb-2">
                      <span className="font-bold text-[#555]">الخصم:</span>
                      <span className="font-bold text-[#111] whitespace-nowrap">
                        {formatMoneyValue(invoice.discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline gap-4 text-[13px] mb-2">
                    <span className="font-bold text-[#555]">المدفوع:</span>
                    <span className="font-bold text-[#111] whitespace-nowrap">
                      {formatMoneyValue(invoice.paid)}
                    </span>
                  </div>

                  <hr className="border-0 border-t-[1.5px] border-[#222] my-1.5 mb-2.5" />

                  <div className="flex justify-between items-baseline gap-4 text-[16px] font-bold mb-0">
                    <span className="text-[#111]">المتبقي:</span>
                    <span className="text-[#b85d19] text-[17px] whitespace-nowrap">
                      {formatMoneyValue(invoice.remaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner if cancelled */}
              {invoice.status === "cancelled" && (
                <div className="mt-6 rounded-md bg-[#fee2e2] p-2 text-center text-[15px] font-bold text-[#b91c1c]">
                  فاتورة ملغاة
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Print Media Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-sheet,
          #printable-invoice-sheet * {
            visibility: visible !important;
          }
          #printable-invoice-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
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
