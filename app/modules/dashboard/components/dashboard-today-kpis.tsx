"use client";

import { useLocale, useTranslations } from "next-intl";
import type { DashboardToday } from "@/app/modules/dashboard/types/dashboard.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface DashboardTodayKpisProps {
  today: DashboardToday;
}

export function DashboardTodayKpis({ today }: DashboardTodayKpisProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SurfaceCard padding="none" className="flex flex-col justify-between p-3.5 sm:p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              {t("kpiSales")}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <SalesIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight tabular-nums text-text-primary">
              {formatMoney(today.sales, locale)}
            </span>
            <span className="text-[11px] font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center border-t border-border/40 pt-1.5 min-h-[22px]">
          <span className="text-[11px] text-text-muted">{t("kpiSalesHint")}</span>
        </div>
      </SurfaceCard>

      <SurfaceCard padding="none" className="flex flex-col justify-between p-3.5 sm:p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              {t("kpiEstimatedProfit")}
            </span>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                today.estimatedProfit > 0
                  ? "bg-success/12 text-success"
                  : today.estimatedProfit < 0
                    ? "bg-danger/12 text-danger"
                    : "bg-surface-muted text-text-muted"
              }`}
            >
              <ProfitIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span
              className={`text-xl font-bold tracking-tight tabular-nums ${
                today.estimatedProfit > 0
                  ? "text-success"
                  : today.estimatedProfit < 0
                    ? "text-danger"
                    : "text-text-primary"
              }`}
            >
              {formatMoney(today.estimatedProfit, locale)}
            </span>
            <span className="text-[11px] font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center border-t border-border/40 pt-1.5 min-h-[22px]">
          <span className="text-[11px] text-text-muted">{t("kpiProfitHelper")}</span>
        </div>
      </SurfaceCard>

      <SurfaceCard padding="none" className="flex flex-col justify-between p-3.5 sm:p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              {t("kpiInvoiceCount")}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-info/12 text-info">
              <InvoiceIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight tabular-nums text-text-primary">
              {today.invoiceCount}
            </span>
            <span className="text-[11px] font-medium text-text-muted">
              {t("kpiInvoiceCountUnit")}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center border-t border-border/40 pt-1.5 min-h-[22px]">
          <span className="text-[11px] text-text-muted">{t("kpiInvoiceCountHint")}</span>
        </div>
      </SurfaceCard>

      <SurfaceCard padding="none" className="flex flex-col justify-between p-3.5 sm:p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              {t("kpiCollected")}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CollectedIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight tabular-nums text-text-primary">
              {formatMoney(today.collected, locale)}
            </span>
            <span className="text-[11px] font-medium text-text-muted">
              {t("currency")}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center border-t border-border/40 pt-1.5 min-h-[22px]">
          <span className="text-[11px] text-text-muted">{t("kpiCollectedHint")}</span>
        </div>
      </SurfaceCard>
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
