"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
  InventoryValuation,
  StockListSummary,
  StockStatusFilter,
} from "@/app/modules/inventory/types/inventory.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Badge } from "@/app/modules/shared/components/badge";

interface InventoryKpiCardsProps {
  valuation: InventoryValuation | null;
  summary: StockListSummary;
  onSelectStatusFilter?: (status: StockStatusFilter) => void;
}

export function InventoryKpiCards({
  valuation,
  summary,
  onSelectStatusFilter,
}: InventoryKpiCardsProps) {
  const t = useTranslations("inventory");
  const locale = useLocale();

  const totalCost = valuation?.totalValuationAtCost ?? 0;
  const totalSelling = valuation?.totalValuationAtSellingPrice ?? 0;
  const potentialProfit = valuation?.potentialProfit ?? (totalSelling - totalCost);
  const profitMargin =
    totalSelling > 0 ? ((potentialProfit / totalSelling) * 100).toFixed(1) : "0";

  const attentionCount =
    summary.lowStockCount + summary.outOfStockCount + summary.negativeStockCount;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Valuation at Cost */}
      <SurfaceCard padding="none" className="flex flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiValuationAtCost")}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/12 text-warning">
              <BoxIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-text-primary">
              {formatMoney(totalCost, locale)}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center border-t border-border/40 pt-3 min-h-8">
          <span className="text-sm text-text-muted">
            {t("kpiCostHint")}
          </span>
        </div>
      </SurfaceCard>

      {/* Card 2: Expected Revenue at Selling Price */}
      <SurfaceCard padding="none" className="flex flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiValuationAtSelling")}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/12 text-info">
              <TrendingUpIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-text-primary">
              {formatMoney(totalSelling, locale)}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center border-t border-border/40 pt-3 min-h-8">
          <span className="text-sm text-text-muted">
            {t("kpiSellingHint")}
          </span>
        </div>
      </SurfaceCard>

      {/* Card 3: Potential Profit & Margin */}
      <SurfaceCard padding="none" className="flex flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiPotentialProfit")}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
              <PercentIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-success">
              {formatMoney(potentialProfit, locale)}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center border-t border-border/40 pt-1.5 min-h-[22px]">
          <Badge variant="success" className="!text-sm font-medium">
            {t("kpiProfitMargin", { percent: profitMargin })}
          </Badge>
        </div>
      </SurfaceCard>

      {/* Card 4: Stock Alerts */}
      <SurfaceCard padding="none" className="flex flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiStockAlerts")}
            </span>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                summary.negativeStockCount > 0
                  ? "bg-danger/12 text-danger"
                  : attentionCount > 0
                    ? "bg-warning/12 text-warning"
                    : "bg-success/12 text-success"
              }`}
            >
              {attentionCount > 0 ? (
                <AlertTriangleIcon className="h-4 w-4" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold tracking-tight tabular-nums ${
                summary.negativeStockCount > 0
                  ? "text-danger"
                  : attentionCount > 0
                    ? "text-warning"
                    : "text-text-primary"
              }`}
            >
              {attentionCount}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("kpiAttentionHint")}
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 min-h-8">
          {summary.lowStockCount > 0 && (
            <button
              type="button"
              onClick={() => onSelectStatusFilter?.("low_stock")}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-warning/12 border border-warning/20 px-2.5 py-0.5 text-sm font-medium text-warning hover:bg-warning/20 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              <span>{summary.lowStockCount} {t("badgeLowStock")}</span>
            </button>
          )}
          {summary.outOfStockCount > 0 && (
            <button
              type="button"
              onClick={() => onSelectStatusFilter?.("out_of_stock")}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-danger/12 border border-danger/20 px-2.5 py-0.5 text-sm font-medium text-danger hover:bg-danger/20 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              <span>{summary.outOfStockCount} {t("badgeOutOfStock")}</span>
            </button>
          )}
          {summary.negativeStockCount > 0 && (
            <button
              type="button"
              onClick={() => onSelectStatusFilter?.("negative_stock")}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-danger/12 border border-danger/20 px-2.5 py-0.5 text-sm font-semibold text-danger hover:bg-danger/20 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              <span>{summary.negativeStockCount} {t("badgeNegativeStock")}</span>
            </button>
          )}
          {attentionCount === 0 && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {t("kpiHealthyHint")}
            </span>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}

function BoxIcon({ className }: { className?: string }) {
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
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function PercentIcon({ className }: { className?: string }) {
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
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
