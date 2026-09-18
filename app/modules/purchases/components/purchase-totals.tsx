"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface PurchaseTotalsProps {
  total: number;
  paidInput: string;
  onPaidChange: (value: string) => void;
  remaining: number;
}

export function PurchaseTotals({
  total,
  paidInput,
  onPaidChange,
  remaining,
}: PurchaseTotalsProps) {
  const t = useTranslations("purchases");
  const locale = useLocale();

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-text-primary">
          {t("totalsTitle")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Total */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-muted p-4">
            <span className="text-sm text-text-secondary">{t("total")}</span>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              {formatMoney(total, locale)} {t("currency")}
            </p>
          </div>

          {/* Paid Input */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4">
            <label
              htmlFor="purchase-paid-input"
              className="text-sm text-text-secondary"
            >
              {t("paid")}
            </label>
            <div className="relative mt-2 flex items-center">
              <input
                id="purchase-paid-input"
                name="paid"
                type="number"
                min={0}
                max={total}
                step="any"
                value={paidInput}
                onChange={(e) => onPaidChange(e.target.value)}
                className="ds-focus-input min-h-10 w-full rounded-lg border border-border bg-surface ps-3 pe-12 text-lg font-bold text-text-primary"
              />
              <span className="pointer-events-none absolute end-3 text-sm text-text-muted">
                {t("currency")}
              </span>
            </div>
          </div>

          {/* Remaining (Owed to Supplier) */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-muted p-4">
            <span className="text-sm font-medium text-text-secondary">
              {t("remainingOwed")}
            </span>
            <p
              className={`mt-2 text-2xl font-bold ${
                remaining > 0 ? "text-danger" : "text-text-primary"
              }`}
            >
              {formatMoney(remaining, locale)} {t("currency")}
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
