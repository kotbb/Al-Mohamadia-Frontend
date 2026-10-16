"use client";

import { useTranslations } from "next-intl";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { CustomDateRangePicker } from "@/app/modules/shared/components/custom-date-range-picker";
import type {
  PaymentMethodFilterOption,
  PaymentPeriodFilterOption,
  PaymentStatusFilterOption,
} from "@/app/modules/supplier-payments/types/use-supplier-payments.types";
import { Input } from "@/app/modules/shared/components/input";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";

interface SupplierPaymentsFiltersProps {
  statusFilter: PaymentStatusFilterOption;
  onStatusChange: (status: PaymentStatusFilterOption) => void;
  methodFilter: PaymentMethodFilterOption;
  onMethodChange: (method: PaymentMethodFilterOption) => void;
  periodFilter: PaymentPeriodFilterOption;
  onPeriodChange: (period: PaymentPeriodFilterOption) => void;
  periodDate: string;
  customRange: { from: string; to: string };
  onCustomRangeChange: (from: string, to: string) => void;
  onPeriodDateChange: (date: string) => void;
  supplierSearch: string;
  onSupplierSearchChange: (search: string) => void;
  selectedSupplier: { id: string; name: string } | null;
  onSelectSupplier: (supplier: Supplier) => void;
  onClearSupplier: () => void;
  supplierSuggestions: Supplier[];
  isSearchingSuppliers: boolean;
}

export function SupplierPaymentsFilters({
  statusFilter,
  onStatusChange,
  methodFilter,
  onMethodChange,
  periodFilter,
  onPeriodChange,
  periodDate,
  customRange,
  onCustomRangeChange,
  onPeriodDateChange,
  supplierSearch,
  onSupplierSearchChange,
  selectedSupplier,
  onSelectSupplier,
  onClearSupplier,
  supplierSuggestions,
  isSearchingSuppliers,
}: SupplierPaymentsFiltersProps) {
  const t = useTranslations("supplierPayments");

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Status control + Method dropdown + Supplier Search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="w-full lg:max-w-xs">
          <SegmentedControl
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: t("filterStatusAll") },
              { value: "active", label: t("filterStatusActive") },
              { value: "reversed", label: t("filterStatusCancelled") },
            ]}
          />
        </div>

        <div className="flex w-full flex-col gap-1.5 lg:w-48">
          <label
            htmlFor="supplierMethodFilterSelect"
            className="text-base font-medium text-text-secondary"
          >
            {t("colMethod")}
          </label>
          <div className="relative">
            <select
              id="supplierMethodFilterSelect"
              value={methodFilter}
              onChange={(e) =>
                onMethodChange(e.target.value as PaymentMethodFilterOption)
              }
              className="ds-focus-ring min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-surface px-3.5 pe-9 text-sm font-medium text-text-primary transition-colors hover:border-text-secondary focus:border-primary"
            >
              <option value="all">{t("filterMethodAll")}</option>
              <option value="cash">{t("methodCash")}</option>
              <option value="instapay">{t("methodInstapay")}</option>
              <option value="vodafone_cash">{t("methodVodafoneCash")}</option>
              <option value="bank_transfer">{t("methodBankTransfer")}</option>
              <option value="check">{t("methodCheck")}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-text-muted">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative min-w-0 flex-1">
          <Input
            name="supplierSearch"
            label={t("searchLabel")}
            value={supplierSearch}
            onChange={(e) => onSupplierSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
          />

          {isSearchingSuppliers && !selectedSupplier ? (
            <div className="absolute end-3 top-9 flex items-center">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : selectedSupplier ? (
            <button
              type="button"
              onClick={onClearSupplier}
              className="absolute end-3 top-9 text-xs font-medium text-text-secondary hover:text-text-primary"
              title="Clear"
            >
              ✕
            </button>
          ) : null}

          {/* Autocomplete suggestions dropdown */}
          {supplierSuggestions.length > 0 && !selectedSupplier ? (
            <div className="absolute start-0 end-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-lg">
              {supplierSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSupplier(s)}
                  className="ds-focus-ring flex w-full items-center justify-between px-4 py-2 text-start text-sm hover:bg-surface-muted"
                >
                  <span className="font-medium text-text-primary">
                    {s.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {s.phone || ""}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Row 2: Period Filter + Date Picker */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
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
          <div className="w-full lg:w-auto">
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
