"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { ExpenseCategoriesModal } from "../components/expense-categories-modal";
import { ExpenseDetailModal } from "../components/expense-detail-modal";
import { ExpenseFiltersPanel } from "../components/expense-filters";
import { ExpenseFormModal } from "../components/expense-form-modal";
import { ExpenseLedger } from "../components/expense-ledger";
import { ExpenseSummary } from "../components/expense-summary";
import { useOperatingExpenses } from "../hooks/use-operating-expenses";

export function OperatingExpensesPage() {
  const t = useTranslations("operatingExpenses");
  const model = useOperatingExpenses();

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      hubTabs={false}
      actions={<div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={model.openCategories}>{t("manageCategories")}</Button>
        <Button onClick={model.openCreate}>{t("addExpense")}</Button>
      </div>}
    >
      {model.error && <p role="alert" className="mb-4 text-danger">
        {model.error} <button type="button" className="underline" onClick={model.refresh}>{t("retry")}</button>
      </p>}
      <ExpenseSummary model={model} />
      <ExpenseFiltersPanel model={model} />
      <ExpenseLedger model={model} />
      <ExpenseFormModal model={model} />
      <ExpenseCategoriesModal model={model} />
      <ExpenseDetailModal model={model} />
      <ConfirmDialog
        open={model.deleteTarget !== null}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        confirming={model.saving}
        onConfirm={() => void model.confirmDelete()}
        onCancel={model.closeDelete}
      />
      {model.mutationError && !model.formOpen && !model.categoryOpen &&
        <p role="alert" className="mt-3 text-danger">{model.mutationError}</p>}
    </AppShell>
  );
}
