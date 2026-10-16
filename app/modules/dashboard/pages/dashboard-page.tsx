"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DashboardPeriodControls } from "@/app/modules/dashboard/components/dashboard-period-controls";
import { DashboardPeriodFinancials } from "@/app/modules/dashboard/components/dashboard-period-financials";
import { DashboardTodayKpis } from "@/app/modules/dashboard/components/dashboard-today-kpis";
import { DashboardTopSellers } from "@/app/modules/dashboard/components/dashboard-top-sellers";
import { useDashboard } from "@/app/modules/dashboard/hooks/use-dashboard";
import { AppShell } from "@/app/layout/app-shell";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

const DashboardSalesChart = dynamic(
  () =>
    import("@/app/modules/dashboard/components/dashboard-sales-chart").then(
      (mod) => mod.DashboardSalesChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-surface"
        role="status"
        aria-live="polite"
      >
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
          aria-hidden
        />
      </div>
    ),
  },
);

export function DashboardPage() {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const tShared = useTranslations("shared");
  const router = useRouter();
  const {
    data,
    status,
    error,
    period,
    setPeriod,
    periodDate,
    customRange,
    setCustomRange,
    setPeriodDate,
    isRefreshing,
    refresh,
  } = useDashboard();

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      hubTabs={false}
      actions={
        <Button variant="primary" onClick={() => router.push("/invoices/new")}>
          <PlusIcon />
          {tNav("newInvoice")}
        </Button>
      }
    >
      {status === "loading" ? <LoadingState message={t("loading")} /> : null}

      {status === "error" ? (
        <ErrorState
          title={tShared("errorTitle")}
          message={error ?? t("loadError")}
          retryLabel={tShared("retry")}
          onRetry={refresh}
        />
      ) : null}

      {status === "success" && data ? (
        <div className="flex flex-col gap-6">
          <DashboardTodayKpis today={data.today} debt={data.debt} />
          <DashboardPeriodControls
            period={period}
            onPeriodChange={setPeriod}
            periodDate={periodDate}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
            onPeriodDateChange={setPeriodDate}
          />
          <DashboardPeriodFinancials financials={data.periodFinancials} />
          <div
            className={`grid grid-cols-1 gap-4 lg:grid-cols-5 ${
              isRefreshing ? "pointer-events-none opacity-60" : ""
            }`}
            aria-busy={isRefreshing}
          >
            <div className="lg:col-span-3">
              <DashboardSalesChart
                series={data.salesSeries}
                period={data.period.period}
              />
            </div>
            <div className="lg:col-span-2">
              <DashboardTopSellers items={data.topSellingItems} />
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
