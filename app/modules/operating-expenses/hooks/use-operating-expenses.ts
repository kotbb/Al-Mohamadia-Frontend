"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { getPeriodRangeInfo } from "@/app/modules/invoices/utils/period-range.util";
import {
  createExpenseCategory, createOperatingExpense, listExpenseCategories,
  listOperatingExpenses, updateExpenseCategory, updateOperatingExpense,
  deleteOperatingExpense,
} from "../services/operating-expenses.service";
import type {
  ExpenseCategory, ExpenseFilters, ExpenseInput, ExpenseList,
  OperatingExpense,
} from "../types/expenses.types";
import type { OperatingExpensesViewModel } from "../types/use-operating-expenses.types";

export function useOperatingExpenses(): OperatingExpensesViewModel {
  const t = useTranslations("operatingExpenses");
  const describeError = useApiErrorMessage();
  const [filters, setFilters] = useState<ExpenseFilters>(() => {
    const today = todayIsoDate();
    const range = getPeriodRangeInfo("month", today, "en");
    return { period: "month", periodDate: today, from: range.fromIso, to: range.toIso, categoryId: "", method: "", search: "", page: 1 };
  });
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [list, setList] = useState<ExpenseList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState<OperatingExpense | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setFormState] = useState<ExpenseInput>({ categoryId: "", amount: 0, expenseDate: "", method: "cash", payee: null, notes: null });
  const [detail, setDetail] = useState<OperatingExpense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OperatingExpense | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);
  const setFilter = <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };
  const setPeriod = (period: ExpenseFilters["period"], date = filters.periodDate) => {
    if (period === "off") setFilters((current) => ({ ...current, period, from: "", to: "", page: 1 }));
    else if (period === "custom") setFilters((current) => ({ ...current, period, page: 1 }));
    else {
      const range = getPeriodRangeInfo(period, date, "en");
      setFilters((current) => ({ ...current, period, periodDate: date, from: range.fromIso, to: range.toIso, page: 1 }));
    }
  };
  const setPage = (page: number) => setFilters((current) => ({ ...current, page }));
  const setForm = (update: Partial<ExpenseInput>) => setFormState((current) => ({ ...current, ...update }));

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([listExpenseCategories(controller.signal), listOperatingExpenses(filters, controller.signal)])
      .then(([categoryRows, expenseRows]) => {
        setCategories([...categoryRows].sort((a, b) => {
          const rank = (row: ExpenseCategory) => row.code === "الأجور" || row.code === "wages" ? 0
            : row.code === "أخرى" || row.code === "other" ? 2 : 1;
          return rank(a) - rank(b) || (a.name || a.code || "").localeCompare(b.name || b.code || "", "ar");
        }));
        setList(expenseRows);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(describeError(reason, t("loadError")));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, refreshKey, t, describeError]);

  const categoryLabel = useCallback((id: string) => {
    const category = categories.find((value) => value.id === id);
    if (!category) return t("unknownCategory");
    return category.name?.trim() || category.code?.replace(/^["']+/, "").trim() || t("unknownCategory");
  }, [categories, t]);

  function openCreate() {
    setEditing(null);
    setFormState({ categoryId: categories.find((row) => row.isActive)?.id ?? "", amount: 0,
      expenseDate: todayIsoDate(), method: "cash", payee: null, notes: null });
    setMutationError(null);
    setFormOpen(true);
  }

  function openEdit(row: OperatingExpense) {
    setEditing(row);
    setFormState({ categoryId: row.categoryId, amount: row.amount, expenseDate: row.expenseDate,
      method: row.method, payee: row.payee, notes: row.notes });
    setDetail(null);
    setMutationError(null);
    setFormOpen(true);
  }

  async function saveExpense() {
    setSaving(true);
    setMutationError(null);
    try {
      if (editing) await updateOperatingExpense(editing.id, form);
      else await createOperatingExpense(form);
      setFormOpen(false);
      refresh();
    } catch (reason) {
      setMutationError(describeError(reason, t("saveError")));
    } finally { setSaving(false); }
  }

  async function saveCategory() {
    setSaving(true);
    setMutationError(null);
    try {
      if (renaming) await updateExpenseCategory(renaming, { name: categoryName });
      else await createExpenseCategory(categoryName);
      setCategoryName("");
      setRenaming(null);
      refresh();
      return true;
    } catch (reason) {
      setMutationError(describeError(reason, t("saveError")));
      return false;
    } finally { setSaving(false); }
  }

  async function toggleCategory(row: ExpenseCategory) {
    setSaving(true);
    setMutationError(null);
    try {
      await updateExpenseCategory(row.id, { isActive: !row.isActive });
      refresh();
    } catch (reason) {
      setMutationError(describeError(reason, t("saveError")));
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    setMutationError(null);
    try {
      await deleteOperatingExpense(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (reason) {
      setMutationError(describeError(reason, t("saveError")));
    } finally { setSaving(false); }
  }

  return {
    filters, categories, list, loading, error, mutationError, saving, editing,
    formOpen, form, detail, deleteTarget, categoryOpen, categoryName, renaming,
    categoryLabel, setFilter, setPeriod, setPage, setForm, setDetail, openCreate, openEdit,
    closeForm: () => { if (!saving) setFormOpen(false); }, saveExpense,
    openCategories: () => { setMutationError(null); setCategoryOpen(true); },
    closeCategories: () => setCategoryOpen(false), setCategoryName,
    startRename: (category) => { setRenaming(category.id); setCategoryName(categoryLabel(category.id)); },
    cancelRename: () => { setRenaming(null); setCategoryName(""); },
    saveCategory, toggleCategory,
    openDelete: (expense) => { setDeleteTarget(expense); setDetail(null); },
    closeDelete: () => setDeleteTarget(null), confirmDelete, refresh,
  };
}
