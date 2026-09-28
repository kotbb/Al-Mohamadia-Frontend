"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { getCustomer } from "@/app/modules/customers/services/customers.service";
import {
  cancelSalesInvoice,
  getSalesInvoiceShare,
  listSalesInvoices,
} from "@/app/modules/invoices/services/invoices.service";
import type {
  SalesInvoice,
  SalesInvoicePeriod,
  SalesInvoiceStatus,
} from "@/app/modules/invoices/types/invoices.types";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";

type ListStatus = "idle" | "loading" | "success" | "error";
export type StatusFilter = "all" | SalesInvoiceStatus;
export type PeriodFilter = "off" | SalesInvoicePeriod;
export type InvoicesToastKind = "cancelled" | "created" | "updated";

export interface InvoicesToastState {
  kind: InvoicesToastKind;
  variant: "success" | "danger";
}

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function useInvoices() {
  const describeError = useApiErrorMessage();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summaryTotalAmount, setSummaryTotalAmount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("off");
  const [periodDate, setPeriodDate] = useState(todayIsoDate());
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>(
    {},
  );
  const [toast, setToast] = useState<InvoicesToastState | null>(null);
  const [confirmInvoice, setConfirmInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    setListStatus("loading");

    listSalesInvoices(
      {
        q: debouncedQ || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        period: periodFilter === "off" ? undefined : periodFilter,
        date: periodFilter === "off" ? undefined : periodDate,
        page,
        limit: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        setInvoices(result.items);
        setTotal(result.meta.total);
        setSummaryTotalAmount(result.summary?.totalAmount ?? 0);
        setListStatus("success");
        setListError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          describeError(error, "Failed to load invoices");
        setListStatus("error");
        setListError(message);
      });

    return () => controller.abort();
  }, [debouncedQ, statusFilter, periodFilter, periodDate, page, tick]);

  useEffect(() => {
    const ids = [
      ...new Set(
        invoices
          .map((invoice) => invoice.customerId)
          .filter((id): id is string => Boolean(id)),
      ),
    ].filter((id) => customerNames[id] === undefined);

    if (ids.length === 0) return;

    const controller = new AbortController();
    Promise.all(
      ids.map(async (id) => {
        try {
          const customer = await getCustomer(id, controller.signal);
          return [id, customer.name] as const;
        } catch {
          return [id, "-"] as const;
        }
      }),
    ).then((entries) => {
      if (controller.signal.aborted) return;
      setCustomerNames((prev) => {
        const next = { ...prev };
        for (const [id, name] of entries) next[id] = name;
        return next;
      });
    });

    return () => controller.abort();
  }, [invoices, customerNames]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function clearToast() {
    setToast(null);
  }

  function openCancelConfirm(invoice: SalesInvoice) {
    setConfirmInvoice(invoice);
    setConfirmError(null);
  }

  function closeCancelConfirm() {
    if (isConfirming) return;
    setConfirmInvoice(null);
    setConfirmError(null);
  }

  async function submitCancel() {
    if (!confirmInvoice) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await cancelSalesInvoice(confirmInvoice.id);
      setConfirmInvoice(null);
      setToast({ kind: "cancelled", variant: "success" });
      refresh();
    } catch (error: unknown) {
      const message =
        describeError(error, "Cancel failed");
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  }

  async function shareInvoice(invoice: SalesInvoice) {
    setActionError(null);
    try {
      const payload = await getSalesInvoiceShare(invoice.id);
      window.open(payload.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error: unknown) {
      const message =
        describeError(error, "Share failed");
      setActionError(message);
    }
  }

  return {
    invoices,
    customerNames,
    summaryTotalAmount,
    page,
    totalPages,
    setPage,
    statusFilter,
    setStatusFilter: (value: StatusFilter) => {
      setStatusFilter(value);
      setPage(1);
    },
    periodFilter,
    setPeriodFilter: (value: PeriodFilter) => {
      setPeriodFilter(value);
      setPage(1);
    },
    periodDate,
    setPeriodDate: (value: string) => {
      setPeriodDate(value);
      setPage(1);
    },
    searchInput,
    setSearchInput,
    listStatus,
    listError,
    refresh,
    toast,
    clearToast,
    showToast: (t: InvoicesToastState) => setToast(t),
    confirmInvoice,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    isConfirming,
    confirmError,
    shareInvoice,
    actionError,
    clearActionError: () => setActionError(null),
  };
}
