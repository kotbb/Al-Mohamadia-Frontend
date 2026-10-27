"use client";

import type { DetailStatus } from "../types/use-purchase-detail.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  cancelPurchase,
  getPurchase,
} from "@/app/modules/purchases/services/purchases.service";
import type { PurchaseInvoiceDetail } from "@/app/modules/purchases/types/purchases.types";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import type { Item } from "@/app/modules/items/types/items.types";

export function usePurchaseDetail(purchaseId: string) {
  const describeError = useApiErrorMessage();
  const [purchase, setPurchase] = useState<PurchaseInvoiceDetail | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, Item>>({});
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Cancellation state
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    kind: "cancelled";
    variant: "success" | "danger";
  } | null>(null);

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    getPurchase(purchaseId, controller.signal)
      .then((doc) => {
        if (controller.signal.aborted) return;
        setPurchase(doc);
        const map: Record<string, Item> = {};
        for (const item of doc.items) map[item.id] = item;
        setItemsMap(map);
        setSupplier(doc.supplier);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(describeError(err, "Failed to load purchase invoice"));
      });

    return () => controller.abort();
  }, [purchaseId, tick]);

  function openCancelConfirm() {
    setIsCancelConfirmOpen(true);
    setCancelError(null);
  }

  function closeCancelConfirm() {
    setIsCancelConfirmOpen(false);
    setCancelError(null);
    setIsCancelling(false);
  }

  async function submitCancel(onSuccess?: () => void) {
    setIsCancelling(true);
    setCancelError(null);

    try {
      const updated = await cancelPurchase(purchaseId);
      setPurchase((previous) => previous?.id === updated.id ? { ...previous, ...updated } : previous);
      closeCancelConfirm();
      setToast({ kind: "cancelled", variant: "success" });
      onSuccess?.();
    } catch (e: unknown) {
      setCancelError(describeError(e, "Failed to cancel purchase"));
    } finally {
      setIsCancelling(false);
    }
  }

  function clearToast() {
    setToast(null);
  }

  return {
    purchase,
    supplier,
    itemsMap,
    status,
    error,
    refresh,

    isCancelConfirmOpen,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    isCancelling,
    cancelError,

    toast,
    clearToast,
  };
}
