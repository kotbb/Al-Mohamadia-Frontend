"use client";

import { useTranslations } from "next-intl";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import type { SalesInvoiceType } from "@/app/modules/invoices/types/invoices.types";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface InvoiceCustomerSectionProps {
  type: SalesInvoiceType;
  onTypeChange: (type: SalesInvoiceType) => void;
  customerQuery: string;
  onCustomerQueryChange: (value: string) => void;
  customerResults: Customer[];
  customersLoading: boolean;
  allCustomers?: Customer[];
  allCustomersLoading?: boolean;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onSelectCustomerId?: (id: string) => void;
  onClearCustomer: () => void;
}

export function InvoiceCustomerSection({
  type,
  onTypeChange,
  customerQuery,
  onCustomerQueryChange,
  customerResults,
  customersLoading,
  allCustomers = [],
  allCustomersLoading = false,
  selectedCustomer,
  onSelectCustomer,
  onSelectCustomerId,
  onClearCustomer,
}: InvoiceCustomerSectionProps) {
  const t = useTranslations("invoices");

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-4">
        <SegmentedControl
          label={t("colCustomer")}
          value={type}
          onChange={onTypeChange}
          options={[
            { value: "cash_sale", label: t("typeCash") },
            { value: "customer_sale", label: t("typeCustomer") },
          ]}
        />

        {type === "customer_sale" ? (
          <div className="flex flex-col gap-3">
            {selectedCustomer ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    {t("customerSelected")}
                  </p>
                  <p className="font-semibold text-text-primary">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onClearCustomer}
                >
                  {t("customerClear")}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {/* 1. Droplist of all customers */}
                <label className="flex w-full flex-col gap-1.5">
                  <span className="text-base font-medium text-text-secondary">
                    {t("customerDroplistLabel")}
                  </span>
                  <select
                    className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-text-primary"
                    value={selectedCustomer ? (selectedCustomer as Customer).id : ""}
                    onChange={(event) => {
                      if (onSelectCustomerId) {
                        onSelectCustomerId(event.target.value);
                      } else {
                        const c = allCustomers.find((item) => item.id === event.target.value);
                        if (c) onSelectCustomer(c);
                      }
                    }}
                    disabled={allCustomersLoading}
                  >
                    <option value="">
                      {allCustomersLoading
                        ? "…"
                        : t("customerDroplistPlaceholder")}
                    </option>
                    {allCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.phone})
                      </option>
                    ))}
                  </select>
                </label>

                {/* 2. Search input by name or phone with live autocomplete */}
                <div className="relative">
                  <Input
                    name="customerSearch"
                    label={t("customerSearchLabel")}
                    value={customerQuery}
                    onChange={(event) =>
                      onCustomerQueryChange(event.target.value)
                    }
                    placeholder={t("customerSearchPlaceholder")}
                    autoComplete="off"
                  />
                  {customerQuery.trim() ? (
                    <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg">
                      {customersLoading ? (
                        <li className="px-4 py-3 text-sm text-text-secondary">
                          …
                        </li>
                      ) : customerResults.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-text-secondary">
                          {t("noCustomersFound")}
                        </li>
                      ) : (
                        customerResults.map((customer) => (
                          <li key={customer.id}>
                            <button
                              type="button"
                              className="ds-focus-ring flex w-full flex-col items-start gap-0.5 px-4 py-3 text-start hover:bg-surface-muted"
                              onClick={() => onSelectCustomer(customer)}
                            >
                              <span className="font-medium text-text-primary">
                                {customer.name}
                              </span>
                              <span className="text-sm text-text-secondary">
                                {customer.phone}
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
