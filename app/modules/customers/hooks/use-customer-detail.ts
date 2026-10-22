"use client";

import { isOptionalMobile, normalizeMobile } from "@/app/modules/shared/utils/egyptian-mobile";
import { isSignedMoneyAmount } from "@/app/modules/shared/utils/money-validation";
import { useTranslations } from "next-intl";

import type {
  DetailStatus,
  CustomerDetailToastKind,
} from "../types/use-customer-detail.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  getCustomer,
  updateCustomer,
} from "@/app/modules/customers/services/customers.service";
import type { Customer } from "@/app/modules/customers/types/customers.types";

export function useCustomerDetail(id: string) {
  const describeError = useApiErrorMessage();
  const shared = useTranslations("shared");
  const account = useTranslations("accountDetails");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [originalBalance, setOriginalBalance] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormBalance(String(customer.balance));
    setOriginalBalance(customer.balance);
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
      setFormError(account("nameRequired"));
      return;
    }
    const balanceValue = Number(formBalance);
    const balanceChanged = balanceValue !== originalBalance;
    if (!formBalance.trim() || !isSignedMoneyAmount(balanceValue)) {
      setFormError(account("invalidBalance"));
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const updated = await updateCustomer(customer.id, {
        name,
        phone: formPhone === originalPhone ? undefined : phone || null,
        address: formAddress.trim(),
        ...(balanceChanged ? { balance: balanceValue } : {}),
      });
      setCustomer(updated);
      refresh();
      setIsFormOpen(false);
      setToast({ kind: "updated", variant: "success" });
    } catch (err: unknown) {
      const message = describeError(err, "Save failed");
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }, [customer, formName, formPhone, originalPhone, shared, formAddress, formBalance, originalBalance, account, refresh]);

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
    formBalance,
    setFormBalance,
    isSaving,
    formError,
    submitForm,
    toast,
    clearToast: () => setToast(null),
  };
}
