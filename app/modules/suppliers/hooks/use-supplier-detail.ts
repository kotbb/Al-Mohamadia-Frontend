"use client";

import { isOptionalMobile, normalizeMobile } from "@/app/modules/shared/utils/egyptian-mobile";
import { isSignedMoneyAmount } from "@/app/modules/shared/utils/money-validation";
import { useTranslations } from "next-intl";

import type {
  DetailStatus,
  SupplierDetailToastKind,
} from "../types/use-supplier-detail.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  getSupplier,
  updateSupplier,
} from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";

export function useSupplierDetail(id: string) {
  const describeError = useApiErrorMessage();
  const shared = useTranslations("shared");
  const account = useTranslations("accountDetails");
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formAmountOwed, setFormAmountOwed] = useState("");
  const [originalBalance, setOriginalBalance] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
        const message = describeError(err, "Request failed");
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
    setOriginalPhone(supplier.phone ?? "");
    setFormAddress(supplier.address ?? "");
    setFormAmountOwed(String(supplier.amountOwed));
    setOriginalBalance(supplier.amountOwed);
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
    const phone = normalizeMobile(formPhone);
    if (formPhone !== originalPhone && !isOptionalMobile(formPhone)) {
      setFormError(shared("invalidEgyptianMobile"));
      return;
    }
    if (!name) {
      setFormError(account("nameRequired"));
      return;
    }
    const balanceValue = Number(formAmountOwed);
    const balanceChanged = balanceValue !== originalBalance;
    if (!formAmountOwed.trim() || !isSignedMoneyAmount(balanceValue)) {
      setFormError(account("invalidBalance"));
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const updated = await updateSupplier(supplier.id, {
        name,
        phone: formPhone === originalPhone ? undefined : phone || null,
        address: formAddress.trim(),
        ...(balanceChanged ? { amountOwed: balanceValue } : {}),
      });
      setSupplier(updated);
      refresh();
      setIsFormOpen(false);
      setToast({ kind: "updated", variant: "success" });
    } catch (err: unknown) {
      const message = describeError(err, "Save failed");
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }, [supplier, formName, formPhone, originalPhone, shared, formAddress, formAmountOwed, originalBalance, account, refresh]);

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
    originalPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    formAmountOwed,
    setFormAmountOwed,
    isSaving,
    formError,
    submitForm,
    toast,
    clearToast: () => setToast(null),
  };
}
