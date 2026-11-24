"use client";

import { useLocale, useTranslations } from "next-intl";
import type { DashboardDebt, DashboardToday } from "@/app/modules/dashboard/types/dashboard.types";
import { DashboardDebtKpi } from "@/app/modules/dashboard/components/dashboard-debt-kpi";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface DashboardTodayKpisProps {
  today: DashboardToday;
  debt: DashboardDebt;
}

export function DashboardTodayKpis({ today, debt }: DashboardTodayKpisProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const metrics = [
    {
      label: t("kpiSales"),
      value: formatMoney(today.sales, locale),
      unit: t("currency"),
      hint: t("kpiSalesHint"),
      tone: "text-text-primary",
    },
    {
      label: t("kpiEstimatedProfit"),
      value: formatMoney(today.estimatedProfit, locale),
      unit: t("currency"),
      hint: t("kpiProfitHelper"),
      tone: today.estimatedProfit < 0 ? "text-danger" : "text-success",
    },
    {
      label: t("kpiInvoiceCount"),
      value: today.invoiceCount,
      unit: t("kpiInvoiceCountUnit"),
      hint: t("kpiInvoiceCountHint"),
      tone: "text-text-primary",
    },
    {
      label: t("kpiCollected"),
      value: formatMoney(today.collected, locale),
      unit: t("currency"),
      hint: t("kpiCollectedHint"),
      tone: "text-text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map(({ label, value, unit, hint, tone }) => (
        <SurfaceCard key={label} padding="none" className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
          <dl>
            <dt className="flex min-h-9 items-center text-base font-medium text-text-secondary">{label}</dt>
            <dd className={`mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 ${tone}`}>
              <bdi className="min-w-0 break-words text-2xl font-bold tracking-tight tabular-nums">{value}</bdi>
              <span className="text-sm font-medium text-text-muted">{unit}</span>
            </dd>
          </dl>
          <p className="mt-4 flex min-h-8 items-center border-t border-border/40 pt-3 text-sm text-text-muted">
            {hint}
          </p>
        </SurfaceCard>
      ))}
      <DashboardDebtKpi debt={debt} />
    </div>
  );
}
