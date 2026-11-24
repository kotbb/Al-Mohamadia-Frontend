"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
  InventoryValuation,
  StockListSummary,
  StockStatusFilter,
} from "@/app/modules/inventory/types/inventory.types";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { Badge } from "@/app/modules/shared/components/badge";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface InventoryKpiCardsProps {
  valuation: InventoryValuation | null;
  summary: StockListSummary;
  onSelectStatusFilter?: (status: StockStatusFilter) => void;
}

export function InventoryKpiCards({ valuation, summary, onSelectStatusFilter }: InventoryKpiCardsProps) {
  const t = useTranslations("inventory");
  const locale = useLocale();

  const totalCost = valuation?.totalValuationAtCost ?? 0;
  const totalSelling = valuation?.totalValuationAtSellingPrice ?? 0;
  const potentialProfit = valuation?.potentialProfit ?? totalSelling - totalCost;
  const profitMargin = totalSelling > 0 ? ((potentialProfit / totalSelling) * 100).toFixed(1) : "0";

  const attentionCount = summary.lowStockCount + summary.outOfStockCount;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Valuation at Cost */}
      <SurfaceCard padding="none" className="min-w-0 p-4 lg:min-h-36">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text-secondary">{t("kpiValuationAtCost")}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <span className="min-w-0 break-words text-xl font-semibold tabular-nums text-text-primary">
            {formatMoney(totalCost, locale)}
          </span>
          <span className="text-sm text-text-muted">{t("currency")}</span>
        </div>
      </SurfaceCard>

      {/* Card 2: Expected Revenue at Selling Price */}
      <SurfaceCard padding="none" className="min-w-0 p-4 lg:min-h-36">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text-secondary">{t("kpiValuationAtSelling")}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <span className="min-w-0 break-words text-xl font-semibold tabular-nums text-text-primary">
            {formatMoney(totalSelling, locale)}
          </span>
          <span className="text-sm text-text-muted">{t("currency")}</span>
        </div>
      </SurfaceCard>

      {/* Card 3: Potential Profit & Margin */}
      <SurfaceCard padding="none" className="min-w-0 p-4 lg:min-h-36">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text-secondary">{t("kpiPotentialProfit")}</span>
        </div>
        <div className="mt-1.5 flex flex-col items-start gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`min-w-0 break-words text-xl font-semibold tabular-nums ${potentialProfit < 0 ? "text-danger" : potentialProfit > 0 ? "text-success" : "text-text-primary"}`}
            >
              {formatMoney(potentialProfit, locale)}
            </span>
            <span className="text-sm text-text-muted">{t("currency")}</span>
          </div>
          <Badge variant="success" className="!text-xs !py-0.5 !px-2 font-medium">
            {t("kpiProfitMargin", { percent: profitMargin })}
          </Badge>
        </div>
      </SurfaceCard>

      {/* Card 4: Stock Alerts */}
      <SurfaceCard padding="none" className="min-w-0 p-4 lg:min-h-36">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text-secondary">{t("kpiStockAlerts")}</span>
        </div>
        <div className="mt-1.5 flex flex-col items-start gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`min-w-0 break-words text-xl font-semibold tabular-nums ${
                summary.outOfStockCount > 0 ? "text-danger" : attentionCount > 0 ? "text-warning" : "text-text-primary"
              }`}
            >
              {attentionCount}
            </span>
            <span className="text-sm text-text-muted">{t("kpiAttentionHint")}</span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-1">
            {summary.lowStockCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectStatusFilter?.("low_stock")}
                className="ds-focus-ring min-h-11 cursor-pointer inline-flex items-center gap-1 rounded-lg bg-warning/12 border border-warning/20 px-2 py-0.5 text-xs font-medium text-warning hover:bg-warning/20 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                <span>
                  {summary.lowStockCount} {t("badgeLowStock")}
                </span>
              </button>
            )}
            {summary.outOfStockCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectStatusFilter?.("out_of_stock")}
                className="ds-focus-ring min-h-11 cursor-pointer inline-flex items-center gap-1 rounded-lg bg-danger/12 border border-danger/20 px-2 py-0.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                <span>
                  {summary.outOfStockCount} {t("badgeOutOfStock")}
                </span>
              </button>
            )}
            {attentionCount === 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {t("kpiHealthyHint")}
              </span>
            )}
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
