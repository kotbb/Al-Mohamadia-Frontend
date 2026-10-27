"use client";

import type { ListStatus } from "../types/use-supplier-account-payments.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  cancelSupplierPayment,
  listSupplierPayments,
} from "@/app/modules/supplier-payments/services/supplier-payments.service";
import type { SupplierPayment, SupplierPaymentListItem } from "@/app/modules/supplier-payments/types/supplier-payments.types";

const PAGE_SIZE = 10;

export function useSupplierAccountPayments(supplierId: string) {
  const describeError = useApiErrorMessage();
  const [payments, setPayments] = useState<SupplierPaymentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [confirmPayment, setConfirmPayment] = useState<SupplierPayment | null>(
    null,
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!supplierId) return;

    const controller = new AbortController();
    setStatus("loading");

    listSupplierPayments(
      {
        supplierId,
        status: "all",
        type: "all",
        page,
        limit: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        setPayments(result.items);
        setTotal(result.meta.total);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(err, "Failed to load supplier payments");
        setStatus("error");
        setError(message);
      });

    return () => controller.abort();
  }, [supplierId, page, tick]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function openCancelConfirm(payment: SupplierPayment) {
    setConfirmPayment(payment);
    setCancelError(null);
  }

  function closeCancelConfirm() {
    if (isCancelling) return;
    setConfirmPayment(null);
    setCancelError(null);
  }

  async function submitCancel(onSuccess?: () => void) {
    if (!confirmPayment) return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      await cancelSupplierPayment(confirmPayment.id);
      setConfirmPayment(null);
      refresh();
      onSuccess?.();
    } catch (err: unknown) {
      const message = describeError(err, "Failed to cancel supplier payment");
      setCancelError(message);
    } finally {
      setIsCancelling(false);
    }
  }

  return {
    payments,
    total,
    page,
    setPage,
    totalPages,
    status,
    error,
    refresh,
    confirmPayment,
    isCancelling,
    cancelError,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
  };
}
