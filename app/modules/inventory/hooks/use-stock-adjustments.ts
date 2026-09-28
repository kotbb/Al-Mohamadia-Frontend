"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { getStockAdjustments } from "@/app/modules/inventory/services/inventory.service";
import type {
  ListAdjustmentsFilters,
  StockAdjustment,
  StockAdjustmentListMeta,
} from "@/app/modules/inventory/types/inventory.types";

export type AdjustmentPeriodFilter = "off" | "day" | "week" | "month" | "year";

type AsyncStatus = "idle" | "loading" | "success" | "error";

const PAGE_SIZE = 10;

interface UseStockAdjustmentsOptions {
  itemId?: string;
  pageSize?: number;
}

export function useStockAdjustments(options?: UseStockAdjustmentsOptions) {
  const describeError = useApiErrorMessage();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [meta, setMeta] = useState<StockAdjustmentListMeta>({
    page: 1,
    limit: options?.pageSize ?? PAGE_SIZE,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  const [itemIdFilter, setItemIdFilter] = useState<string>(options?.itemId ?? "");
  const [periodFilter, setPeriodFilter] = useState<AdjustmentPeriodFilter>("off");
  const [periodDate, setPeriodDate] = useState(todayIsoDate());

  const [listStatus, setListStatus] = useState<AsyncStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (options?.itemId !== undefined) {
      setItemIdFilter(options.itemId);
      setPage(1);
    }
  }, [options?.itemId]);

  useEffect(() => {
    const controller = new AbortController();
    setListStatus("loading");
    setListError(null);

    const filters: ListAdjustmentsFilters = {
      page,
      limit: pageSize,
    };

    const targetItemId = options?.itemId || itemIdFilter;
    if (targetItemId) {
      filters.itemId = targetItemId;
    }

    if (periodFilter !== "off") {
      filters.period = periodFilter.toUpperCase() as "DAY" | "WEEK" | "MONTH" | "YEAR";
      filters.date = periodDate;
    }

    getStockAdjustments(filters, controller.signal)
      .then((res) => {
        setAdjustments(res.items);
        setMeta(res.meta);
        setListStatus("success");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setListStatus("error");
        setListError(
          describeError(err, "Failed to load stock adjustments"),
        );
      });

    return () => controller.abort();
  }, [page, pageSize, options?.itemId, itemIdFilter, periodFilter, periodDate, tick]);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / pageSize));

  return {
    adjustments,
    meta,
    page,
    totalPages,
    setPage,

    itemIdFilter,
    setItemIdFilter: (id: string) => {
      setItemIdFilter(id);
      setPage(1);
    },

    periodFilter,
    setPeriodFilter: (p: AdjustmentPeriodFilter) => {
      setPeriodFilter(p);
      setPage(1);
    },

    periodDate,
    setPeriodDate: (d: string) => {
      setPeriodDate(d);
      setPage(1);
    },

    listStatus,
    listError,
    refresh,
  };
}
