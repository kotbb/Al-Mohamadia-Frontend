"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import type { PaymentMethod } from "@/app/modules/payments/types/payments.types";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { Modal } from "@/app/modules/shared/components/modal";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  customer: { id: string; name: string; balance: number } | null;
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

  if (!customer) return null;

  let errorMessage: string | null = null;
  if (error === "amountInvalid") {
    errorMessage = t("amountInvalid");
  } else if (error === "amountExceedsBalance") {
    errorMessage = t("amountExceedsBalance", {
      balance: formatMoney(customer.balance, locale),
      currency,
    });
  } else if (error) {
    errorMessage = error;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
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
            disabled={isSubmitting || !amount.trim()}
          >
            {isSubmitting ? t("recording") : t("recordSubmit")}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Customer & balance summary card */}
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <p className="text-xs font-medium text-text-secondary">
            {t("customerLabel")}
          </p>
          <p className="mt-0.5 text-base font-semibold text-text-primary">
            {customer.name}
          </p>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {t("currentBalance", {
              amount: formatMoney(customer.balance, locale),
              currency,
            })}
          </p>
        </div>

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
            max={customer.balance > 0 ? String(customer.balance) : undefined}
            label={t("fieldAmount", { currency })}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={isSubmitting}
            autoFocus
            required
          />
        </div>

        {/* Payment Method */}
        <div className="overflow-x-auto">
          <SegmentedControl
            label={t("fieldMethod")}
            value={method}
            onChange={onMethodChange}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="ds-focus-ring w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
}
