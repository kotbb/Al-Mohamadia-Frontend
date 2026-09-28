"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { getCustomer, listCustomers } from "@/app/modules/customers/services/customers.service";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { cancelPayment, listPayments } from "@/app/modules/payments/services/payments.service";
import type {
  Payment,
  PaymentMethod,
  PaymentPeriod,
} from "@/app/modules/payments/types/payments.types";

type ListStatus = "idle" | "loading" | "success" | "error";
export type PaymentStatusFilterOption = "all" | "active" | "reversed";
export type PaymentMethodFilterOption = "all" | PaymentMethod;
export type PaymentPeriodFilterOption = "off" | PaymentPeriod;

export interface PaymentsToastState {
  kind: "cancelled";
  variant: "success" | "danger";
}

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function usePayments() {
  const describeError = useApiErrorMessage();
  const [payments, setPayments] = useState<Payment[]>([]);
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

  // Customer filter state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});

  // Cancel flow
  const [confirmPayment, setConfirmPayment] = useState<Payment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toast, setToast] = useState<PaymentsToastState | null>(null);

  // Debounce customer autocomplete search
  useEffect(() => {
    if (!customerSearch.trim() || selectedCustomer) {
      setCustomerSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearchingCustomers(true);
      listCustomers(
        { q: customerSearch.trim(), isActive: true, page: 1, limit: 5 },
        controller.signal,
      )
        .then((res) => {
          setCustomerSuggestions(res.items);
        })
        .catch(() => {
          if (!controller.signal.aborted) setCustomerSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearchingCustomers(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [customerSearch, selectedCustomer]);

  const refresh = useCallback(() => {
    setListStatus("loading");
    setListError(null);
    setTick((prev) => prev + 1);
  }, []);

  // Fetch payments list
  useEffect(() => {
    const controller = new AbortController();
    setListStatus("loading");

    listPayments(
      {
        type: "all",
        customerId: selectedCustomer ? selectedCustomer.id : undefined,
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
          describeError(err, "Failed to load payments");
        setListStatus("error");
        setListError(message);
      });

    return () => controller.abort();
  }, [
    selectedCustomer,
    statusFilter,
    methodFilter,
    periodFilter,
    periodDate,
    page,
    tick,
  ]);

  // Load customer names for table rows
  useEffect(() => {
    const ids = [
      ...new Set(
        payments
          .map((p) => p.customerId)
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
  }, [payments, customerNames]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function selectCustomer(customer: Customer) {
    setSelectedCustomer({ id: customer.id, name: customer.name });
    setCustomerSearch(customer.name);
    setCustomerSuggestions([]);
    setPage(1);
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerSuggestions([]);
    setPage(1);
  }

  function openCancelConfirm(payment: Payment) {
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
      await cancelPayment(confirmPayment.id);
      setConfirmPayment(null);
      setToast({ kind: "cancelled", variant: "success" });
      refresh();
    } catch (err: unknown) {
      const message =
        describeError(err, "Failed to cancel payment");
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
    customerSearch,
    setCustomerSearch,
    selectedCustomer,
    selectCustomer,
    clearCustomer,
    customerSuggestions,
    isSearchingCustomers,
    listStatus,
    listError,
    customerNames,
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
