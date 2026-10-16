"use client";

import { useLocale, useTranslations } from "next-intl";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { OperatingExpensesViewModel } from "../types/use-operating-expenses.types";

export function ExpenseSummary({ model }: { model: OperatingExpensesViewModel }) {
  const t = useTranslations("operatingExpenses");
  const locale = useLocale();
  const topCategory = model.list?.summary.topCategoryId
    ? model.categoryLabel(model.list.summary.topCategoryId) : "—";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SurfaceCard padding="none" className="p-4">
        <p className="text-sm text-text-secondary">{t("totalPaid")}</p>
        <p className="mt-1 text-xl font-bold tabular-nums text-danger">
          {formatMoney(model.list?.summary.totalAmount ?? 0, locale)} {t("currency")}
        </p>
      </SurfaceCard>
      <SurfaceCard padding="none" className="p-4">
        <p className="text-sm text-text-secondary">{t("recordCount")}</p>
        <p className="mt-1 text-xl font-bold tabular-nums text-text-primary">{model.list?.summary.count ?? 0}</p>
      </SurfaceCard>
      <SurfaceCard padding="none" className="p-4">
        <p className="text-sm text-text-secondary">{t("topCategory")}</p>
        <p className="mt-1 text-xl font-bold text-text-primary">{topCategory}</p>
      </SurfaceCard>
    </div>
  );
}
