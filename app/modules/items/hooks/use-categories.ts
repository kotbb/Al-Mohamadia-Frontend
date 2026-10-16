"use client";

import type {
  ListStatus,
  CategoriesToastState,
  CategoriesConfirmKind,
  CategoryListRow,
  UseCategoriesResult,
} from "../types/use-categories.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/app/modules/items/services/categories.service";
import { listItems } from "@/app/modules/items/services/items.service";
import type { Category } from "@/app/modules/items/types/items.types";

export function useCategories(): UseCategoriesResult {
  const describeError = useApiErrorMessage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

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
    setListStatus("loading");
    setListError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      listCategories(controller.signal),
      listItems(undefined, controller.signal),
    ])
      .then(([categoryList, itemList]) => {
        const liveCategories = categoryList.filter(
          (category) => !category.isDeleted,
        );
        const counts: Record<string, number> = {};
        for (const item of itemList) {
          if (item.isDeleted) continue;
          const categoryId = item.category.id;
          counts[categoryId] = (counts[categoryId] ?? 0) + 1;
        }
        setCategories(liveCategories);
        setItemCounts(counts);
        setListStatus("success");
        setListError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(error, "Request failed");
        setCategories([]);
        setItemCounts({});
        setListError(message);
        setListStatus("error");
      });

    return () => controller.abort();
  }, [tick]);

  const rows = useMemo<CategoryListRow[]>(
    () =>
      categories.map((category) => ({
        ...category,
        itemCount: itemCounts[category.id] ?? 0,
      })),
    [categories, itemCounts],
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

  return {
    categories: rows,
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
