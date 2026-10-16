"use client";

import { useTranslations } from "next-intl";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { CustomDateRangePicker } from "@/app/modules/shared/components/custom-date-range-picker";
import type { SalesInvoicePeriod } from "@/app/modules/dashboard/types/dashboard.types";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";

interface DashboardPeriodControlsProps {
  period: SalesInvoicePeriod | "custom";
  onPeriodChange: (value: SalesInvoicePeriod | "custom") => void;
  periodDate: string;
  onPeriodDateChange: (value: string) => void;
  customRange: { from: string; to: string };
  onCustomRangeChange: (from: string, to: string) => void;
}

export function DashboardPeriodControls({
  period,
  onPeriodChange,
  periodDate,
  onPeriodDateChange,
  customRange,
  onCustomRangeChange,
}: DashboardPeriodControlsProps) {
  const t = useTranslations("invoices");
  const tDash = useTranslations("dashboard");

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h3 className="text-base font-semibold text-text-primary">
          {tDash("periodSectionTitle")}
        </h3>
        <p className="mt-0.5 text-sm text-text-muted">
          {tDash("periodSectionSubtitle")}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full max-w-xl">
          <SegmentedControl
            value={period}
            onChange={onPeriodChange}
            options={[
              { value: "day", label: t("filterPeriodDay") },
              { value: "week", label: t("filterPeriodWeek") },
              { value: "month", label: t("filterPeriodMonth") },
              { value: "year", label: t("filterPeriodYear") },
              { value: "custom", label: t("filterPeriodCustom") },
            ]}
          />
        </div>
        <div className="w-full flex-1 sm:max-w-md md:max-w-lg">
          {period === "custom" ? <CustomDateRangePicker {...customRange} onChange={onCustomRangeChange} fromLabel={t("filterFrom")} toLabel={t("filterTo")} /> : <PeriodDatePicker
            period={period}
            value={periodDate}
            onChange={onPeriodDateChange}
          />}
        </div>
      </div>
    </div>
  );
}
