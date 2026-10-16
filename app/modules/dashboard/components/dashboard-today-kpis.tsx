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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SurfaceCard
        padding="none"
        className="flex flex-col justify-between p-5 sm:p-6"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiSales")}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
              <SalesIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-text-primary">
              {formatMoney(today.sales, locale)}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center border-t border-border/40 pt-3 min-h-8">
          <span className="text-sm text-text-muted">{t("kpiSalesHint")}</span>
        </div>
      </SurfaceCard>

      <SurfaceCard
        padding="none"
        className="flex flex-col justify-between p-5 sm:p-6"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiEstimatedProfit")}
            </span>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                today.estimatedProfit < 0
                  ? "bg-danger/12 text-danger"
                  : "bg-success/12 text-success"
              }`}
            >
              <ProfitIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold tracking-tight tabular-nums ${
                today.estimatedProfit < 0 ? "text-danger" : "text-success"
              }`}
            >
              {formatMoney(today.estimatedProfit, locale)}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center border-t border-border/40 pt-3 min-h-8">
          <span className="text-sm text-text-muted">
            {t("kpiProfitHelper")}
          </span>
        </div>
      </SurfaceCard>

      <SurfaceCard padding="none" className="flex flex-col justify-between p-5 sm:p-6">
        <span className="text-base font-medium text-text-secondary">{t("kpiNetProfit")}</span>
        <div className={`mt-3 text-2xl font-bold tabular-nums ${today.estimatedNetProfit < 0 ? "text-danger" : "text-success"}`}>{formatMoney(today.estimatedNetProfit, locale)} <span className="text-sm text-text-muted">{t("currency")}</span></div>
        <p className="mt-4 border-t border-border/40 pt-3 text-sm text-text-muted">{t("kpiNetHint")}</p>
      </SurfaceCard>

      <SurfaceCard
        padding="none"
        className="flex flex-col justify-between p-5 sm:p-6"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiInvoiceCount")}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/12 text-info">
              <InvoiceIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-text-primary">
              {today.invoiceCount}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("kpiInvoiceCountUnit")}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center border-t border-border/40 pt-3 min-h-8">
          <span className="text-sm text-text-muted">
            {t("kpiInvoiceCountHint")}
          </span>
        </div>
      </SurfaceCard>

      <SurfaceCard
        padding="none"
        className="flex flex-col justify-between p-5 sm:p-6"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-secondary">
              {t("kpiCollected")}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/12 text-warning">
              <CollectedIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-text-primary">
              {formatMoney(today.collected, locale)}
            </span>
            <span className="text-sm font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center border-t border-border/40 pt-3 min-h-8">
          <span className="text-sm text-text-muted">
            {t("kpiCollectedHint")}
          </span>
        </div>
      </SurfaceCard>
      <DashboardDebtKpi debt={debt} />
    </div>
  );
}

function SalesIcon({ className }: { className?: string }) {
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

function ProfitIcon({ className }: { className?: string }) {
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
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function CollectedIcon({ className }: { className?: string }) {
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
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

