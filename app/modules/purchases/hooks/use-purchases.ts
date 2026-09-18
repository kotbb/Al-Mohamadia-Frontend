"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/types";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import {
  cancelPurchase,
  listPurchases,
} from "@/app/modules/purchases/services/purchases.service";
import type {
  ListPurchasesFilters,
  PurchaseInvoice,
  PurchaseInvoiceStatus,
} from "@/app/modules/purchases/types/purchases.types";
import {
  getSupplier,
  listSuppliers,
} from "@/app/modules/suppliers/services/suppliers.service";

type ListStatus = "idle" | "loading" | "success" | "error";
export type PurchaseStatusFilterOption = "all" | PurchaseInvoiceStatus;
export type PurchasePeriodFilterOption = "off" | "day" | "week" | "month" | "year";

export interface PurchasesToastState {
  kind: "cancelled" | "created";
  variant: "success" | "danger";
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface UsePurchasesOptions {
  supplierId?: string;
  pageSize?: number;
}

export function usePurchases(options?: UsePurchasesOptions) {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
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
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});

  // Cancel invoice state
  const [confirmPurchase, setConfirmPurchase] = useState<PurchaseInvoice | null>(
    null,
  );
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

  // Load suppliers map for readable names
  useEffect(() => {
    const controller = new AbortController();
    listSuppliers({ page: 1, limit: 100 }, controller.signal)
      .then((res) => {
        const map: Record<string, string> = {};
        for (const s of res.items) {
          map[s.id] = s.name;
        }
        setSupplierNames((prev) => ({ ...prev, ...map }));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

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

    if (periodFilter !== "off") {
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

        // Fetch supplier names for unknown supplierId
        const missingIds = res.items
          .map((p) => p.supplierId)
          .filter((id) => Boolean(id));

        if (missingIds.length > 0) {
          const uniqueMissing = [...new Set(missingIds)];
          Promise.all(
            uniqueMissing.map((id) =>
              getSupplier(id).catch(() => null),
            ),
          ).then((results) => {
            const updates: Record<string, string> = {};
            for (const item of results) {
              if (item) updates[item.id] = item.name;
            }
            if (Object.keys(updates).length > 0) {
              setSupplierNames((prev) => ({ ...prev, ...updates }));
            }
          });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setListStatus("error");
        setListError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load purchases",
        );
      });

    return () => controller.abort();
  }, [
    page,
    pageSize,
    statusFilter,
    supplierIdFilter,
    periodFilter,
    periodDate,
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
      setConfirmError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to cancel purchase",
      );
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
    supplierNames,
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
