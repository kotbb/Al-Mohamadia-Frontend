"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/types";
import {
  cancelPurchase,
  getPurchase,
} from "@/app/modules/purchases/services/purchases.service";
import type { PurchaseInvoice } from "@/app/modules/purchases/types/purchases.types";
import { getSupplier } from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { listItems } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";

type DetailStatus = "idle" | "loading" | "success" | "error";

export function usePurchaseDetail(purchaseId: string) {
  const [purchase, setPurchase] = useState<PurchaseInvoice | null>(null);
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

    Promise.all([
      getPurchase(purchaseId, controller.signal),
      listItems({}, controller.signal).catch(() => [] as Item[]),
    ])
      .then(async ([invoice, items]) => {
        setPurchase(invoice);

        const map: Record<string, Item> = {};
        for (const it of items) {
          map[it.id] = it;
        }
        setItemsMap(map);

        try {
          const supp = await getSupplier(invoice.supplierId, controller.signal);
          setSupplier(supp);
        } catch {
          setSupplier(null);
        }

        setStatus("success");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load purchase invoice",
        );
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
      setPurchase(updated);
      closeCancelConfirm();
      setToast({ kind: "cancelled", variant: "success" });
      onSuccess?.();
    } catch (e: unknown) {
      setCancelError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to cancel purchase",
      );
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
