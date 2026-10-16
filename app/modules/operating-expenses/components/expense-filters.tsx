"use client";

import { useTranslations } from "next-intl";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { Input } from "@/app/modules/shared/components/input";
import { CustomDateRangePicker } from "@/app/modules/shared/components/custom-date-range-picker";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import type { PaymentMethod } from "../types/expenses.types";
import type { OperatingExpensesViewModel } from "../types/use-operating-expenses.types";

const methods: PaymentMethod[] = ["cash", "instapay", "vodafone_cash", "bank_transfer", "check"];
const selectClass = "ds-focus-ring min-h-11 w-full cursor-pointer rounded-xl border border-border bg-surface px-3.5 text-sm text-text-primary hover:border-text-secondary";

export function ExpenseFiltersPanel({ model }: { model: OperatingExpensesViewModel }) {
  const t = useTranslations("operatingExpenses");
  const { filters, setFilter } = model;

  return <div className="mt-5 flex flex-col gap-4">
    <div className="grid gap-3 md:grid-cols-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">{t("category")}
        <select value={filters.categoryId} onChange={(event) => setFilter("categoryId", event.target.value)} className={selectClass}>
          <option value="">{t("all")}</option>
          {model.categories.map((row) => <option key={row.id} value={row.id}>{model.categoryLabel(row.id)}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">{t("method")}
        <select value={filters.method} onChange={(event) => setFilter("method", event.target.value)} className={selectClass}>
          <option value="">{t("all")}</option>
          {methods.map((method) => <option key={method} value={method}>{t(`methods.${method}`)}</option>)}
        </select>
      </label>
      <Input name="expenseSearch" label={t("search")} value={filters.search}
        onChange={(event) => setFilter("search", event.target.value)} placeholder={t("searchHint")} />
    </div>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="min-w-0 flex-1">
        <SegmentedControl value={filters.period} onChange={model.setPeriod} options={[
          { value: "off", label: t("periodOff") },
          { value: "day", label: t("periodDay") },
          { value: "week", label: t("periodWeek") },
          { value: "month", label: t("periodMonth") },
          { value: "year", label: t("periodYear") },
          { value: "custom", label: t("periodCustom") },
        ]} />
      </div>
      {filters.period !== "off" && filters.period !== "custom" ?
        <div className="w-full lg:w-auto"><PeriodDatePicker period={filters.period} value={filters.periodDate}
          onChange={(date) => model.setPeriod(filters.period, date)} /></div> : null}
      {filters.period === "custom" ? <CustomDateRangePicker from={filters.from} to={filters.to}
        fromLabel={t("from")} toLabel={t("to")}
        onChange={(from, to) => { setFilter("from", from); setFilter("to", to); }} /> : null}
    </div>
  </div>;
}
