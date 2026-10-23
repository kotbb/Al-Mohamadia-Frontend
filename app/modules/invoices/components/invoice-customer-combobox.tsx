"use client";

import { useTranslations } from "next-intl";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import { AccountCombobox } from "@/app/modules/shared/components/account-combobox";
import type { AccountComboboxProps } from "@/app/modules/shared/types/account-combobox.types";

type InvoiceCustomerComboboxProps = Omit<AccountComboboxProps<Customer>, "name" | "labels" | "allAccounts" | "allAccountsLoading" | "selectedAccount"> & {
  allCustomers: Customer[];
  allCustomersLoading: boolean;
  selectedCustomer: Customer | null;
};

export function InvoiceCustomerCombobox({ allCustomers, allCustomersLoading, selectedCustomer, ...props }: InvoiceCustomerComboboxProps) {
  const t = useTranslations("invoices");
  const shared = useTranslations("shared");
  return <AccountCombobox {...props} name="customerSearch" allAccounts={allCustomers} allAccountsLoading={allCustomersLoading}
    selectedAccount={selectedCustomer} labels={{ label: t("customerSearchLabel"), placeholder: t("customerSearchPlaceholder"), clear: t("customerClear"), loading: shared("loading"), empty: t("noCustomersFound") }} />;
}
