"use client";

import type { AsyncStatus } from "../types/use-inventory.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import {
  getInventoryValuation,
  getStockList,
} from "@/app/modules/inventory/services/inventory.service";
import type {
  InventoryValuation,
  ListStockFilters,
  StockItem,
  StockListMeta,
  StockListSummary,
  StockStatusFilter,
} from "@/app/modules/inventory/types/inventory.types";
import { listCategories } from "@/app/modules/items/services/categories.service";
import type { Category } from "@/app/modules/items/types/items.types";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

export function useInventory() {
  const describeError = useApiErrorMessage();
  // Stock list state
  const [items, setItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<StockListSummary>({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    negativeStockCount: 0,
    normalStockCount: 0,
  });
  const [meta, setMeta] = useState<StockListMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [listStatus, setListStatus] = useState<AsyncStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);

  // Valuation state
  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [valuationStatus, setValuationStatus] =
    useState<AsyncStatus>("loading");
  const [valuationError, setValuationError] = useState<string | null>(null);

  // Categories list for dropdown
  const [categories, setCategories] = useState<Category[]>([]);

  // Refresh trigger
  const [tick, setTick] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Load categories
  useEffect(() => {
    const controller = new AbortController();
    listCategories(controller.signal)
      .then((data) => {
        setCategories(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Fetch valuation
  useEffect(() => {
    const controller = new AbortController();
    setValuationStatus("loading");
    setValuationError(null);

    getInventoryValuation(controller.signal)
      .then((data) => {
        setValuation(data);
        setValuationStatus("success");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setValuationStatus("error");
        setValuationError(describeError(err, "Failed to load valuation"));
      });

    return () => controller.abort();
  }, [tick]);

  // Fetch stock list
  useEffect(() => {
    const controller = new AbortController();
    setListStatus("loading");
    setListError(null);

    const filters: ListStockFilters = {
      page,
      limit: PAGE_SIZE,
    };

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (statusFilter !== "all") {
      filters.stockStatus = statusFilter;
    }

    if (debouncedSearch) {
      filters.q = debouncedSearch;
    }

    getStockList(filters, controller.signal)
      .then((res) => {
        setItems(res.items);
        setMeta(res.meta);
        setSummary(res.summary);
        setListStatus("success");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setListStatus("error");
        setListError(describeError(err, "Failed to load stock list"));
      });

    return () => controller.abort();
  }, [page, categoryId, statusFilter, debouncedSearch, tick]);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / PAGE_SIZE));

  return {
    items,
    summary,
    meta,
    page,
    totalPages,
    setPage,

    categoryId,
    setCategoryId: (id: string) => {
      setCategoryId(id);
      setPage(1);
    },

    statusFilter,
    setStatusFilter: (sf: StockStatusFilter) => {
      setStatusFilter(sf);
      setPage(1);
    },

    searchInput,
    setSearchInput,

    categories,

    listStatus,
    listError,

    valuation,
    valuationStatus,
    valuationError,

    refresh,
  };
}
