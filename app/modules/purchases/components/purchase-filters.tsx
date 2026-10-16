"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/app/modules/shared/components/input";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { CustomDateRangePicker } from "@/app/modules/shared/components/custom-date-range-picker";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import type {
  PurchasePeriodFilterOption,
  PurchaseStatusFilterOption,
} from "@/app/modules/purchases/types/use-purchases.types";

interface PurchaseFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  statusFilter: PurchaseStatusFilterOption;
  onStatusChange: (value: PurchaseStatusFilterOption) => void;
  periodFilter: PurchasePeriodFilterOption;
  onPeriodChange: (value: PurchasePeriodFilterOption) => void;
  periodDate: string;
  customRange: { from: string; to: string };
  onCustomRangeChange: (from: string, to: string) => void;
  onPeriodDateChange: (value: string) => void;
}

export function PurchaseFilters({
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusChange,
  periodFilter,
  onPeriodChange,
  periodDate,
  customRange,
  onCustomRangeChange,
  onPeriodDateChange,
}: PurchaseFiltersProps) {
  const t = useTranslations("purchases");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="w-full max-w-md">
          <SegmentedControl
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: t("filterStatusAll") },
              { value: "saved", label: t("filterStatusSaved") },
              { value: "cancelled", label: t("filterStatusCancelled") },
            ]}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Input
            name="purchaseSearch"
            label={t("searchLabel")}
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="w-full max-w-xl">
          <SegmentedControl
            value={periodFilter}
            onChange={onPeriodChange}
            options={[
              { value: "off", label: t("filterPeriodOff") },
              { value: "day", label: t("filterPeriodDay") },
              { value: "week", label: t("filterPeriodWeek") },
              { value: "month", label: t("filterPeriodMonth") },
              { value: "year", label: t("filterPeriodYear") },
              { value: "custom", label: t("filterPeriodCustom") },
            ]}
          />
        </div>
        {periodFilter === "custom" ? <CustomDateRangePicker {...customRange} onChange={onCustomRangeChange} fromLabel={t("filterFrom")} toLabel={t("filterTo")} /> : periodFilter !== "off" ? (
          <div className="w-full flex-1 sm:max-w-md md:max-w-lg">
            <PeriodDatePicker
              period={periodFilter}
              value={periodDate}
              onChange={onPeriodDateChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
