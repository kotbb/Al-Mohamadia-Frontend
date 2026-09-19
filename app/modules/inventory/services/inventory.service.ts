import { apiClient } from "@/lib/api/client";
import type {
  CreateStockAdjustmentInput,
  InventoryValuation,
  ListAdjustmentsFilters,
  ListStockFilters,
  StockAdjustment,
  StockAdjustmentListResponse,
  StockListResponse,
} from "@/app/modules/inventory/types/inventory.types";

function buildStockQuery(filters?: ListStockFilters): string {
  if (!filters) return "/inventory/stock";
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.stockStatus && filters.stockStatus !== "all") {
    params.set("stockStatus", filters.stockStatus);
  }
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/inventory/stock?${query}` : "/inventory/stock";
}

function buildAdjustmentsQuery(filters?: ListAdjustmentsFilters): string {
  if (!filters) return "/inventory/adjustments";
  const params = new URLSearchParams();
  if (filters.itemId) params.set("itemId", filters.itemId);
  if (filters.period && filters.date) {
    params.set("period", filters.period);
    params.set("date", filters.date);
  }
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/inventory/adjustments?${query}` : "/inventory/adjustments";
}

export async function getStockList(
  filters?: ListStockFilters,
  signal?: AbortSignal,
): Promise<StockListResponse> {
  return apiClient.get<StockListResponse>(buildStockQuery(filters), { signal });
}

export async function getInventoryValuation(
  signal?: AbortSignal,
): Promise<InventoryValuation> {
  return apiClient.get<InventoryValuation>("/inventory/valuation", { signal });
}

export async function createStockAdjustment(
  input: CreateStockAdjustmentInput,
): Promise<StockAdjustment> {
  return apiClient.post<StockAdjustment>("/inventory/adjustments", input);
}

export async function getStockAdjustments(
  filters?: ListAdjustmentsFilters,
  signal?: AbortSignal,
): Promise<StockAdjustmentListResponse> {
  return apiClient.get<StockAdjustmentListResponse>(
    buildAdjustmentsQuery(filters),
    { signal },
  );
}

export async function getStockAdjustment(
  id: string,
  signal?: AbortSignal,
): Promise<StockAdjustment> {
  return apiClient.get<StockAdjustment>(`/inventory/adjustments/${id}`, {
    signal,
  });
}
