"use client";

import { isOptionalMobile, normalizeMobile } from "@/app/modules/shared/utils/egyptian-mobile";
import { useTranslations } from "next-intl";

import type {
  DetailStatus,
  CustomerDetailToastKind,
} from "../types/use-customer-detail.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  deleteCustomer,
  getCustomer,
  listCustomers,
  mergeCustomers,
  updateCustomer,
} from "@/app/modules/customers/services/customers.service";
import type { Customer } from "@/app/modules/customers/types/customers.types";

export function useCustomerDetail(id: string) {
  const describeError = useApiErrorMessage();
  const shared = useTranslations("shared");
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [mergeSourceIds, setMergeSourceIds] = useState<string[]>([]);
  const [mergeOptions, setMergeOptions] = useState<Customer[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const [confirmKind, setConfirmKind] = useState<
    "deactivate" | "activate" | "delete" | null
  >(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    kind: CustomerDetailToastKind;
    variant: "success" | "danger";
  } | null>(null);

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getCustomer(id, controller.signal)
      .then((data) => {
        setCustomer(data);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(err, "Request failed");
        setCustomer(null);
        setError(message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [id, tick]);

  const openEdit = useCallback(() => {
    if (!customer) return;
    setFormName(customer.name);
    setFormPhone(customer.phone ?? "");
    setOriginalPhone(customer.phone ?? "");
    setFormAddress(customer.address ?? "");
    setFormError(null);
    setIsFormOpen(true);
  }, [customer]);

  const closeForm = useCallback(() => {
    if (isSaving) return;
    setIsFormOpen(false);
    setFormError(null);
  }, [isSaving]);

  const submitForm = useCallback(async () => {
    if (!customer) return;
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
    try {
      const updated = await updateCustomer(customer.id, {
        name,
        phone: formPhone === originalPhone ? undefined : phone || null,
        address: formAddress.trim(),
      });
      setCustomer(updated);
      setIsFormOpen(false);
      setToast({ kind: "updated", variant: "success" });
    } catch (err: unknown) {
      const message = describeError(err, "Save failed");
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }, [customer, formName, formPhone, originalPhone, shared, formAddress]);

  const openMerge = useCallback(async () => {
    setMergeError(null);
    setMergeSourceIds([]);
    setMergeTargetId(id);
    setIsMergeOpen(true);
    try {
      const result = await listCustomers({ page: 1, limit: 100 });
      setMergeOptions(result.items);
    } catch (err: unknown) {
      const message = describeError(err, "Could not load customers");
      setMergeError(message);
    }
  }, [id]);

  const closeMerge = useCallback(() => {
    if (isMerging) return;
    setIsMergeOpen(false);
    setMergeError(null);
  }, [isMerging]);

  const toggleMergeSource = useCallback((sourceId: string) => {
    setMergeSourceIds((prev) =>
      prev.includes(sourceId)
        ? prev.filter((value) => value !== sourceId)
        : [...prev, sourceId],
    );
  }, []);

  const submitMerge = useCallback(
    async (phone?: string | null) => {
      if (!mergeTargetId || mergeSourceIds.length === 0) {
        setMergeError("Select a main customer and at least one duplicate");
        return;
      }
      setIsMerging(true);
      setMergeError(null);
      try {
        const kept = await mergeCustomers({
          targetId: mergeTargetId,
          sourceIds: mergeSourceIds,
          phone,
        });
        setIsMergeOpen(false);
        setToast({ kind: "merged", variant: "success" });
        if (kept.id !== id) {
          router.replace(`/customers/${kept.id}`);
        } else {
          refresh();
        }
      } catch (err: unknown) {
        const message = describeError(err, "Merge failed");
        setMergeError(message);
      } finally {
        setIsMerging(false);
      }
    },
    [mergeTargetId, mergeSourceIds, id, router, refresh],
  );

  const openDeactivateConfirm = useCallback(() => {
    setConfirmError(null);
    setConfirmKind("deactivate");
  }, []);

  const openActivateConfirm = useCallback(() => {
    setConfirmError(null);
    setConfirmKind("activate");
  }, []);

  const openDeleteConfirm = useCallback(() => {
    setConfirmError(null);
    setConfirmKind("delete");
  }, []);

  const closeConfirm = useCallback(() => {
    if (isConfirming) return;
    setConfirmKind(null);
    setConfirmError(null);
  }, [isConfirming]);

  const submitConfirm = useCallback(async () => {
    if (!customer || !confirmKind) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      if (confirmKind === "delete") {
        await deleteCustomer(customer.id);
        setToast({ kind: "deleted", variant: "danger" });
        router.push("/customers");
        return;
      }
      const nextActive = confirmKind === "activate";
      const updated = await updateCustomer(customer.id, {
        isActive: nextActive,
      });
      setCustomer(updated);
      setToast(
        nextActive
          ? { kind: "activated", variant: "success" }
          : { kind: "deactivated", variant: "danger" },
      );
      setConfirmKind(null);
    } catch (err: unknown) {
      const message = describeError(err, "Action failed");
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }, [customer, confirmKind, router]);

  return {
    customer,
    status,
    error,
    refresh,
    formMode: "edit" as const,
    isFormOpen,
    openEdit,
    closeForm,
    formName,
    setFormName,
    formPhone,
    originalPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    formBalance: "",
    setFormBalance: () => undefined,
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
    confirmKind,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
    toast,
    clearToast: () => setToast(null),
  };
}
