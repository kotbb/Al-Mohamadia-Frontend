"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  DashboardSalesSeriesPoint,
  SalesInvoicePeriod,
} from "@/app/modules/dashboard/types/dashboard.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface DashboardSalesChartProps {
  series: DashboardSalesSeriesPoint[];
  period: SalesInvoicePeriod;
}

export function DashboardSalesChart({
  series,
  period,
}: DashboardSalesChartProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const chartData = useMemo(
    () =>
      series.map((point) => ({
        label: formatBucketLabel(point.bucketStart, period, locale),
        sales: point.sales,
        bucketStart: point.bucketStart,
      })),
    [series, period, locale],
  );

  return (
    <SurfaceCard padding="md" className="flex min-h-[280px] flex-col">
      <h3 className="text-base font-semibold text-text-primary">
        {t("chartTitle")}
      </h3>
      <p className="mt-0.5 text-sm text-text-muted">{t("chartSubtitle")}</p>
      <div className="mt-4 h-56 w-full min-h-[14rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={chartData.length > 14 ? 4 : 0}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(value: number) => formatMoney(value, locale)}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--text-primary)",
              }}
              formatter={(value) => [
                `${formatMoney(Number(value ?? 0), locale)} ${t("currency")}`,
                t("chartTooltipSales"),
              ]}
              labelStyle={{ color: "var(--text-secondary)" }}
            />
            <Bar
              dataKey="sales"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SurfaceCard>
  );
}

function formatBucketLabel(
  bucketStart: string,
  period: SalesInvoicePeriod,
  locale: string,
): string {
  const resolvedLocale = locale === "ar" ? "ar-EG-u-nu-latn" : locale;
  const isYearBucket = period === "year" || /^\d{4}-\d{2}$/.test(bucketStart);

  if (isYearBucket) {
    const [year, month] = bucketStart.split("-").map(Number);
    if (!year || !month) return bucketStart;
    return new Intl.DateTimeFormat(resolvedLocale, { month: "short" }).format(
      new Date(year, month - 1, 1),
    );
  }

  const date = new Date(`${bucketStart}T12:00:00`);
  if (Number.isNaN(date.getTime())) return bucketStart;

  if (period === "day") {
    return new Intl.DateTimeFormat(resolvedLocale, {
      day: "numeric",
      month: "short",
    }).format(date);
  }

  return new Intl.DateTimeFormat(resolvedLocale, {
    day: "numeric",
    month: "short",
  }).format(date);
}
