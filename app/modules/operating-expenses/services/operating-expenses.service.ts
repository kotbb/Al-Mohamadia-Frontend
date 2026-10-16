import { apiClient } from "@/lib/api/client";
import type { ExpenseCategory, ExpenseFilters, ExpenseInput, ExpenseList, OperatingExpense } from "../types/expenses.types";

export function listExpenseCategories(signal?: AbortSignal) {
  return apiClient.get<ExpenseCategory[]>("/operating-expenses/categories", { signal });
}

export function createExpenseCategory(name: string) {
  return apiClient.post<ExpenseCategory>("/operating-expenses/categories", { name });
}

export function updateExpenseCategory(id: string, input: { name?: string; isActive?: boolean }) {
  return apiClient.patch<ExpenseCategory>(`/operating-expenses/categories/${id}`, input);
}

export function listOperatingExpenses(filters: ExpenseFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  params.set("page", String(filters.page));
  for (const key of ["categoryId", "method", "search"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  return apiClient.get<ExpenseList>(`/operating-expenses?${params}`, { signal });
}

export function createOperatingExpense(input: ExpenseInput) {
  return apiClient.post<OperatingExpense>("/operating-expenses", input);
}

export function updateOperatingExpense(id: string, input: ExpenseInput) {
  return apiClient.patch<OperatingExpense>(`/operating-expenses/${id}`, input);
}

export function deleteOperatingExpense(id: string) {
  return apiClient.delete<OperatingExpense>(`/operating-expenses/${id}`);
}
