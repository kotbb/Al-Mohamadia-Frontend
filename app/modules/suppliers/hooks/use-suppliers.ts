"use client";

import { isOptionalMobile, normalizeMobile } from "@/app/modules/shared/utils/egyptian-mobile";
import { isMoneyAmount } from "@/app/modules/shared/utils/money-validation";
import { useTranslations } from "next-intl";

import type {
  ListStatus,
  DebtFilter,
  SuppliersToastState,
  SuppliersConfirmKind,
} from "../types/use-suppliers.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  mergeSuppliers,
  updateSupplier,
} from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useSuppliers() {
  const describeError = useApiErrorMessage();
  const shared = useTranslations("shared");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [debtFilter, setDebtFilter] = useState<DebtFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formAmountOwed, setFormAmountOwed] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [mergeSourceIds, setMergeSourceIds] = useState<string[]>([]);
  const [mergeOptions, setMergeOptions] = useState<Supplier[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const [toast, setToast] = useState<SuppliersToastState | null>(null);
  const [confirmKind, setConfirmKind] = useState<SuppliersConfirmKind>(null);
  const [confirmSupplier, setConfirmSupplier] = useState<Supplier | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const refresh = useCallback(() => {
    setListStatus("loading");
    setListError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const hasDebt = debtFilter === "hasDebt" ? true : undefined;

    listSuppliers(
      {
        q: debouncedQ || undefined,
        hasDebt,
        page,
        limit: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((list) => {
        setSuppliers(list.items);
        setTotal(list.meta.total);
        setTotalOwed(list.summary.totalOwed);
        setListStatus("success");
        setListError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(error, "Request failed");
        setSuppliers([]);
        setTotal(0);
        setTotalOwed(0);
        setListError(message);
        setListStatus("error");
      });

    return () => controller.abort();
  }, [tick, page, debtFilter, debouncedQ]);

  const clearToast = useCallback(() => setToast(null), []);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormPhone("");
    setOriginalPhone("");
    setFormAddress("");
    setFormAmountOwed("");
    setFormError(null);
    setEditingId(null);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setFormMode("create");
    setIsFormOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((supplier: Supplier) => {
    setFormMode("edit");
    setEditingId(supplier.id);
    setFormName(supplier.name);
    setFormPhone(supplier.phone ?? "");
    setOriginalPhone(supplier.phone ?? "");
    setFormAddress(supplier.address ?? "");
    setFormAmountOwed("");
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
    const phone = normalizeMobile(formPhone);
    if (formPhone !== originalPhone && !isOptionalMobile(formPhone)) {
      setFormError(shared("invalidEgyptianMobile"));
      return;
    }
    if (!name) {
      setFormError("Name is required");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setToast(null);
    try {
      const address = formAddress.trim();
      if (formMode === "create") {
        const amountOwedRaw = formAmountOwed.trim();
        const amountOwed =
          amountOwedRaw === "" ? undefined : Number(amountOwedRaw);
        if (
          amountOwed !== undefined &&
          (!isMoneyAmount(amountOwed))
        ) {
          setFormError(shared("validationNumbers"));
          setIsSaving(false);
          return;
        }
        await createSupplier({
          name,
          phone: formPhone === originalPhone ? undefined : phone || null,
          address: address || undefined,
          amountOwed,
        });
        setToast({ kind: "created", variant: "success" });
      } else if (editingId) {
        await updateSupplier(editingId, {
          name,
          phone: formPhone === originalPhone ? undefined : phone || null,
          address: address,
        });
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
  }, [
    formMode,
    editingId,
    formName,
    formPhone,
    originalPhone,
    shared,
    formAddress,
    formAmountOwed,
    refresh,
    resetForm,
  ]);

  const openMerge = useCallback(async (preselectedTargetId?: string) => {
    setMergeError(null);
    setMergeSourceIds([]);
    setMergeTargetId(preselectedTargetId ?? "");
    setIsMergeOpen(true);
    try {
      const result = await listSuppliers({ page: 1, limit: 100 });
      setMergeOptions(result.items);
    } catch (error: unknown) {
      const message = describeError(error, "Could not load suppliers");
      setMergeError(message);
    }
  }, []);

  const closeMerge = useCallback(() => {
    if (isMerging) return;
    setIsMergeOpen(false);
    setMergeTargetId("");
    setMergeSourceIds([]);
    setMergeError(null);
  }, [isMerging]);

  const toggleMergeSource = useCallback((id: string) => {
    setMergeSourceIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }, []);

  const submitMerge = useCallback(
    async (phone?: string | null) => {
      if (!mergeTargetId || mergeSourceIds.length === 0) {
        setMergeError("Select a main supplier and at least one duplicate");
        return;
      }
      if (mergeSourceIds.includes(mergeTargetId)) {
        setMergeError("Main supplier cannot be in the duplicates list");
        return;
      }

      setIsMerging(true);
      setMergeError(null);
      try {
        await mergeSuppliers({
          targetId: mergeTargetId,
          sourceIds: mergeSourceIds,
          phone,
        });
        setToast({ kind: "merged", variant: "success" });
        setIsMergeOpen(false);
        setMergeTargetId("");
        setMergeSourceIds([]);
        refresh();
      } catch (error: unknown) {
        const message = describeError(error, "Merge failed");
        setMergeError(message);
      } finally {
        setIsMerging(false);
      }
    },
    [mergeTargetId, mergeSourceIds, refresh],
  );

  const openDeactivateConfirm = useCallback((supplier: Supplier) => {
    setConfirmError(null);
    setConfirmSupplier(supplier);
    setConfirmKind("deactivate");
  }, []);

  const openActivateConfirm = useCallback((supplier: Supplier) => {
    setConfirmError(null);
    setConfirmSupplier(supplier);
    setConfirmKind("activate");
  }, []);

  const openDeleteConfirm = useCallback((supplier: Supplier) => {
    setConfirmError(null);
    setConfirmSupplier(supplier);
    setConfirmKind("delete");
  }, []);

  const closeConfirm = useCallback(() => {
    if (isConfirming) return;
    setConfirmKind(null);
    setConfirmSupplier(null);
    setConfirmError(null);
  }, [isConfirming]);

  const submitConfirm = useCallback(async () => {
    if (!confirmSupplier || !confirmKind) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      if (confirmKind === "delete") {
        await deleteSupplier(confirmSupplier.id);
        setToast({ kind: "deleted", variant: "danger" });
      } else {
        const nextActive = confirmKind === "activate";
        await updateSupplier(confirmSupplier.id, { isActive: nextActive });
        setToast(
          nextActive
            ? { kind: "activated", variant: "success" }
            : { kind: "deactivated", variant: "danger" },
        );
      }
      setConfirmKind(null);
      setConfirmSupplier(null);
      refresh();
    } catch (error: unknown) {
      const message = describeError(error, "Action failed");
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }, [confirmSupplier, confirmKind, refresh]);

  const setDebtFilterAndResetPage = useCallback((value: DebtFilter) => {
    setDebtFilter(value);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    suppliers,
    totalOwed,
    page,
    totalPages,
    total,
    setPage,
    debtFilter,
    setDebtFilter: setDebtFilterAndResetPage,
    searchInput,
    setSearchInput,
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
    formPhone,
    originalPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    formAmountOwed,
    setFormAmountOwed,
    isSaving,
    formError,
    submitForm,
    isMergeOpen,
    openMerge,
    closeMerge,
    mergeTargetId,
    setMergeTargetId,
    mergeSourceIds,
    toggleMergeSource,
    mergeOptions,
    isMerging,
    mergeError,
    submitMerge,
    toast,
    clearToast,
    confirmKind,
    confirmSupplier,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
  };
}
