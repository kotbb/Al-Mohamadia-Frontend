import { useTranslations } from "next-intl";
import { Input } from "@/app/modules/shared/components/input";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import { CustomDateRangePicker } from "@/app/modules/shared/components/custom-date-range-picker";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import type { LedgerFiltersState } from "../types/use-personal-ledger.types";
import type { LedgerPeriod } from "../types/personal-ledger.types";

export function PersonalLedgerFilters({ filters, onChange }: { filters: LedgerFiltersState; onChange: (next: Partial<LedgerFiltersState>) => void }) {
  const t = useTranslations("personalLedger");
  const periods = useTranslations("invoices");
  return <div className="space-y-3">
    <Input name="ledger-search" label={t("search")} placeholder={t("searchPlaceholder")} value={filters.q} onChange={(event) => onChange({ q: event.target.value })} />
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <SegmentedControl<LedgerPeriod> className="min-w-0 flex-1" label={t("period")} value={filters.period} onChange={(period) => onChange({ period })}
        options={[
          { value: "all", label: periods("filterPeriodOff") },
          { value: "day", label: periods("filterPeriodDay") },
          { value: "week", label: periods("filterPeriodWeek") },
          { value: "month", label: periods("filterPeriodMonth") },
          { value: "year", label: periods("filterPeriodYear") },
          { value: "custom", label: periods("filterPeriodCustom") },
        ]} />
      {filters.period === "custom" ? <div className="w-full lg:w-80"><CustomDateRangePicker {...filters.custom} fromLabel={periods("filterFrom")} toLabel={periods("filterTo")} onChange={(from, to) => onChange({ custom: { from, to } })} /></div>
        : filters.period !== "all" ? <div className="w-full lg:w-auto lg:shrink-0"><PeriodDatePicker period={filters.period} value={filters.date} onChange={(date) => onChange({ date })} /></div> : null}
    </div>
  </div>;
}
