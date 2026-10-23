"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import type { SalesInvoiceType } from "@/app/modules/invoices/types/invoices.types";
import { InvoiceCustomerCombobox } from "@/app/modules/invoices/components/invoice-customer-combobox";
import { Button } from "@/app/modules/shared/components/button";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
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
  onClearCustomer,
}: InvoiceCustomerSectionProps) {
  const t = useTranslations("invoices");
  const account = useTranslations("accountDetails");
  const locale = useLocale();
  const [focusCustomerSearch, setFocusCustomerSearch] = useState(false);

  return (
    <SurfaceCard padding="sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(15rem,.8fr)_minmax(0,1.2fr)] lg:items-end">
        <SegmentedControl
          label={t("colCustomer")}
          value={type}
          onChange={onTypeChange}
          options={[
            { value: "customer_sale", label: t("typeCustomer") },
            { value: "cash_sale", label: t("typeCash") },
          ]}
        />

        {type === "customer_sale" ? selectedCustomer ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface-muted px-4 py-3.5">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                {t("customerSelected")}
              </p>
              <p className="text-base font-bold text-text-primary">
                {selectedCustomer.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span>
                  {selectedCustomer.balance < 0 ? account("customerCredit") : t("customerCurrentDebt")}:{" "}
                  <strong className={selectedCustomer.balance < 0 ? "text-success" : "text-text-primary"}>
                    <bdi>{formatMoney(Math.abs(selectedCustomer.balance), locale)} {t("currency")}</bdi>
                  </strong>
                </span>
              </div>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => {
              onClearCustomer();
              onCustomerQueryChange("");
              setFocusCustomerSearch(true);
            }}>
              {t("customerChange")}
            </Button>
          </div>
        ) : (
          <InvoiceCustomerCombobox
            query={customerQuery}
            onQueryChange={onCustomerQueryChange}
            results={customerResults}
            loading={customersLoading}
            allCustomers={allCustomers}
            allCustomersLoading={allCustomersLoading}
            selectedCustomer={selectedCustomer}
            focusOnMount={focusCustomerSearch}
            onSelect={(customer) => {
              setFocusCustomerSearch(false);
              onSelectCustomer(customer);
            }}
            onClear={onClearCustomer}
          />
        ) : null}
      </div>
    </SurfaceCard>
  );
}
