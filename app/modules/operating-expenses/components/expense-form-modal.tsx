"use client";

import { useTranslations } from "next-intl";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { Button } from "@/app/modules/shared/components/button";
import { Modal } from "@/app/modules/shared/components/modal";
import type { PaymentMethod } from "../types/expenses.types";
import type { OperatingExpensesViewModel } from "../types/use-operating-expenses.types";

const methods: PaymentMethod[] = ["cash", "instapay", "vodafone_cash", "bank_transfer", "check"];
const inputClass = "ds-focus-ring min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary";

export function ExpenseFormModal({ model }: { model: OperatingExpensesViewModel }) {
  const t = useTranslations("operatingExpenses");
  const { form, setForm } = model;

  return (
    <Modal open={model.formOpen} onClose={model.closeForm} title={model.editing ? t("editExpense") : t("addExpense")} size="lg">
      <form onSubmit={(event) => { event.preventDefault(); void model.saveExpense(); }} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">{t("category")}
            <select required value={form.categoryId} onChange={(event) => setForm({ categoryId: event.target.value })} className={inputClass}>
              <option value="">{t("chooseCategory")}</option>
              {model.categories.filter((row) => row.isActive || row.id === model.editing?.categoryId)
                .map((row) => <option key={row.id} value={row.id}>{model.categoryLabel(row.id)}</option>)}
            </select>
          </label>
          <label className="text-sm">{t("amount")}
            <input required type="number" min="0.01" step="0.01" value={form.amount || ""}
              onChange={(event) => setForm({ amount: Number(event.target.value) })} className={inputClass} />
          </label>
          <label className="text-sm">{t("expenseDate")}
            <input required type="date" max={todayIsoDate()} value={form.expenseDate}
              onChange={(event) => setForm({ expenseDate: event.target.value })} className={inputClass} />
          </label>
          <label className="text-sm">{t("method")}
            <select value={form.method} onChange={(event) => setForm({ method: event.target.value as PaymentMethod })} className={inputClass}>
              {methods.map((method) => <option key={method} value={method}>{t(`methods.${method}`)}</option>)}
            </select>
          </label>
          <label className="text-sm">{t("payee")} <span className="text-text-muted">({t("optional")})</span>
            <input maxLength={120} value={form.payee ?? ""} onChange={(event) => setForm({ payee: event.target.value || null })} className={inputClass} />
          </label>
        </div>
        <label className="block text-sm">{t("notes")} <span className="text-text-muted">({t("optional")})</span>
          <textarea maxLength={500} value={form.notes ?? ""} onChange={(event) => setForm({ notes: event.target.value || null })} className={inputClass} />
        </label>
        {model.mutationError && <p role="alert" className="text-sm text-danger">{model.mutationError}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={model.closeForm}>{t("cancel")}</Button>
          <Button type="submit" disabled={model.saving}>{model.saving ? t("saving") : t("save")}</Button>
        </div>
      </form>
    </Modal>
  );
}
