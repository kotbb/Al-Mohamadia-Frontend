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
    <SurfaceCard padding="none" className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
      <dl className="min-w-0">
        <dt className="flex min-h-9 items-center text-base font-medium text-text-secondary">{t("debtTitle")}</dt>
        <dd className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-danger">
          <bdi className="min-w-0 break-words text-2xl font-bold tracking-tight tabular-nums">
            {formatMoney(debt.totalDebt, locale)}
          </bdi>
          <span className="text-sm font-medium text-text-muted">{t("currency")}</span>
        </dd>
      </dl>
      <div className="mt-4 flex min-h-8 flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-sm">
        <span className="rounded-full bg-danger/12 px-2.5 py-0.5 font-medium text-danger">
          {t("debtorCount", { count: debt.debtorCount })}
        </span>
        <Link
          href="/customers?hasDebt=1"
          className="ds-focus-ring inline-flex items-center gap-1 rounded-lg text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
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
