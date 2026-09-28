"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { getDashboard } from "@/app/modules/dashboard/services/dashboard.service";
import type {
  DashboardResponse,
  SalesInvoicePeriod,
} from "@/app/modules/dashboard/types/dashboard.types";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";

type AsyncStatus = "idle" | "loading" | "success" | "error";

export function useDashboard() {
  const describeError = useApiErrorMessage();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<SalesInvoicePeriod>("month");
  const [periodDate, setPeriodDate] = useState(todayIsoDate());
  const [tick, setTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    setIsRefreshing(true);
    // Keep prior success UI (incl. period controls) while refetching.
    setStatus((current) => (current === "success" ? current : "loading"));

    getDashboard({ period, date: periodDate }, controller.signal)
      .then((response) => {
        setData(response);
        setStatus("success");
        setIsRefreshing(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setData(null);
        setIsRefreshing(false);
        setError(describeError(err, "Failed to load dashboard"));
      });

    return () => controller.abort();
  }, [period, periodDate, tick, describeError]);

  return {
    data,
    status,
    error,
    period,
    setPeriod,
    periodDate,
    setPeriodDate,
    isRefreshing,
    refresh,
  };
}
