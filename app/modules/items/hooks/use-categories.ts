"use client";

import type {
  ListStatus,
  CategoriesToastState,
  CategoriesConfirmKind,
  CategoryListRow,
  UseCategoriesResult,
  CategoriesFilters,
} from "../types/use-categories.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/app/modules/items/services/categories.service";
import type { Category } from "@/app/modules/items/types/items.types";

const PAGE_SIZE = 10;

export function useCategories(): UseCategoriesResult {
  const describeError = useApiErrorMessage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [requestedPage, setPage] = useState(1);
  const [filters, setFilters] = useState<CategoriesFilters>({ search: "", isActive: "all" });

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<CategoriesToastState | null>(null);

  const [confirmKind, setConfirmKind] = useState<CategoriesConfirmKind>(null);
  const [confirmCategory, setConfirmCategory] =
    useState<CategoryListRow | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setPage(1);
    setListStatus("loading");
    setListError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    listCategories(controller.signal, { includeItemCount: true })
      .then((categoryList) => {
        if (controller.signal.aborted) return;
        setCategories(categoryList.filter((category) => !category.isDeleted));
        setListStatus("success");
        setListError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(error, "Request failed");
        setCategories([]);
        setListError(message);
        setListStatus("error");
      });

    return () => controller.abort();
  }, [tick]);

  const rows = useMemo<CategoryListRow[]>(
    () =>
      categories.map((category) => ({
        ...category,
        itemCount: category.itemCount ?? 0,
      })),
    [categories],
  );

  const clearToast = useCallback(() => setToast(null), []);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormError(null);
    setEditingCategoryId(null);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setFormMode("create");
    setIsFormOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((category: CategoryListRow) => {
    setFormMode("edit");
    setEditingCategoryId(category.id);
    setFormName(category.name);
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    if (isSaving) return;
    setIsFormOpen(false);
    resetForm();
  }, [isSaving, resetForm]);

  const submitForm = useCallback(async () => {
    const name = formName.trim();
    if (!name) {
      setFormError("Name is required");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setToast(null);
    try {
      if (formMode === "create") {
        await createCategory({ name });
        setToast({ kind: "created", variant: "success" });
      } else if (editingCategoryId) {
        await updateCategory(editingCategoryId, { name });
        setToast({ kind: "updated", variant: "success" });
      }
      setIsFormOpen(false);
      resetForm();
      refresh();
    } catch (error: unknown) {
      const message = describeError(error, "Save failed");
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }, [formMode, editingCategoryId, formName, refresh, resetForm]);

  const openDeactivateConfirm = useCallback((category: CategoryListRow) => {
    setConfirmError(null);
    setConfirmCategory(category);
    setConfirmKind("deactivate");
  }, []);

  const openActivateConfirm = useCallback((category: CategoryListRow) => {
    setConfirmError(null);
    setConfirmCategory(category);
    setConfirmKind("activate");
  }, []);

  const openDeleteConfirm = useCallback((category: CategoryListRow) => {
    if (category.itemCount > 0) return;
    setConfirmError(null);
    setConfirmCategory(category);
    setConfirmKind("delete");
  }, []);

  const closeConfirm = useCallback(() => {
    if (isConfirming) return;
    setConfirmKind(null);
    setConfirmCategory(null);
    setConfirmError(null);
  }, [isConfirming]);

  const submitConfirm = useCallback(async () => {
    if (!confirmCategory || !confirmKind) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      if (confirmKind === "delete") {
        await deleteCategory(confirmCategory.id);
        setToast({ kind: "deleted", variant: "danger" });
      } else {
        const nextActive = confirmKind === "activate";
        await updateCategory(confirmCategory.id, { isActive: nextActive });
        setToast(
          nextActive
            ? { kind: "activated", variant: "success" }
            : { kind: "deactivated", variant: "danger" },
        );
      }
      setConfirmKind(null);
      setConfirmCategory(null);
      refresh();
    } catch (error: unknown) {
      const message = describeError(error, "Action failed");
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }, [confirmCategory, confirmKind, refresh]);

  const filteredCategories = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase();
    return rows.filter((category) => {
      if (filters.isActive === "active" && !category.isActive) return false;
      if (filters.isActive === "inactive" && category.isActive) return false;
      return !search || category.name.toLocaleLowerCase().includes(search);
    });
  }, [rows, filters]);

  const setSearch = useCallback((search: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, search }));
  }, []);

  const setIsActive = useCallback((isActive: CategoriesFilters["isActive"]) => {
    setPage(1);
    setFilters((current) => ({ ...current, isActive }));
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const page = Math.max(1, Math.min(requestedPage, totalPages));

  return {
    categories: rows,
    pageCategories: filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    totalPages,
    setPage,
    filters,
    setSearch,
    setIsActive,
    hasFilters: filters.search.trim() !== "" || filters.isActive !== "all",
    listStatus,
    listError,
    refresh,
    formMode,
    isFormOpen,
    openCreate,
    openEdit,
    closeForm,
    formName,
    setFormName,
    isSaving,
    formError,
    submitForm,
    toast,
    clearToast,
    confirmKind,
    confirmCategory,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
  };
}
