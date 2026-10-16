"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  isCubicPricingMode,
  type StockItem,
} from "@/app/modules/inventory/types/inventory.types";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { Badge } from "@/app/modules/shared/components/badge";
import { RowActionsMenu } from "@/app/modules/shared/components/row-actions-menu";
import { Button } from "@/app/modules/shared/components/button";

interface StockTableProps {
  items: StockItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAdjustStock: (item: StockItem) => void;
  onUpdateThreshold: (item: StockItem) => void;
  onViewAdjustmentsForItem: (item: StockItem) => void;
}

export function StockTable({
  items,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onAdjustStock,
  onUpdateThreshold,
  onViewAdjustmentsForItem,
}: StockTableProps) {
  const t = useTranslations("inventory");
  const tAudit = useTranslations("audit");
  const tShared = useTranslations("shared");
  const locale = useLocale();

  // Collapsed categories state (set of categoryIds that are currently collapsed)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    () => new Set(),
  );

  const formatQuantity = (qty: number, isCubic: boolean) => {
    return qty.toLocaleString("en-US", {
      minimumFractionDigits: isCubic ? 3 : 0,
      maximumFractionDigits: isCubic ? 3 : 0,
    });
  };

  // Group items by category (preserves alphabetical category order)
  const groups = useMemo(() => {
    const collator = new Intl.Collator(locale, {
      sensitivity: "base",
      numeric: true,
    });
    const map = new Map<
      string,
      { categoryId: string; categoryName: string; items: StockItem[] }
    >();

    for (const item of items) {
      const catId = item.category?.id ?? "uncategorized";
      const catName = item.category?.name ?? t("uncategorized");
      if (!map.has(catId)) {
        map.set(catId, { categoryId: catId, categoryName: catName, items: [] });
      }
      map.get(catId)!.items.push(item);
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.categoryId === "uncategorized") return 1;
      if (b.categoryId === "uncategorized") return -1;
      return collator.compare(a.categoryName, b.categoryName);
    });
  }, [items, locale, t]);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const allCollapsed =
    groups.length > 0 &&
    groups.every((g) => collapsedCategories.has(g.categoryId));

  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsedCategories(new Set());
    } else {
      setCollapsedCategories(new Set(groups.map((g) => g.categoryId)));
    }
  };

  return (
    <div className="space-y-3">
      {/* Category count & Collapse/Expand all toggle */}
      {!isLoading && groups.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm text-text-secondary">
          <span className="font-medium text-xs sm:text-sm">
            {t("categoryCount", { count: groups.length })}
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="ds-focus-ring min-h-11 cursor-pointer rounded-lg px-2 text-sm font-semibold text-primary hover:underline"
          >
            {allCollapsed ? t("expandAll") : t("collapseAll")}
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="rounded-shell border border-border bg-surface p-12 text-center text-text-secondary">
          <div className="inline-flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{t("loading")}</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-shell border border-border bg-surface p-16 text-center">
          <div className="mx-auto max-w-sm space-y-1">
            <p className="font-semibold text-text-primary">
              {t("emptyStockTitle")}
            </p>
            <p className="text-xs text-text-secondary">{t("emptyStockDesc")}</p>
          </div>
        </div>
      ) : (
        /* Separate Category Cards with space between them */
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const isCollapsed = collapsedCategories.has(group.categoryId);

            return (
              <div
                key={group.categoryId}
                className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
              >
                {/* Category Header Button (Click to collapse / expand) */}
                <button
                  type="button"
                  onClick={() => toggleCategory(group.categoryId)}
                  className="ds-focus-ring flex min-h-12 w-full items-center justify-between gap-3 bg-surface-muted px-3 py-2 text-start transition-colors hover:bg-surface-muted/80"
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex items-center gap-2.5">
                    <ChevronDownIcon
                      className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90 rtl:rotate-90" : "rotate-0"
                      }`}
                    />
                    <span
                      className="h-4 w-1 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-text-primary">
                      {group.categoryName}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {group.items.length}
                    </span>
                    {isCollapsed && (
                      <span className="text-xs font-medium text-text-muted">
                        {t("clickToExpand")}
                      </span>
                    )}
                  </div>
                </button>

                {/* Collapsible Table of Items */}
                {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-border">
                    <table className="w-full min-w-[56rem] table-fixed border-collapse text-sm lg:text-base">
                      <colgroup>
                        <col className="w-[23%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                        <col className="w-[12%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                        <col className="w-[17%]" />
                        <col className="w-[8%]" />
                      </colgroup>
                      <thead className="bg-surface">
                        <tr className="border-b border-border">
                          <th className="px-3 py-2 text-start font-medium text-text-secondary">
                            {t("colItem")}
                          </th>
                          <th className="px-3 py-2 text-end font-medium text-text-secondary">
                            {t("colStock")}
                          </th>
                          <th className="px-3 py-2 text-end font-medium text-text-secondary">
                            {t("colMinStock")}
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-text-secondary">
                            {t("colStatus")}
                          </th>
                          <th className="px-3 py-2 text-end font-medium text-text-secondary">
                            {t("colCost")}
                          </th>
                          <th className="px-3 py-2 text-end font-medium text-text-secondary">
                            {t("colSelling")}
                          </th>
                          <th className="px-3 py-2 text-end font-medium text-text-secondary">
                            {t("colValuation")}
                          </th>
                          <th className="w-16 px-3 py-2 text-center font-medium text-text-secondary">
                            {t("colActions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {group.items.map((item) => {
                          const isCubic = isCubicPricingMode(item.pricingMode);
                          const unitLabel = isCubic
                            ? t("unitCubicMeter")
                            : t("unitPiece");

                          return (
                            <tr
                              key={item.id}
                              className="transition-colors hover:bg-surface-muted/40"
                            >
                              {/* Item Name */}
                              <td className="break-words px-3 py-1 text-start">
                                <span className="font-semibold text-text-primary">
                                  {item.name}
                                </span>
                              </td>

                              {/* Current Stock */}
                              <td className="whitespace-nowrap px-3 py-1 text-end tabular-nums">
                                <span
                                  className={
                                    item.isNegativeStock || item.isOutOfStock
                                      ? "font-semibold text-danger"
                                      : item.isLowStock
                                        ? "font-semibold text-warning"
                                        : "font-semibold text-text-primary"
                                  }
                                >
                                  {formatQuantity(item.stockQuantity, isCubic)}
                                </span>
                                <span className="ms-1 text-xs font-medium text-text-muted">
                                  {unitLabel}
                                </span>
                              </td>

                              {/* Min Stock (Reorder Threshold) */}
                              <td className="whitespace-nowrap px-3 py-1 text-end tabular-nums text-text-secondary">
                                <span>
                                  {formatQuantity(
                                    item.reorderThreshold ?? 0,
                                    isCubic,
                                  )}
                                </span>
                                <span className="ms-1 text-xs text-text-muted">
                                  {unitLabel}
                                </span>
                              </td>

                              {/* Status Badge */}
                              <td className="px-3 py-1 text-center">
                                {item.isNegativeStock ? (
                                  <Badge variant="danger" className="lg:text-sm">
                                    {t("badgeNegativeStock")}
                                  </Badge>
                                ) : item.isOutOfStock ? (
                                  <Badge variant="danger" className="lg:text-sm">
                                    {t("badgeOutOfStock")}
                                  </Badge>
                                ) : item.isLowStock ? (
                                  <Badge variant="warning" className="lg:text-sm">
                                    {t("badgeLowStock")}
                                  </Badge>
                                ) : (
                                  <Badge variant="success" className="lg:text-sm">
                                    {t("badgeNormal")}
                                  </Badge>
                                )}
                              </td>

                              {/* Cost */}
                              <td className="whitespace-nowrap px-3 py-1 text-end tabular-nums text-text-secondary">
                                {formatMoney(item.cost, locale)} {t("currency")}
                              </td>

                              {/* Selling Price */}
                              <td className="whitespace-nowrap px-3 py-1 text-end tabular-nums font-medium text-text-primary">
                                {formatMoney(item.unitPrice, locale)}{" "}
                                {t("currency")}
                              </td>

                              {/* Valuation */}
                              <td className="whitespace-nowrap px-3 py-1 text-end tabular-nums font-medium text-text-primary">
                                {formatMoney(item.valuationAtCost, locale)}{" "}
                                {t("currency")}
                              </td>

                              {/* Actions (3-dots menu containing Adjust Stock, Threshold, History) */}
                              <td className="px-3 py-1 text-center">
                                <RowActionsMenu
                                  size="default"
                                  label={t("colActions")}
                                  items={[
                                    {
                                      id: "adjust",
                                      label: t("actionAdjustStock"),
                                      onSelect: () => onAdjustStock(item),
                                    },
                                    {
                                      id: "threshold",
                                      label: t("actionUpdateThreshold"),
                                      onSelect: () => onUpdateThreshold(item),
                                    },
                                    {
                                      id: "history",
                                      label: tAudit("viewHistory"),
                                      onSelect: () =>
                                        onViewAdjustmentsForItem(item),
                                    },
                                  ]}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-sm text-text-secondary">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            {tShared("prevPage")}
          </Button>

          <span className="text-sm">{t("pageOf", { page, totalPages })}</span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            {tShared("nextPage")}
          </Button>
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
