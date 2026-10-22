"use client";

import { useLocale, useTranslations } from "next-intl";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { formatMoney } from "@/app/modules/shared/utils/format-money";

interface AccountFinancialSummaryProps {
  totalInvoiced: number;
  totalPaid: number;
  currentBalance: number;
  party: "customer" | "supplier";
  currency: string;
}

export function AccountFinancialSummary({ totalInvoiced, totalPaid, currentBalance, party, currency }: AccountFinancialSummaryProps) {
  const t = useTranslations("accountDetails");
  const locale = useLocale();
  const metrics = [
    { label: t("totalInvoiced"), value: totalInvoiced },
    { label: t("totalPaid"), value: totalPaid, positive: true },
    { label: t(currentBalance < 0 ? party === "customer" ? "customerCredit" : "supplierCredit" : "currentBalance"), value: currentBalance, positive: currentBalance < 0 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map(({ label, value, positive }) => (
        <SurfaceCard key={label} className="min-w-0" padding="sm">
          <dl>
            <dt className="text-sm text-text-secondary">{label}</dt>
            <dd className={`mt-3 break-words text-2xl font-semibold tabular-nums ${positive ? "text-success" : "text-text-primary"}`}>
              <bdi>{formatMoney(value, locale)} {currency}</bdi>
            </dd>
          </dl>
        </SurfaceCard>
      ))}
    </div>
  );
}
