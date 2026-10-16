"use client";

import { formatCalendarDate } from "@/app/modules/shared/utils/format-calendar-date";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/app/modules/shared/components/button";
import { Modal } from "@/app/modules/shared/components/modal";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { OperatingExpensesViewModel } from "../types/use-operating-expenses.types";

export function ExpenseDetailModal({
  model,
}: {
  model: OperatingExpensesViewModel;
}) {
  const t = useTranslations("operatingExpenses");
  const locale = useLocale();
  const row = model.detail;

  return (
    <Modal
      open={row !== null}
      onClose={() => model.setDetail(null)}
      title={t("details")}
    >
      {row && (
        <div className="space-y-3 text-sm">
          <p>
            <strong>{t("category")}:</strong>{" "}
            {model.categoryLabel(row.categoryId)}
          </p>
          <p>
            <strong>{t("amount")}:</strong> {formatMoney(row.amount, locale)}{" "}
            {t("currency")}
          </p>
          <p>
            <strong>{t("expenseDate")}:</strong>{" "}
            {formatCalendarDate(row.expenseDate, locale)}
          </p>
          <p>
            <strong>{t("method")}:</strong> {t(`methods.${row.method}`)}
          </p>
          <p>
            <strong>{t("payee")}:</strong> {row.payee ?? "—"}
          </p>
          <p>
            <strong>{t("notes")}:</strong> {row.notes ?? "—"}
          </p>
          {!row.isDeleted && (
            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" onClick={() => model.openEdit(row)}>
                {t("editExpense")}
              </Button>
              <Button variant="danger" onClick={() => model.openDelete(row)}>
                {t("delete")}
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
