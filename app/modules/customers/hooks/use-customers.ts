"use client";

import { isOptionalMobile, normalizeMobile } from "@/app/modules/shared/utils/egyptian-mobile";
import { isSignedMoneyAmount } from "@/app/modules/shared/utils/money-validation";
import { useTranslations } from "next-intl";

import type {
  ListStatus,
  DebtFilter,
  CustomersToastState,
  CustomersConfirmKind,
} from "../types/use-customers.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  mergeCustomers,
  updateCustomer,
} from "@/app/modules/customers/services/customers.service";
import type { Customer } from "@/app/modules/customers/types/customers.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useCustomers(options?: { initialDebtFilter?: DebtFilter }) {
  const describeError = useApiErrorMessage();
  const shared = useTranslations("shared");
  const account = useTranslations("accountDetails");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [debtorCount, setDebtorCount] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [debtFilter, setDebtFilter] = useState<DebtFilter>(
    options?.initialDebtFilter ?? "all",
  );
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
  const [formBalance, setFormBalance] = useState("");
  const [originalBalance, setOriginalBalance] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [mergeSourceIds, setMergeSourceIds] = useState<string[]>([]);
  const [mergeOptions, setMergeOptions] = useState<Customer[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const [toast, setToast] = useState<CustomersToastState | null>(null);
  const [confirmKind, setConfirmKind] = useState<CustomersConfirmKind>(null);
  const [confirmCustomer, setConfirmCustomer] = useState<Customer | null>(null);
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

    listCustomers({ q: debouncedQ || undefined, hasDebt, page, limit: PAGE_SIZE }, controller.signal)
      .then((list) => {
        if (controller.signal.aborted) return;
        setCustomers(list.items);
        setTotal(list.meta.total);
        setTotalDebt(list.summary.totalDebt);
        setDebtorCount(list.summary.debtorCount);
        setListStatus("success");
        setListError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(error, "Request failed");
        setCustomers([]);
        setTotal(0);
        setTotalDebt(0);
        setDebtorCount(0);
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
    setFormBalance("");
    setFormError(null);
    setEditingId(null);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setFormMode("create");
    setIsFormOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((customer: Customer) => {
    setFormMode("edit");
    setEditingId(customer.id);
    setFormName(customer.name);
    setFormPhone(customer.phone ?? "");
    setOriginalPhone(customer.phone ?? "");
    setFormAddress(customer.address ?? "");
    setFormBalance(String(customer.balance));
    setOriginalBalance(customer.balance);
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
      setFormError(account("nameRequired"));
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setToast(null);
    try {
      const address = formAddress.trim();
      const balanceValue = formMode === "create" && !formBalance.trim() ? undefined : Number(formBalance);
      const balanceChanged = formMode === "create" || balanceValue !== originalBalance;
      if (balanceValue !== undefined && (!formBalance.trim() || !isSignedMoneyAmount(balanceValue))) {
        setFormError(account("invalidBalance"));
        return;
      }
      if (formMode === "create") {
        await createCustomer({
          name,
          phone: formPhone === originalPhone ? undefined : phone || null,
          address: address || undefined,
          ...(balanceChanged && balanceValue !== undefined ? { balance: balanceValue } : {}),
        });
        setToast({ kind: "created", variant: "success" });
      } else if (editingId) {
        await updateCustomer(editingId, {
          name,
          phone: formPhone === originalPhone ? undefined : phone || null,
          address: address,
          ...(balanceChanged && balanceValue !== undefined ? { balance: balanceValue } : {}),
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
    account,
    formAddress,
    formBalance,
    originalBalance,
    refresh,
    resetForm,
  ]);

  const openMerge = useCallback(async (preselectedTargetId?: string) => {
    setMergeError(null);
    setMergeSourceIds([]);
    setMergeTargetId(preselectedTargetId ?? "");
    setIsMergeOpen(true);
    try {
      const result = await listCustomers({ page: 1, limit: 100 });
      setMergeOptions(result.items);
    } catch (error: unknown) {
      const message = describeError(error, "Could not load customers");
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
        setMergeError("Select a main customer and at least one duplicate");
        return;
      }
      if (mergeSourceIds.includes(mergeTargetId)) {
        setMergeError("Main customer cannot be in the duplicates list");
        return;
      }

      setIsMerging(true);
      setMergeError(null);
      try {
        await mergeCustomers({
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

  const openDeactivateConfirm = useCallback((customer: Customer) => {
    setConfirmError(null);
    setConfirmCustomer(customer);
    setConfirmKind("deactivate");
  }, []);

  const openActivateConfirm = useCallback((customer: Customer) => {
    setConfirmError(null);
    setConfirmCustomer(customer);
    setConfirmKind("activate");
  }, []);

  const openDeleteConfirm = useCallback((customer: Customer) => {
    setConfirmError(null);
    setConfirmCustomer(customer);
    setConfirmKind("delete");
  }, []);

  const closeConfirm = useCallback(() => {
    if (isConfirming) return;
    setConfirmKind(null);
    setConfirmCustomer(null);
    setConfirmError(null);
  }, [isConfirming]);

  const submitConfirm = useCallback(async () => {
    if (!confirmCustomer || !confirmKind) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      if (confirmKind === "delete") {
        await deleteCustomer(confirmCustomer.id);
        setToast({ kind: "deleted", variant: "danger" });
      } else {
        const nextActive = confirmKind === "activate";
        await updateCustomer(confirmCustomer.id, { isActive: nextActive });
        setToast(
          nextActive
            ? { kind: "activated", variant: "success" }
            : { kind: "deactivated", variant: "danger" },
        );
      }
      setConfirmKind(null);
      setConfirmCustomer(null);
      refresh();
    } catch (error: unknown) {
      const message = describeError(error, "Action failed");
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }, [confirmCustomer, confirmKind, refresh]);

  const setDebtFilterAndResetPage = useCallback((value: DebtFilter) => {
    setDebtFilter(value);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    customers,
    totalDebt,
    debtorCount,
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
    formBalance,
    setFormBalance,
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
    confirmCustomer,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
  };
}
