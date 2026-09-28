"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  formatMoney,
  roundMoneyAmount,
} from "@/app/modules/items/utils/format-money";
import { Input } from "@/app/modules/shared/components/input";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface InvoiceTotalsProps {
  total: number;
  remaining: number;
  discountInput: string;
  paidInput: string;
  onDiscountChange: (value: string) => void;
  onPaidChange: (value: string) => void;
  paidReadOnly?: boolean;
}

export function InvoiceTotals({
  total,
  remaining,
  discountInput,
  paidInput,
  onDiscountChange,
  onPaidChange,
  paidReadOnly = false,
}: InvoiceTotalsProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const currency = t("currency");

  return (
    <SurfaceCard>
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        {t("totalsTitle")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
          <p className="text-sm text-text-secondary">{t("total")}</p>
          <p className="mt-1 text-xl font-semibold text-text-primary">
            {formatMoney(total, locale)} {currency}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
          <p className="text-sm text-text-secondary">{t("remaining")}</p>
          <p className="mt-1 text-xl font-semibold text-text-primary">
            {formatMoney(remaining, locale)} {currency}
          </p>
        </div>
        <Input
          name="discount"
          label={t("discount")}
          type="number"
          min={0}
          step="any"
          value={discountInput}
          onChange={(event) => onDiscountChange(event.target.value)}
          onBlur={() => {
            const rounded = roundMoneyAmount(discountInput);
            if (rounded === null) return;
            onDiscountChange(String(rounded));
          }}
        />
        <Input
          name="paid"
          label={t("paid")}
          type="number"
          min={0}
          step="any"
          value={paidInput}
          onChange={(event) => onPaidChange(event.target.value)}
          onBlur={() => {
            if (paidReadOnly) return;
            const rounded = roundMoneyAmount(paidInput);
            if (rounded === null) return;
            onPaidChange(String(rounded));
          }}
          readOnly={paidReadOnly}
          disabled={paidReadOnly}
        />
      </div>
    </SurfaceCard>
  );
}
