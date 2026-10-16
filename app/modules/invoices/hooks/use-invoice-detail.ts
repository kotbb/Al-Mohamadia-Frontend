"use client";

import type { Status } from "../types/use-invoice-detail.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { getCustomer } from "@/app/modules/customers/services/customers.service";
import {
  cancelSalesInvoice,
  getSalesInvoice,
} from "@/app/modules/invoices/services/invoices.service";
import type { SalesInvoice } from "@/app/modules/invoices/types/invoices.types";
import { getItem, listItems } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";

export function useInvoiceDetail(invoiceId: string) {
  const describeError = useApiErrorMessage();
  const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [itemsById, setItemsById] = useState<Record<string, Item>>({});
  const [tick, setTick] = useState(0);

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toastKind, setToastKind] = useState<"cancelled" | "updated" | null>(
    null,
  );

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setTick((value) => value + 1);
  }, []);

  const notifyUpdated = useCallback(() => {
    setToastKind("updated");
    refresh();
  }, [refresh]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    Promise.all([
      getSalesInvoice(invoiceId, controller.signal),
      listItems(undefined, controller.signal),
    ])
      .then(async ([doc, items]) => {
        setInvoice(doc);
        const map: Record<string, Item> = {};
        for (const item of items) map[item.id] = item;
        setItemsById(map);

        if (doc.type === "cash_sale" || !doc.customerId) {
          setCustomerName(null);
        } else {
          try {
            const customer = await getCustomer(
              doc.customerId,
              controller.signal,
            );
            setCustomerName(customer.name);
          } catch {
            setCustomerName("-");
          }
        }

        const missingItemIds = [
          ...new Set(doc.lines.map((l) => l.itemId).filter((id) => !map[id])),
        ];
        if (missingItemIds.length > 0) {
          await Promise.all(
            missingItemIds.map(async (id) => {
              try {
                const fetched = await getItem(id, controller.signal);
                map[fetched.id] = fetched;
              } catch {}
            }),
          );
          setItemsById({ ...map });
        }

        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(describeError(err, "Failed to load invoice"));
      });

    return () => controller.abort();
  }, [invoiceId, tick]);

  function openCancel() {
    setCancelError(null);
    setIsCancelOpen(true);
  }

  function closeCancel() {
    if (isCancelling) return;
    setIsCancelOpen(false);
    setCancelError(null);
  }

  async function submitCancel() {
    if (!invoice) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelSalesInvoice(invoice.id);
      setInvoice(updated);
      setIsCancelOpen(false);
      setToastKind("cancelled");
    } catch (err: unknown) {
      setCancelError(describeError(err, "Cancel failed"));
    } finally {
      setIsCancelling(false);
    }
  }

  return {
    invoice,
    status,
    error,
    refresh,
    customerName,
    itemsById,
    isCancelOpen,
    openCancel,
    closeCancel,
    submitCancel,
    isCancelling,
    cancelError,
    toastKind,
    clearToast: () => setToastKind(null),
    notifyUpdated,
  };
}
