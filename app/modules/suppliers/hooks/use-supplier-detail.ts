"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  deleteSupplier,
  getSupplier,
  listSuppliers,
  mergeSuppliers,
  updateSupplier,
} from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";

type DetailStatus = "loading" | "success" | "error";

export type SupplierDetailToastKind =
  | "updated"
  | "activated"
  | "deactivated"
  | "deleted"
  | "merged";

export function useSupplierDetail(id: string) {
  const describeError = useApiErrorMessage();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [mergeSourceIds, setMergeSourceIds] = useState<string[]>([]);
  const [mergeOptions, setMergeOptions] = useState<Supplier[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const [confirmKind, setConfirmKind] = useState<
    "deactivate" | "activate" | "delete" | null
  >(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    kind: SupplierDetailToastKind;
    variant: "success" | "danger";
  } | null>(null);

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getSupplier(id, controller.signal)
      .then((data) => {
        setSupplier(data);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          describeError(err, "Request failed");
        setSupplier(null);
        setError(message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [id, tick]);

  const openEdit = useCallback(() => {
    if (!supplier) return;
    setFormName(supplier.name);
    setFormPhone(supplier.phone ?? "");
    setFormAddress(supplier.address ?? "");
    setFormError(null);
    setIsFormOpen(true);
  }, [supplier]);

  const closeForm = useCallback(() => {
    if (isSaving) return;
    setIsFormOpen(false);
    setFormError(null);
  }, [isSaving]);

  const submitForm = useCallback(async () => {
    if (!supplier) return;
    const name = formName.trim();
    const phone = formPhone.trim();
    if (!name) {
      setFormError("Name is required");
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const updated = await updateSupplier(supplier.id, {
        name,
        phone: phone || undefined,
        address: formAddress.trim(),
      });
      setSupplier(updated);
      setIsFormOpen(false);
      setToast({ kind: "updated", variant: "success" });
    } catch (err: unknown) {
      const message =
        describeError(err, "Save failed");
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }, [supplier, formName, formPhone, formAddress]);

  const openMerge = useCallback(async () => {
    setMergeError(null);
    setMergeSourceIds([]);
    setMergeTargetId(id);
    setIsMergeOpen(true);
    try {
      const result = await listSuppliers({ page: 1, limit: 100 });
      setMergeOptions(result.items);
    } catch (err: unknown) {
      const message =
        describeError(err, "Could not load suppliers");
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

  const submitMerge = useCallback(async () => {
    if (!mergeTargetId || mergeSourceIds.length === 0) {
      setMergeError("Select a main supplier and at least one duplicate");
      return;
    }
    setIsMerging(true);
    setMergeError(null);
    try {
      const kept = await mergeSuppliers({
        targetId: mergeTargetId,
        sourceIds: mergeSourceIds,
      });
      setIsMergeOpen(false);
      setToast({ kind: "merged", variant: "success" });
      if (kept.id !== id) {
        router.replace(`/suppliers/${kept.id}`);
      } else {
        refresh();
      }
    } catch (err: unknown) {
      const message =
        describeError(err, "Merge failed");
      setMergeError(message);
    } finally {
      setIsMerging(false);
    }
  }, [mergeTargetId, mergeSourceIds, id, router, refresh]);

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
    if (!supplier || !confirmKind) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      if (confirmKind === "delete") {
        await deleteSupplier(supplier.id);
        setToast({ kind: "deleted", variant: "danger" });
        router.push("/suppliers");
        return;
      }
      const nextActive = confirmKind === "activate";
      const updated = await updateSupplier(supplier.id, {
        isActive: nextActive,
      });
      setSupplier(updated);
      setToast(
        nextActive
          ? { kind: "activated", variant: "success" }
          : { kind: "deactivated", variant: "danger" },
      );
      setConfirmKind(null);
    } catch (err: unknown) {
      const message =
        describeError(err, "Action failed");
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }, [supplier, confirmKind, router]);

  return {
    supplier,
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
    setFormPhone,
    formAddress,
    setFormAddress,
    formAmountOwed: "",
    setFormAmountOwed: () => undefined,
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
