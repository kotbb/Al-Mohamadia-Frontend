"use client";

import { useLocale, useTranslations } from "next-intl";
import { invoicePaymentBreakdown } from "../utils/account-payment";
import { formatMoney } from "../utils/format-money";
import { PaymentBreakdown } from "./payment-breakdown";

interface InvoicePaidAmountProps {
  paid: number;
  accountPaymentAmount?: number;
  currency: string;
}

export function InvoicePaidAmount({ paid, accountPaymentAmount, currency }: InvoicePaidAmountProps) {
  const locale = useLocale();
  const t = useTranslations("invoicePayments");
  const breakdown = invoicePaymentBreakdown(paid, accountPaymentAmount);
  return (
    <>
      <bdi>{formatMoney(breakdown.totalPaid, locale)} {currency}</bdi>
      {breakdown.accountPaymentAmount > 0 ? (
        <span className="mt-1 block text-xs font-medium leading-relaxed text-text-secondary">
          <PaymentBreakdown invoicePaid={breakdown.invoicePaid} accountPaymentAmount={breakdown.accountPaymentAmount}
            accountLabel={t("previousDebtPayment")} formatAmount={(amount) => formatMoney(amount, locale)} />
        </span>
      ) : null}
    </>
  );
}
