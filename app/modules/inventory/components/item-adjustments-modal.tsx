"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  StockAdjustment,
  StockItem,
} from "@/app/modules/inventory/types/inventory.types";
import { isCubicPricingMode } from "@/app/modules/inventory/types/inventory.types";
import { getStockAdjustments } from "@/app/modules/inventory/services/inventory.service";
import { formatInvoiceDate, todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import { Badge } from "@/app/modules/shared/components/badge";
import { Button } from "@/app/modules/shared/components/button";
import type { SalesInvoicePeriod } from "@/app/modules/invoices/types/invoices.types";

interface ItemAdjustmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StockItem | null;
}

type PeriodOption = "off" | "day" | "week" | "month" | "year";

export function ItemAdjustmentsModal({
  isOpen,
  onClose,
  item,
}: ItemAdjustmentsModalProps) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  const locale = useLocale();

  const [periodFilter, setPeriodFilter] = useState<PeriodOption>("off");
  const [periodDate, setPeriodDate] = useState<string>(todayIsoDate());
  const [page, setPage] = useState(1);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdjustments = useCallback(async () => {
    if (!item) return;
    setIsLoading(true);
    try {
      const res = await getStockAdjustments({
        itemId: item.id,
        period:
          periodFilter !== "off"
            ? (periodFilter.toUpperCase() as "DAY" | "WEEK" | "MONTH" | "YEAR")
            : undefined,
        date: periodFilter !== "off" ? periodDate : undefined,
        page,
        limit: 10,
      });
      setAdjustments(res.items);
      const total = res.meta?.total ?? 0;
      const limit = res.meta?.limit ?? 10;
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch {
      setAdjustments([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [item, periodFilter, periodDate, page]);

  useEffect(() => {
    if (isOpen && item) {
      void fetchAdjustments();
    }
  }, [isOpen, item, fetchAdjustments]);

  // Reset page when period filter changes
  const handlePeriodFilterChange = (newPeriod: PeriodOption) => {
    setPeriodFilter(newPeriod);
    setPage(1);
  };

  const handlePeriodDateChange = (newDate: string) => {
    setPeriodDate(newDate);
    setPage(1);
  };

  // Keyboard Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isCubic = isCubicPricingMode(item.pricingMode);
  const unitLabel = isCubic ? t("unitCubicMeter") : t("unitPiece");

  const periodOptions: { value: PeriodOption; label: string }[] = [
    { value: "off", label: t("filterPeriodOff") },
    { value: "day", label: t("filterPeriodDay") },
    { value: "week", label: t("filterPeriodWeek") },
    { value: "month", label: t("filterPeriodMonth") },
    { value: "year", label: t("filterPeriodYear") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClockHistoryIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  {t("modalItemAdjustmentsTitle")}
                </h2>
                <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
                  {item.name}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {t("currentStockLabel", { quantity: item.stockQuantity, unit: unitLabel })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("modalClose")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Date / Period Filter toolbar */}
        <div className="border-b border-border bg-surface-muted/30 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-auto">
              <SegmentedControl
                value={periodFilter}
                onChange={handlePeriodFilterChange}
                options={periodOptions}
              />
            </div>

            {periodFilter !== "off" && (
              <div className="w-full flex-1 sm:max-w-md">
                <PeriodDatePicker
                  period={periodFilter as SalesInvoicePeriod}
                  value={periodDate}
                  onChange={handlePeriodDateChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Table content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead className="bg-surface-muted">
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-start font-medium text-text-secondary text-xs">
                    {t("colDate")}
                  </th>
                  <th className="px-3 py-2.5 text-center font-medium text-text-secondary text-xs">
                    {t("colDifference")}
                  </th>
                  <th className="px-3 py-2.5 text-center font-medium text-text-secondary text-xs">
                    {t("colQuantityBeforeAfter")}
                  </th>
                  <th className="px-4 py-2.5 text-start font-medium text-text-secondary text-xs">
                    {t("colReason")}
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium text-text-secondary text-xs">
                    {t("colAdjuster")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-secondary">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm">{t("loading")}</span>
                      </div>
                    </td>
                  </tr>
                ) : adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-text-muted text-sm">
                      {t("noAdjustmentsForItem")}
                    </td>
                  </tr>
                ) : (
                  adjustments.map((adj) => {
                    const isPositive = adj.diffQuantity > 0;
                    const diffSign = isPositive ? "+" : "";
                    const badgeVariant = isPositive
                      ? "success"
                      : adj.diffQuantity < 0
                        ? "danger"
                        : "info";

                    return (
                      <tr
                        key={adj.id}
                        className="transition-colors hover:bg-surface-muted/50"
                      >
                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                          {formatInvoiceDate(adj.createdAt, locale)}
                        </td>

                        {/* Difference */}
                        <td className="px-3 py-3 text-center">
                          <Badge variant={badgeVariant} className="text-xs font-semibold">
                            {diffSign}
                            {adj.diffQuantity} {unitLabel}
                          </Badge>
                        </td>

                        {/* Before → After */}
                        <td className="px-3 py-3 text-center text-xs font-medium tabular-nums text-text-primary whitespace-nowrap">
                          <span>{adj.oldQuantity}</span>
                          <span className="mx-1 text-text-muted">→</span>
                          <span className="font-bold">{adj.newQuantity}</span>
                        </td>

                        {/* Reason */}
                        <td className="px-4 py-3 text-xs text-text-secondary max-w-xs truncate">
                          {adj.reason || "-"}
                        </td>

                        {/* Adjusted By */}
                        <td className="px-4 py-3 text-center text-xs text-text-secondary whitespace-nowrap">
                          {adj.adjuster?.username || adj.adjustedBy || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {tShared("prevPage")}
              </Button>
              <span className="text-xs text-text-secondary">
                {t("pageOf", { page, totalPages })}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                {tShared("nextPage")}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border px-5 py-3 sm:px-6 bg-surface-muted/20">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {t("modalClose")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClockHistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12L12 4M4 4l8 8" />
    </svg>
  );
}
