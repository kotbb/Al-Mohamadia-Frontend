"use client";

import { formatCalendarDate } from "@/app/modules/shared/utils/format-calendar-date";
import { useLocale, useTranslations } from "next-intl";
import { PaymentMethodBadge } from "@/app/modules/payments/components/payment-method-badge";
import { Button } from "@/app/modules/shared/components/button";
import { RowActionsMenu } from "@/app/modules/shared/components/row-actions-menu";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { OperatingExpensesViewModel } from "../types/use-operating-expenses.types";

export function ExpenseLedger({
  model,
}: {
  model: OperatingExpensesViewModel;
}) {
  const t = useTranslations("operatingExpenses");
  const locale = useLocale();
  const totalPages = Math.max(
    1,
    Math.ceil((model.list?.meta.total ?? 0) / (model.list?.meta.limit ?? 10)),
  );

  return (
    <div className="mt-5">
      {model.loading && !model.list ? (
        <p className="py-8 text-center text-text-secondary">{t("loading")}</p>
      ) : !model.list?.items.length ? (
        <p className="rounded-shell border border-border bg-surface py-8 text-center text-text-secondary">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-shell border border-border bg-surface">
          <table className="w-full min-w-[48rem] border-collapse text-sm lg:text-base">
            <thead className="bg-surface-muted">
              <tr className="border-b border-border">
                {[
                  "expenseDate",
                  "category",
                  "payee",
                  "amount",
                  "method",
                  "notes",
                ].map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-start font-medium text-text-secondary"
                  >
                    {t(key)}
                  </th>
                ))}
                <th className="w-24 px-4 py-3 text-center font-medium text-text-secondary">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {model.list.items.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${t("details")}: ${model.categoryLabel(row.categoryId)}`}
                  onClick={() => {
                    if (!model.loading && !window.getSelection()?.toString())
                      model.setDetail(row);
                  }}
                  onKeyDown={(event) => {
                    if (
                      !model.loading &&
                      event.target === event.currentTarget &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      model.setDetail(row);
                    }
                  }}
                  className="cursor-pointer border-b border-border last:border-b-0 transition-colors hover:bg-surface-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {formatCalendarDate(row.expenseDate, locale)}
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {model.categoryLabel(row.categoryId)}
                  </td>
                  <td className="px-4 py-3 text-text-primary">
                    {row.payee || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-danger">
                    {formatMoney(row.amount, locale)} {t("currency")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <PaymentMethodBadge method={row.method} />
                  </td>
                  <td
                    className="max-w-[14rem] truncate px-4 py-3 text-text-secondary"
                    title={row.notes ?? ""}
                  >
                    {row.notes || "—"}
                  </td>
                  <td
                    className="px-4 py-3 text-center"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <RowActionsMenu
                      label={t("actions")}
                      items={[
                        {
                          id: "details",
                          label: t("details"),
                          onSelect: () => model.setDetail(row),
                        },
                        {
                          id: "edit",
                          label: t("editExpense"),
                          onSelect: () => model.openEdit(row),
                        },
                        {
                          id: "delete",
                          label: t("delete"),
                          tone: "danger",
                          onSelect: () => model.openDelete(row),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={model.filters.page <= 1}
          onClick={() => model.setPage(model.filters.page - 1)}
        >
          {t("previous")}
        </Button>
        <span className="text-sm text-text-secondary">
          {model.filters.page} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={model.filters.page >= totalPages}
          onClick={() => model.setPage(model.filters.page + 1)}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
