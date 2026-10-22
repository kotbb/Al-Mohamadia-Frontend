"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "../utils/format-money";
import { invoicePaymentBreakdown } from "../utils/account-payment";

interface AccountPaymentSummaryProps {
  additionalAmount: number;
  invoicePaid: number;
  accountBalance?: number;
  accountKind: "customer" | "supplier";
}

export function AccountPaymentSummary({ additionalAmount, invoicePaid, accountBalance, accountKind }: AccountPaymentSummaryProps) {
  const t = useTranslations("invoicePayments");
  const locale = useLocale();
  const credit = accountBalance !== undefined && accountBalance < 0;
  const breakdown = invoicePaymentBreakdown(invoicePaid, additionalAmount);
  if (additionalAmount <= 0 && accountBalance === undefined) return null;
  return (
    <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2" aria-live="polite">
      {additionalAmount > 0 ? (
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-text-secondary">{t("allocationTitle")}</p>
            <p className="text-lg font-semibold tabular-nums text-text-primary"><bdi>{formatMoney(breakdown.totalPaid, locale)} {t("currency")}</bdi></p>
          </div>
          <dl className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t("invoicePortion")}</dt>
              <dd className="font-medium tabular-nums text-text-primary"><bdi>{formatMoney(breakdown.invoicePaid, locale)}</bdi></dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">{t("previousDebtPayment")}</dt>
              <dd className="font-semibold tabular-nums text-success"><bdi>{formatMoney(breakdown.accountPaymentAmount, locale)}</bdi></dd>
            </div>
          </dl>
        </div>
      ) : null}
      {accountBalance !== undefined ? (
        <div className={`flex flex-col justify-center rounded-xl border border-border bg-surface-muted px-4 py-3 ${additionalAmount > 0 ? "" : "sm:col-span-2"}`}>
          <p className="text-sm text-text-secondary">{t(credit ? `${accountKind}Credit` : `${accountKind}Debt`)}</p>
          <p className={`mt-1 text-xl font-semibold tabular-nums ${credit ? "text-success" : "text-text-primary"}`}>
            <bdi>{formatMoney(Math.abs(accountBalance), locale)}</bdi> {t("currency")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
