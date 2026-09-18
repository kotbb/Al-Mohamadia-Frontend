"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/types";
import { getSupplier, listSuppliers } from "@/app/modules/suppliers/services/suppliers.service";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import {
  cancelSupplierPayment,
  listSupplierPayments,
} from "@/app/modules/supplier-payments/services/supplier-payments.service";
import type {
  SupplierPayment,
  PaymentMethod,
  PaymentPeriod,
} from "@/app/modules/supplier-payments/types/supplier-payments.types";

type ListStatus = "idle" | "loading" | "success" | "error";
export type PaymentStatusFilterOption = "all" | "active" | "reversed";
export type PaymentMethodFilterOption = "all" | PaymentMethod;
export type PaymentPeriodFilterOption = "off" | PaymentPeriod;

export interface SupplierPaymentsToastState {
  kind: "cancelled";
  variant: "success" | "danger";
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function useSupplierPayments() {
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [summaryTotal, setSummaryTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] =
    useState<PaymentStatusFilterOption>("all");
  const [methodFilter, setMethodFilter] =
    useState<PaymentMethodFilterOption>("all");
  const [periodFilter, setPeriodFilter] =
    useState<PaymentPeriodFilterOption>("off");
  const [periodDate, setPeriodDate] = useState(todayIsoDate());

  // Supplier filter state
  const [supplierSearch, setSupplierSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [supplierSuggestions, setSupplierSuggestions] = useState<Supplier[]>([]);
  const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);

  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});

  // Cancel flow
  const [confirmPayment, setConfirmPayment] = useState<SupplierPayment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toast, setToast] = useState<SupplierPaymentsToastState | null>(null);

  // Debounce supplier autocomplete search
  useEffect(() => {
    if (!supplierSearch.trim() || selectedSupplier) {
      setSupplierSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearchingSuppliers(true);
      listSuppliers(
        { q: supplierSearch.trim(), isActive: true, page: 1, limit: 5 },
        controller.signal,
      )
        .then((res) => {
          setSupplierSuggestions(res.items);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSupplierSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearchingSuppliers(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [supplierSearch, selectedSupplier]);

  const refresh = useCallback(() => {
    setListStatus("loading");
    setListError(null);
    setTick((prev) => prev + 1);
  }, []);

  // Fetch supplier payments list
  useEffect(() => {
    const controller = new AbortController();
    setListStatus("loading");

    listSupplierPayments(
      {
        type: "all",
        supplierId: selectedSupplier ? selectedSupplier.id : undefined,
        status: statusFilter,
        method: methodFilter === "all" ? undefined : methodFilter,
        period: periodFilter === "off" ? undefined : periodFilter,
        date: periodFilter === "off" ? undefined : periodDate,
        page,
        limit: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        setPayments(result.items);
        setTotal(result.meta.total);
        setSummaryTotal(result.summary.totalAmount);
        setListStatus("success");
        setListError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load supplier payments";
        setListStatus("error");
        setListError(message);
      });

    return () => controller.abort();
  }, [
    selectedSupplier,
    statusFilter,
    methodFilter,
    periodFilter,
    periodDate,
    page,
    tick,
  ]);

  // Load supplier names for table rows
  useEffect(() => {
    const ids = [
      ...new Set(
        payments
          .map((p) => p.supplierId)
          .filter((id): id is string => Boolean(id)),
      ),
    ].filter((id) => supplierNames[id] === undefined);

    if (ids.length === 0) return;

    const controller = new AbortController();
    Promise.all(
      ids.map(async (id) => {
        try {
          const supplier = await getSupplier(id, controller.signal);
          return [id, supplier.name] as const;
        } catch {
          return [id, "-"] as const;
        }
      }),
    ).then((entries) => {
      if (controller.signal.aborted) return;
      setSupplierNames((prev) => {
        const next = { ...prev };
        for (const [id, name] of entries) next[id] = name;
        return next;
      });
    });

    return () => controller.abort();
  }, [payments, supplierNames]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function selectSupplier(supplier: Supplier) {
    setSelectedSupplier({ id: supplier.id, name: supplier.name });
    setSupplierSearch(supplier.name);
    setSupplierSuggestions([]);
    setPage(1);
  }

  function clearSupplier() {
    setSelectedSupplier(null);
    setSupplierSearch("");
    setSupplierSuggestions([]);
    setPage(1);
  }

  function openCancelConfirm(payment: SupplierPayment) {
    setConfirmPayment(payment);
    setCancelError(null);
  }

  function closeCancelConfirm() {
    if (isCancelling) return;
    setConfirmPayment(null);
    setCancelError(null);
  }

  async function submitCancel() {
    if (!confirmPayment) return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      await cancelSupplierPayment(confirmPayment.id);
      setConfirmPayment(null);
      setToast({ kind: "cancelled", variant: "success" });
      refresh();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to cancel supplier payment";
      setCancelError(message);
    } finally {
      setIsCancelling(false);
    }
  }

  function clearToast() {
    setToast(null);
  }

  return {
    payments,
    total,
    summaryTotal,
    page,
    setPage,
    totalPages,
    statusFilter,
    setStatusFilter: (val: PaymentStatusFilterOption) => {
      setStatusFilter(val);
      setPage(1);
    },
    methodFilter,
    setMethodFilter: (val: PaymentMethodFilterOption) => {
      setMethodFilter(val);
      setPage(1);
    },
    periodFilter,
    setPeriodFilter: (val: PaymentPeriodFilterOption) => {
      setPeriodFilter(val);
      setPage(1);
    },
    periodDate,
    setPeriodDate: (val: string) => {
      setPeriodDate(val);
      setPage(1);
    },
    supplierSearch,
    setSupplierSearch,
    selectedSupplier,
    selectSupplier,
    clearSupplier,
    supplierSuggestions,
    isSearchingSuppliers,
    listStatus,
    listError,
    supplierNames,
    refresh,
    confirmPayment,
    isCancelling,
    cancelError,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    toast,
    clearToast,
  };
}
