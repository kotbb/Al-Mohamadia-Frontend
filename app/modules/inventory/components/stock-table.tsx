"use client";

import { useLocale, useTranslations } from "next-intl";
import { isCubicPricingMode, type StockItem } from "@/app/modules/inventory/types/inventory.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
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
  const tShared = useTranslations("shared");
  const locale = useLocale();

  const formatQuantity = (qty: number, isCubic: boolean) => {
    return qty.toLocaleString("en-US", {
      minimumFractionDigits: isCubic ? 3 : 0,
      maximumFractionDigits: isCubic ? 3 : 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-shell border border-border bg-surface">
        <table className="w-full min-w-[48rem] border-collapse text-sm lg:text-base">
          <thead className="bg-surface-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-start font-medium text-text-secondary">
                {t("colItem")}
              </th>
              <th className="px-3 py-3 text-center font-medium text-text-secondary">
                {t("colPricingMode")}
              </th>
              <th className="px-3 py-3 text-center font-medium text-text-secondary">
                {t("colStockAndThreshold")}
              </th>
              <th className="px-3 py-3 text-center font-medium text-text-secondary">
                {t("colStatus")}
              </th>
              <th className="px-3 py-3 text-end font-medium text-text-secondary">
                {t("colCostPrice")}
              </th>
              <th className="px-3 py-3 text-end font-medium text-text-secondary">
                {t("colValuation")}
              </th>
              <th className="w-40 px-4 py-3 text-center font-medium text-text-secondary">
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-secondary">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>{t("loading")}</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="mx-auto max-w-sm space-y-1">
                    <p className="font-semibold text-text-primary">
                      {t("emptyStockTitle")}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t("emptyStockDesc")}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isCubic = isCubicPricingMode(item.pricingMode);
                const unitLabel = isCubic ? t("unitCubicMeter") : t("unitPiece");

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border transition-colors hover:bg-surface-muted/50"
                  >
                    {/* Item info - Code removed beside name */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-text-primary block">
                          {item.name}
                        </span>
                        {item.category && (
                          <div className="text-xs text-text-muted">
                            {item.category.name}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="px-3 py-3.5 text-center text-xs font-semibold text-text-secondary">
                      {unitLabel}
                    </td>

                    {/* Stock / Threshold */}
                    <td className="px-3 py-3.5 text-center tabular-nums">
                      <div
                        className={`font-bold ${
                          item.isNegativeStock || item.isOutOfStock
                            ? "text-danger"
                            : "text-text-primary"
                        }`}
                      >
                        {formatQuantity(item.stockQuantity, isCubic)}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        / {formatQuantity(item.reorderThreshold ?? 0, isCubic)}
                      </div>
                    </td>

                    {/* Status using Badge with differentiated severity */}
                    <td className="px-3 py-3.5 text-center">
                      {item.isNegativeStock ? (
                        <Badge variant="danger" className="font-semibold">
                          {t("badgeNegativeStock")}
                        </Badge>
                      ) : item.isOutOfStock ? (
                        <Badge variant="danger">
                          {t("badgeOutOfStock")}
                        </Badge>
                      ) : item.isLowStock ? (
                        <Badge variant="warning">{t("badgeLowStock")}</Badge>
                      ) : (
                        <Badge variant="success">{t("badgeNormal")}</Badge>
                      )}
                    </td>

                    {/* Cost / Selling */}
                    <td className="px-3 py-3.5 text-end tabular-nums text-xs">
                      <div className="font-semibold text-text-primary">
                        {formatMoney(item.unitPrice, locale)} {t("currency")}
                      </div>
                      <div className="text-text-muted">
                        {formatMoney(item.cost, locale)} {t("currency")}
                      </div>
                    </td>

                    {/* Valuation */}
                    <td className="px-3 py-3.5 text-end tabular-nums font-bold text-text-primary">
                      {formatMoney(item.valuationAtCost, locale)} {t("currency")}
                    </td>

                    {/* Actions - Direct Adjust Stock button + RowActionsMenu without icons & without Adjust Stock */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(item)}
                          className="ds-focus-ring rounded-lg px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          {t("actionAdjustStock")}
                        </button>

                        <RowActionsMenu
                          label={t("colActions")}
                          items={[
                            {
                              id: "threshold",
                              label: t("actionUpdateThreshold"),
                              onSelect: () => onUpdateThreshold(item),
                            },
                            {
                              id: "adjustments",
                              label: t("actionViewAdjustments"),
                              onSelect: () => onViewAdjustmentsForItem(item),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

          <span className="text-sm">
            {t("pageOf", { page, totalPages })}
          </span>

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
