"use client";

import { useLocale, useTranslations } from "next-intl";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { DashboardResponse } from "../types/dashboard.types";

export function DashboardPeriodFinancials({ financials }: { financials: DashboardResponse["periodFinancials"] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label={t("periodFinancialsTitle")}>
    {([
      ["periodSales", financials.sales],
      ["periodGrossProfit", financials.estimatedGrossProfit],
      ["periodNetProfit", financials.estimatedNetProfit],
    ] as const).map(([key, value]) => <SurfaceCard key={key} padding="none" className="p-4">
      <p className="text-sm font-medium text-text-secondary">{t(key)}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${value < 0 ? "text-danger" : "text-text-primary"}`}>{formatMoney(value, locale)} <span className="text-xs text-text-muted">{t("currency")}</span></p>
    </SurfaceCard>)}
  </div>;
}
