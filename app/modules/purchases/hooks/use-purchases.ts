"use client";

import type {
  ListStatus,
  PurchaseStatusFilterOption,
  PurchasePeriodFilterOption,
  PurchasesToastState,
  UsePurchasesOptions,
} from "../types/use-purchases.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import {
  cancelPurchase,
  listPurchases,
} from "@/app/modules/purchases/services/purchases.service";
import type {
  ListPurchasesFilters,
  PurchaseInvoice,
  PurchaseInvoiceListItem,
} from "@/app/modules/purchases/types/purchases.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function usePurchases(options?: UsePurchasesOptions) {
  const describeError = useApiErrorMessage();
  const [purchases, setPurchases] = useState<PurchaseInvoiceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [summaryTotalAmount, setSummaryTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  const [statusFilter, setStatusFilter] =
    useState<PurchaseStatusFilterOption>("all");
  const [supplierIdFilter, setSupplierIdFilter] = useState<string>(
    options?.supplierId ?? "",
  );
  const [periodFilter, setPeriodFilter] =
    useState<PurchasePeriodFilterOption>("off");
  const [periodDate, setPeriodDate] = useState(todayIsoDate());
  const [customRange, setCustomRange] = useState(() => { const today = todayIsoDate(); return { from: `${today.slice(0, 7)}-01`, to: today }; });
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);


  // Cancel invoice state
  const [confirmPurchase, setConfirmPurchase] =
    useState<PurchaseInvoice | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [toast, setToast] = useState<PurchasesToastState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const refresh = useCallback(() => {
    setListStatus("loading");
    setListError(null);
    setTick((t) => t + 1);
  }, []);

  // Fetch purchases
  useEffect(() => {
    const controller = new AbortController();

    const filters: ListPurchasesFilters = {
      page,
      limit: pageSize,
    };

    if (options?.supplierId) {
      filters.supplierId = options.supplierId;
    } else if (supplierIdFilter) {
      filters.supplierId = supplierIdFilter;
    }

    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }

    if (periodFilter === "custom") {
      filters.from = customRange.from;
      filters.to = customRange.to;
    } else if (periodFilter !== "off") {
      filters.period = periodFilter;
      filters.date = periodDate;
    }

    if (debouncedSearch) {
      filters.q = debouncedSearch;
    }

    listPurchases(filters, controller.signal)
      .then((res) => {
        setPurchases(res.items);
        setTotal(res.meta.total);
        setSummaryTotalAmount(res.summary?.totalAmount ?? 0);
        setListStatus("success");


      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setListStatus("error");
        setListError(describeError(err, "Failed to load purchases"));
      });

    return () => controller.abort();
  }, [
    page,
    pageSize,
    statusFilter,
    supplierIdFilter,
    periodFilter,
    periodDate,
    customRange,
    debouncedSearch,
    options?.supplierId,
    tick,
  ]);

  function openCancelConfirm(purchase: PurchaseInvoice) {
    setConfirmPurchase(purchase);
    setConfirmError(null);
  }

  function closeCancelConfirm() {
    setConfirmPurchase(null);
    setConfirmError(null);
    setIsConfirming(false);
  }

  async function submitCancel(onSuccess?: () => void) {
    if (!confirmPurchase) return;
    setIsConfirming(true);
    setConfirmError(null);

    try {
      await cancelPurchase(confirmPurchase.id);
      closeCancelConfirm();
      setToast({ kind: "cancelled", variant: "success" });
      refresh();
      onSuccess?.();
    } catch (e: unknown) {
      setConfirmError(describeError(e, "Failed to cancel purchase"));
    } finally {
      setIsConfirming(false);
    }
  }

  function showToast(next: PurchasesToastState) {
    setToast(next);
  }

  function clearToast() {
    setToast(null);
  }

  function clearActionError() {
    setActionError(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    purchases,
    total,
    summaryTotalAmount,
    page,
    totalPages,
    setPage,

    statusFilter,
    setStatusFilter: (s: PurchaseStatusFilterOption) => {
      setStatusFilter(s);
      setPage(1);
    },
    supplierIdFilter,
    setSupplierIdFilter: (s: string) => {
      setSupplierIdFilter(s);
      setPage(1);
    },
    periodFilter,
    setPeriodFilter: (p: PurchasePeriodFilterOption) => {
      setPeriodFilter(p);
      setPage(1);
    },
    periodDate,
    customRange,
    setCustomRange: (from: string, to: string) => { setCustomRange({ from, to }); setPage(1); },
    setPeriodDate: (d: string) => {
      setPeriodDate(d);
      setPage(1);
    },
    searchInput,
    setSearchInput,

    listStatus,
    listError,
    refresh,

    confirmPurchase,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    isConfirming,
    confirmError,

    toast,
    showToast,
    clearToast,
    actionError,
    clearActionError,
  };
}
