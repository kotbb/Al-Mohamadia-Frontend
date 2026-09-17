"use client";

import { useTranslations } from "next-intl";
import type { PaymentMethod } from "@/app/modules/payments/types/payments.types";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  className?: string;
}

export function PaymentMethodBadge({
  method,
  className = "",
}: PaymentMethodBadgeProps) {
  const t = useTranslations("payments");

  const labelMap: Record<PaymentMethod, string> = {
    cash: t("methodCash"),
    instapay: t("methodInstapay"),
    vodafone_cash: t("methodVodafoneCash"),
    bank_transfer: t("methodBankTransfer"),
    check: t("methodCheck"),
  };

  const label = labelMap[method] || method;

  return (
    <span
      className={`inline-flex items-center text-xs font-medium text-text-secondary ${className}`}
    >
      {label}
    </span>
  );
}
