"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { listSuppliers } from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import type { PaymentMethod } from "@/app/modules/supplier-payments/types/supplier-payments.types";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { Modal } from "@/app/modules/shared/components/modal";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";

const SEARCH_DEBOUNCE_MS = 300;

export interface SelectedSupplierTarget {
  id: string;
  name: string;
  amountOwed: number;
  phone?: string | null;
}

interface RecordSupplierPaymentModalProps {
  open: boolean;
  onClose: () => void;
  supplier: SelectedSupplierTarget | null;
  onSelectSupplier?: (supplier: SelectedSupplierTarget) => void;
  onClearSupplier?: () => void;
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

export function RecordSupplierPaymentModal({
  open,
  onClose,
  supplier,
  onSelectSupplier,
  onClearSupplier,
  amount,
  onAmountChange,
  method,
  onMethodChange,
  notes,
  onNotesChange,
  isSubmitting,
  error,
  onSubmit,
}: RecordSupplierPaymentModalProps) {
  const t = useTranslations("supplierPayments");
  const locale = useLocale();
  const currency = t("currency");

  const [debtorSuppliers, setDebtorSuppliers] = useState<Supplier[]>([]);
  const [isLoadingDebtors, setIsLoadingDebtors] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Supplier[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load suppliers with debt owed when modal opens without a supplier selected
  useEffect(() => {
    if (!open || supplier) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    setIsLoadingDebtors(true);
    listSuppliers({ isActive: true, hasDebt: true, page: 1, limit: 100 }, controller.signal)
      .then((res) => {
        setDebtorSuppliers(res.items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDebtorSuppliers([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingDebtors(false);
      });

    return () => controller.abort();
  }, [open, supplier]);

  // Search suppliers with debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!open || supplier || !q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      listSuppliers({ q, isActive: true, hasDebt: true, page: 1, limit: 10 }, controller.signal)
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
  }, [searchQuery, open, supplier]);

  if (!open) return null;

  let errorMessage: string | null = null;
  if (error === "amountInvalid") {
    errorMessage = t("amountInvalid");
  } else if (error === "amountExceedsDebt" && supplier) {
    errorMessage = t("amountExceedsDebt", {
      debt: formatMoney(supplier.amountOwed, locale),
      currency,
    });
  } else if (error) {
    errorMessage = error;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supplier && amount.trim() && !isSubmitting) {
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
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("modalCancel")}
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting || !supplier || !amount.trim()}
          >
            {isSubmitting ? t("recording") : t("recordSubmit")}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Supplier Selection or Selected Supplier Card */}
        {supplier ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted p-4">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                {t("supplierLabel")}
              </p>
              <p className="mt-0.5 text-base font-bold text-text-primary">
                {supplier.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                {supplier.phone ? <span>{supplier.phone}</span> : null}
                <span className="font-semibold text-primary">
                  {t("currentDebt", {
                    amount: formatMoney(supplier.amountOwed, locale),
                    currency,
                  })}
                </span>
              </div>
            </div>
            {onClearSupplier ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClearSupplier}
                disabled={isSubmitting}
              >
                {t("supplierChange")}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-muted/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* 1. Droplist of suppliers with debt */}
              <label className="flex w-full flex-col gap-1.5">
                <span className="text-sm font-semibold text-text-secondary">
                  {t("selectSupplierLabel")}
                </span>
                <select
                  className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary"
                  value=""
                  onChange={(e) => {
                    const found = debtorSuppliers.find((s) => s.id === e.target.value);
                    if (found && onSelectSupplier) {
                      onSelectSupplier({
                        id: found.id,
                        name: found.name,
                        amountOwed: found.amountOwed,
                        phone: found.phone,
                      });
                      setSearchQuery("");
                    }
                  }}
                  disabled={isLoadingDebtors || isSubmitting}
                >
                  <option value="">
                    {isLoadingDebtors
                      ? t("loadingSuppliers")
                      : t("selectSupplierPlaceholder")}
                  </option>
                  {debtorSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatMoney(s.amountOwed, locale)} {currency})
                    </option>
                  ))}
                </select>
              </label>

              {/* 2. Live search input with autocomplete */}
              <div className="relative">
                <Input
                  name="supplierSearch"
                  label={t("supplierSearchLabel")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("supplierSearchPlaceholder")}
                  autoComplete="off"
                  disabled={isSubmitting}
                />
                {searchQuery.trim() ? (
                  <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg">
                    {isSearching ? (
                      <li className="px-4 py-3 text-sm text-text-secondary">…</li>
                    ) : searchResults.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-text-secondary">
                        {t("noSuppliersWithDebt")}
                      </li>
                    ) : (
                      searchResults.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            className="ds-focus-ring flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-start hover:bg-surface-muted transition-colors"
                            onClick={() => {
                              if (onSelectSupplier) {
                                onSelectSupplier({
                                  id: s.id,
                                  name: s.name,
                                  amountOwed: s.amountOwed,
                                  phone: s.phone,
                                });
                                setSearchQuery("");
                              }
                            }}
                          >
                            <span className="font-semibold text-text-primary">
                              {s.name}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {s.phone ? `${s.phone} • ` : ""}
                              <strong className="text-primary font-medium">
                                {formatMoney(s.amountOwed, locale)} {currency}
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
            max={supplier && supplier.amountOwed > 0 ? String(supplier.amountOwed) : undefined}
            label={t("fieldAmount", { currency })}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={isSubmitting || !supplier}
            placeholder={supplier ? String(supplier.amountOwed) : ""}
            required
          />
        </div>

        {/* Payment Method */}
        <div className="overflow-x-auto">
          <SegmentedControl
            label={t("fieldMethod")}
            value={method}
            onChange={onMethodChange}
            disabled={isSubmitting || !supplier}
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
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t("fieldNotesPlaceholder")}
            disabled={isSubmitting || !supplier}
            className="ds-focus-ring w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
}
