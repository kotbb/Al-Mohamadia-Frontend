"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { listCustomers } from "@/app/modules/customers/services/customers.service";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import {
  formatMoney,
  roundMoneyAmount,
} from "@/app/modules/shared/utils/format-money";
import type { PaymentMethod } from "@/app/modules/payments/types/payments.types";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { Modal } from "@/app/modules/shared/components/modal";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";

const SEARCH_DEBOUNCE_MS = 300;

export interface SelectedCustomerTarget {
  id: string;
  name: string;
  balance: number;
  phone?: string | null;
}

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  customer: SelectedCustomerTarget | null;
  onSelectCustomer?: (customer: SelectedCustomerTarget) => void;
  onClearCustomer?: () => void;
  amount: string;
  onAmountChange: (value: string) => void;
  method: PaymentMethod;
  onMethodChange: (value: PaymentMethod) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function RecordPaymentModal({
  open,
  onClose,
  customer,
  onSelectCustomer,
  onClearCustomer,
  amount,
  onAmountChange,
  method,
  onMethodChange,
  notes,
  onNotesChange,
  isSubmitting,
  error,
  onSubmit,
}: RecordPaymentModalProps) {
  const t = useTranslations("payments");
  const locale = useLocale();
  const currency = t("currency");

  const [debtorCustomers, setDebtorCustomers] = useState<Customer[]>([]);
  const [isLoadingDebtors, setIsLoadingDebtors] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load list of customers with outstanding debt when modal opens without a customer
  useEffect(() => {
    if (!open || customer) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    setIsLoadingDebtors(true);
    listCustomers(
      { isActive: true, hasDebt: true, page: 1, limit: 100 },
      controller.signal,
    )
      .then((res) => {
        setDebtorCustomers(res.items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDebtorCustomers([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingDebtors(false);
      });

    return () => controller.abort();
  }, [open, customer]);

  // Search customers with debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!open || customer || !q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      listCustomers(
        { q, isActive: true, hasDebt: true, page: 1, limit: 10 },
        controller.signal,
      )
        .then((res) => {
          setSearchResults(res.items);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSearchResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, open, customer]);

  if (!open) return null;

  let errorMessage: string | null = null;
  if (error === "amountInvalid") {
    errorMessage = t("amountInvalid");
  } else if (error === "amountExceedsBalance" && customer) {
    errorMessage = t("amountExceedsBalance", {
      balance: formatMoney(customer.balance, locale),
      currency,
    });
  } else if (error) {
    errorMessage = error;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer && amount.trim() && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("recordTitle")}
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("modalCancel")}
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting || !customer || !amount.trim()}
          >
            {isSubmitting ? t("recording") : t("recordSubmit")}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Customer Selection or Selected Customer Card */}
        {customer ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted p-4">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                {t("customerLabel")}
              </p>
              <p className="mt-0.5 text-base font-bold text-text-primary">
                {customer.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                {customer.phone ? <span>{customer.phone}</span> : null}
                <span className="font-semibold text-primary">
                  {t("currentBalance", {
                    amount: formatMoney(customer.balance, locale),
                    currency,
                  })}
                </span>
              </div>
            </div>
            {onClearCustomer ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClearCustomer}
                disabled={isSubmitting}
              >
                {t("customerChange")}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-muted/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* 1. Droplist of customers with debt */}
              <label className="flex w-full flex-col gap-1.5">
                <span className="text-sm font-semibold text-text-secondary">
                  {t("selectCustomerLabel")}
                </span>
                <select
                  className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary"
                  value=""
                  onChange={(e) => {
                    const found = debtorCustomers.find(
                      (c) => c.id === e.target.value,
                    );
                    if (found && onSelectCustomer) {
                      onSelectCustomer({
                        id: found.id,
                        name: found.name,
                        balance: found.balance,
                        phone: found.phone,
                      });
                      setSearchQuery("");
                    }
                  }}
                  disabled={isLoadingDebtors || isSubmitting}
                >
                  <option value="">
                    {isLoadingDebtors
                      ? t("loadingCustomers")
                      : t("selectCustomerPlaceholder")}
                  </option>
                  {debtorCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatMoney(c.balance, locale)} {currency})
                    </option>
                  ))}
                </select>
              </label>

              {/* 2. Live search input with autocomplete */}
              <div className="relative">
                <Input
                  name="customerSearch"
                  label={t("customerSearchLabel")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("customerSearchPlaceholder")}
                  autoComplete="off"
                  disabled={isSubmitting}
                />
                {searchQuery.trim() ? (
                  <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg">
                    {isSearching ? (
                      <li className="px-4 py-3 text-sm text-text-secondary">
                        …
                      </li>
                    ) : searchResults.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-text-secondary">
                        {t("noCustomersWithDebt")}
                      </li>
                    ) : (
                      searchResults.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            className="ds-focus-ring flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-start hover:bg-surface-muted transition-colors"
                            onClick={() => {
                              if (onSelectCustomer) {
                                onSelectCustomer({
                                  id: c.id,
                                  name: c.name,
                                  balance: c.balance,
                                  phone: c.phone,
                                });
                                setSearchQuery("");
                              }
                            }}
                          >
                            <span className="font-semibold text-text-primary">
                              {c.name}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {c.phone ? `${c.phone} • ` : ""}
                              <strong className="text-primary font-medium">
                                {formatMoney(c.balance, locale)} {currency}
                              </strong>
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage ? (
          <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            {errorMessage}
          </div>
        ) : null}

        {/* Amount Input */}
        <div>
          <Input
            name="paymentAmount"
            type="number"
            step="any"
            min="0.01"
            max={
              customer && customer.balance > 0
                ? String(customer.balance)
                : undefined
            }
            label={t("fieldAmount", { currency })}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            onBlur={() => {
              const rounded = roundMoneyAmount(amount);
              if (rounded === null) return;
              onAmountChange(String(rounded));
            }}
            disabled={isSubmitting || !customer}
            placeholder={customer ? String(customer.balance) : ""}
            required
          />
        </div>

        {/* Payment Method */}
        <div className="overflow-x-auto">
          <SegmentedControl
            label={t("fieldMethod")}
            value={method}
            onChange={onMethodChange}
            disabled={isSubmitting || !customer}
            options={[
              { value: "cash", label: t("methodCash") },
              { value: "instapay", label: t("methodInstapay") },
              { value: "vodafone_cash", label: t("methodVodafoneCash") },
              { value: "bank_transfer", label: t("methodBankTransfer") },
              { value: "check", label: t("methodCheck") },
            ]}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-medium text-text-secondary">
            {t("fieldNotes")}
          </label>
          <textarea
            name="paymentNotes"
            rows={3}
            value={notes}
            maxLength={500}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t("fieldNotesPlaceholder")}
            disabled={isSubmitting || !customer}
            className="ds-focus-ring w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
}
