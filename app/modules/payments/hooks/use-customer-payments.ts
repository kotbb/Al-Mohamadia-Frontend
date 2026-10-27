"use client";

import type { ListStatus } from "../types/use-customer-payments.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  cancelPayment,
  listPayments,
} from "@/app/modules/payments/services/payments.service";
import type { Payment, PaymentListItem } from "@/app/modules/payments/types/payments.types";

const PAGE_SIZE = 10;

export function useCustomerPayments(customerId: string) {
  const describeError = useApiErrorMessage();
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [confirmPayment, setConfirmPayment] = useState<Payment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!customerId) return;

    const controller = new AbortController();
    setStatus("loading");

    listPayments(
      {
        customerId,
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
        const message = describeError(err, "Failed to load payments");
        setStatus("error");
        setError(message);
      });

    return () => controller.abort();
  }, [customerId, page, tick]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function openCancelConfirm(payment: Payment) {
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
      await cancelPayment(confirmPayment.id);
      setConfirmPayment(null);
      refresh();
      onSuccess?.();
    } catch (err: unknown) {
      const message = describeError(err, "Failed to cancel payment");
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
