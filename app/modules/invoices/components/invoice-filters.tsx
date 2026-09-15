"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/app/modules/shared/components/input";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import type {
  PeriodFilter,
  StatusFilter,
} from "@/app/modules/invoices/hooks/use-invoices";

interface InvoiceFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  periodFilter: PeriodFilter;
  onPeriodChange: (value: PeriodFilter) => void;
  periodDate: string;
  onPeriodDateChange: (value: string) => void;
}

export function InvoiceFilters({
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusChange,
  periodFilter,
  onPeriodChange,
  periodDate,
  onPeriodDateChange,
}: InvoiceFiltersProps) {
  const t = useTranslations("invoices");

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
            name="invoiceSearch"
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
            ]}
          />
        </div>
        {periodFilter !== "off" ? (
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
