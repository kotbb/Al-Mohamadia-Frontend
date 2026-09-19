"use client";

import { useTranslations } from "next-intl";
import type { StockItem } from "@/app/modules/inventory/types/inventory.types";
import type { AdjustmentPeriodFilter } from "@/app/modules/inventory/hooks/use-stock-adjustments";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import type { SalesInvoicePeriod } from "@/app/modules/invoices/types/invoices.types";

interface AdjustmentsFiltersProps {
  itemId: string;
  onItemIdChange: (itemId: string) => void;
  periodFilter: AdjustmentPeriodFilter;
  onPeriodFilterChange: (period: AdjustmentPeriodFilter) => void;
  periodDate: string;
  onPeriodDateChange: (date: string) => void;
  allItems: StockItem[];
}

export function AdjustmentsFilters({
  itemId,
  onItemIdChange,
  periodFilter,
  onPeriodFilterChange,
  periodDate,
  onPeriodDateChange,
  allItems,
}: AdjustmentsFiltersProps) {
  const t = useTranslations("inventory");

  const periodOptions: { value: AdjustmentPeriodFilter; label: string }[] = [
    { value: "off", label: t("filterPeriodOff") },
    { value: "day", label: t("filterPeriodDay") },
    { value: "week", label: t("filterPeriodWeek") },
    { value: "month", label: t("filterPeriodMonth") },
    { value: "year", label: t("filterPeriodYear") },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Item selection filter */}
      <div className="w-full sm:max-w-xs">
        <label className="flex w-full flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">
            {t("colItem")}
          </span>
          <select
            value={itemId}
            onChange={(e) => onItemIdChange(e.target.value)}
            className="ds-focus-input min-h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="">{t("allAdjustments")}</option>
            {allItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Row 2: Date filter (Period filter + Calendar beside it) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="w-full sm:w-auto">
          <SegmentedControl
            value={periodFilter}
            onChange={(val) => onPeriodFilterChange(val as AdjustmentPeriodFilter)}
            options={periodOptions}
          />
        </div>

        {periodFilter !== "off" && (
          <div className="w-full flex-1 sm:max-w-md md:max-w-lg">
            <PeriodDatePicker
              period={periodFilter as SalesInvoicePeriod}
              value={periodDate}
              onChange={onPeriodDateChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
