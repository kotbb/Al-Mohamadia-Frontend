"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DashboardDebt } from "@/app/modules/dashboard/types/dashboard.types";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface DashboardDebtKpiProps {
  debt: DashboardDebt;
}

export function DashboardDebtKpi({ debt }: DashboardDebtKpiProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  return (
    <SurfaceCard
      padding="none"
      className="flex flex-col justify-between p-5 sm:p-6"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-text-secondary">{t("debtTitle")}</span>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/12 text-danger" aria-hidden>
            <DebtIcon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight tabular-nums text-danger">{formatMoney(debt.totalDebt, locale)}</span>
          <span className="text-sm font-medium text-text-muted">{t("currency")}</span>
        </div>
      </div>
      <div className="mt-4 flex min-h-8 items-center justify-between gap-2 border-t border-border/40 pt-3 text-sm">
        <span className="rounded-full bg-danger/12 px-2.5 py-0.5 font-medium text-danger">{t("debtorCount", { count: debt.debtorCount })}</span>
        <Link href="/customers?hasDebt=1" className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-ring-offset">
          {t("debtViewCustomers")}
          <ChevronIcon className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </SurfaceCard>
  );
}

function ChevronIcon({ className }: { className?: string }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function DebtIcon({ className }: { className?: string }) {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
