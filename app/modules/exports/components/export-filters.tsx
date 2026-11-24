"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/app/modules/shared/components/input";
import { Button } from "@/app/modules/shared/components/button";
import { AccountCombobox } from "@/app/modules/shared/components/account-combobox";
import { useExportReference } from "../hooks/use-export-reference";
import type { ExportDataset, ExportSelection } from "../types/exports.types";

const selectClass =
  "ds-focus-ring min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-text-primary";

const REFERENCE_PLACEHOLDERS: Record<string, string> = {
  customerId: "searchCustomers",
  supplierId: "searchSuppliers",
  invoiceId: "searchSalesInvoices",
  purchaseInvoiceId: "searchPurchaseInvoices",
  categoryId: "searchCategories",
};

function ReferenceFilter({
  field,
  value,
  onChange,
}: {
  field: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("exports");
  const lookup = useExportReference(field, value);
  const options = [...lookup.options];
  if (value && !options.some((option) => option.id === value))
    options.unshift(lookup.selected ?? { id: value, name: "" });
  const accounts = options.map((option) => ({ ...option, isActive: option.isActive ?? true }));
  const selected = value ? (accounts.find((option) => option.id === value) ?? null) : null;
  return (
    <div className="space-y-2">
      <AccountCombobox
        name={field}
        inputClassName="export-reference-input"
        includeInactive
        labels={{
          label: t(`filters.${field}`),
          placeholder: t(REFERENCE_PLACEHOLDERS[field]),
          clear: t("clearAccount"),
          loading: t("loading"),
          empty: t("noRecords"),
        }}
        query={lookup.query}
        onQueryChange={lookup.setQuery}
        results={accounts}
        loading={lookup.loading}
        allAccounts={accounts}
        allAccountsLoading={lookup.loading}
        selectedAccount={selected ? { ...selected, name: selected.name || t("selectedRecord") } : null}
        onSelect={(option) => {
          lookup.select(option);
          onChange(option.id);
        }}
        onClear={() => onChange("")}
      />
      {lookup.error ? (
        <div role="alert" className="text-sm text-danger">
          {t("lookupError")}{" "}
          <Button variant="ghost" size="sm" onClick={lookup.reload}>
            {t("retry")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ExportFilters({
  dataset,
  selection,
  onChange,
}: {
  dataset: ExportDataset;
  selection: ExportSelection;
  onChange: (selection: ExportSelection) => void;
}) {
  const t = useTranslations("exports");
  function change(key: string, value: string | boolean | undefined) {
    const filters = { ...selection.filters };
    if (value === undefined || value === "") delete filters[key];
    else filters[key] = value;
    if (key === "type" && value === "standalone") {
      delete filters.invoiceId;
      delete filters.purchaseInvoiceId;
    }
    if ((key === "invoiceId" || key === "purchaseInvoiceId") && value) filters.type = "invoice";
    onChange({ ...selection, filters });
  }
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2">
      {Object.entries(dataset.filters).map(([key, choices]) => {
        const value = selection.filters[key];
        if (choices[0] === "id")
          return (
            <ReferenceFilter key={key} field={key} value={String(value ?? "")} onChange={(next) => change(key, next)} />
          );
        if (choices[0] === "text")
          return (
            <Input
              key={key}
              label={t(`filters.${key}`)}
              value={String(value ?? "")}
              maxLength={500}
              onChange={(event) => change(key, event.target.value)}
            />
          );
        const boolean = choices[0] === "boolean";
        const defaultValue =
          key === "status" ? (dataset.lineColumns ? "saved" : "active") : choices.includes("all") ? "all" : "";
        return (
          <label key={key} className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
            {t(`filters.${key}`)}
            <select
              className={selectClass}
              value={key === "hasDebt" && value === false ? "" : value === undefined ? defaultValue : String(value)}
              onChange={(event) =>
                change(
                  key,
                  event.target.value === "" ? undefined : boolean ? event.target.value === "true" : event.target.value,
                )
              }
            >
              {key !== "status" && !choices.includes("all") ? <option value="">{t("all")}</option> : null}
              {(key === "hasDebt" ? ["true"] : boolean ? ["true", "false"] : choices).map((option) => (
                <option key={option} value={option}>
                  {t(`values.${key === "hasDebt" ? "hasDebt" : option}`)}
                </option>
              ))}
            </select>
          </label>
        );
      })}
    </div>
  );
}
