"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CategoryValuation } from "@/app/modules/inventory/types/inventory.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";

interface CategoryValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryValuation[];
}

export function CategoryValuationModal({
  isOpen,
  onClose,
  categories,
}: CategoryValuationModalProps) {
  const t = useTranslations("inventory");
  const locale = useLocale();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {t("modalCategoryValuationTitle")}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("modalClose")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/80 text-xs font-semibold text-text-secondary">
                <th className="py-3 px-3 text-start">{t("colCategory")}</th>
                <th className="py-3 px-3 text-center">{t("colItemsCount")}</th>
                <th className="py-3 px-3 text-end">{t("colValuationCost")}</th>
                <th className="py-3 px-3 text-end">{t("colValuationSelling")}</th>
                <th className="py-3 px-3 text-end">{t("colPotentialProfit")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {categories.map((cat) => {
                const profit = cat.valuationAtSellingPrice - cat.valuationAtCost;
                return (
                  <tr key={cat.categoryId} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-text-primary">
                      {cat.categoryName}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums text-text-secondary">
                      {cat.itemsCount}
                    </td>
                    <td className="py-3 px-3 text-end tabular-nums text-text-primary">
                      {formatMoney(cat.valuationAtCost, locale)} {t("currency")}
                    </td>
                    <td className="py-3 px-3 text-end tabular-nums text-text-primary">
                      {formatMoney(cat.valuationAtSellingPrice, locale)} {t("currency")}
                    </td>
                    <td className="py-3 px-3 text-end tabular-nums font-semibold text-success">
                      {formatMoney(profit, locale)} {t("currency")}
                    </td>
                  </tr>
                );
              })}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-secondary">
                    {t("emptyStockTitle")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border px-6 py-3 bg-surface-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-muted transition-colors shadow-sm"
          >
            {t("modalClose")}
          </button>
        </div>
      </div>
    </div>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
