"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DashboardDebt } from "@/app/modules/dashboard/types/dashboard.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { Badge } from "@/app/modules/shared/components/badge";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface DashboardDebtStripProps {
  debt: DashboardDebt;
}

export function DashboardDebtStrip({ debt }: DashboardDebtStripProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const hasDebtors = debt.debtorCount > 0;

  return (
    <SurfaceCard
      padding="none"
      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              hasDebtors
                ? "bg-danger/12 text-danger"
                : "bg-success/12 text-success"
            }`}
            aria-hidden
          >
            <DebtIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-base font-medium text-text-secondary">
              {t("debtTitle")}
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold tracking-tight tabular-nums ${
                  hasDebtors ? "text-danger" : "text-text-primary"
                }`}
              >
                {formatMoney(debt.totalDebt, locale)}
              </span>
              <span className="text-sm font-medium text-text-muted">
                {t("currency")}
              </span>
            </div>
          </div>
        </div>
        <Badge variant={hasDebtors ? "danger" : "success"}>
          {t("debtorCount", { count: debt.debtorCount })}
        </Badge>
      </div>

      <Link
        href="/customers?hasDebt=1"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-ring-offset"
      >
        {t("debtViewCustomers")}
        <ChevronIcon className="h-4 w-4 rtl:rotate-180" />
      </Link>
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
