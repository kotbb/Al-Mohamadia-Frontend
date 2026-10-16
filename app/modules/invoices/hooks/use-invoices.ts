"use client";

import type {
  ListStatus,
  StatusFilter,
  PeriodFilter,
  InvoicesToastState,
} from "../types/use-invoices.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { getCustomer } from "@/app/modules/customers/services/customers.service";
import {
  cancelSalesInvoice,
  listSalesInvoices,
} from "@/app/modules/invoices/services/invoices.service";
import type { SalesInvoice } from "@/app/modules/invoices/types/invoices.types";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";

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
  const [customRange, setCustomRange] = useState(() => { const today = todayIsoDate(); return { from: `${today.slice(0, 7)}-01`, to: today }; });
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
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
  const requestKey = JSON.stringify([
    debouncedQ,
    statusFilter,
    periodFilter,
    periodDate,
    customRange.from,
    customRange.to,
    page,
    tick,
  ]);
  const hasLoaded = loadedRequestKey !== null;
  const actionsDisabled =
    loadedRequestKey !== requestKey || listStatus !== "success";
  const isRefreshing = hasLoaded && listStatus !== "error" && actionsDisabled;

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
    setListError(null);

    listSalesInvoices(
      {
        q: debouncedQ || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        period: periodFilter !== "off" && periodFilter !== "custom" ? periodFilter : undefined,
        date: periodFilter !== "off" && periodFilter !== "custom" ? periodDate : undefined,
        from: periodFilter === "custom" ? customRange.from : undefined,
        to: periodFilter === "custom" ? customRange.to : undefined,
        page,
        limit: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setInvoices(result.items);
        setTotal(result.meta.total);
        setSummaryTotalAmount(result.summary?.totalAmount ?? 0);
        setListStatus("success");
        setLoadedRequestKey(requestKey);
        setListError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(error, "Failed to load invoices");
        setListStatus("error");
        setListError(message);
      });

    return () => controller.abort();
  }, [
    debouncedQ,
    statusFilter,
    periodFilter,
    periodDate,
    customRange,
    page,
    tick,
    requestKey,
    describeError,
  ]);

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
      const message = describeError(error, "Cancel failed");
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
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
    customRange,
    setCustomRange: (from: string, to: string) => { setCustomRange({ from, to }); setPage(1); },
    setPeriodDate: (value: string) => {
      setPeriodDate(value);
      setPage(1);
    },
    searchInput,
    setSearchInput,
    listStatus,
    hasLoaded,
    isRefreshing,
    actionsDisabled,
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
  };
}
