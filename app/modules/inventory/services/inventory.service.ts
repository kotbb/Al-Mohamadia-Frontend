import { apiClient } from "@/lib/api/client";
import type {
  AdjustStockResult,
  CreateStockAdjustmentInput,
  InventoryValuation,
  ListStockFilters,
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
  if (filters.paginationMode) params.set("paginationMode", filters.paginationMode);
  const query = params.toString();
  return query ? `/inventory/stock?${query}` : "/inventory/stock";
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
): Promise<AdjustStockResult> {
  return apiClient.post<AdjustStockResult>("/inventory/adjustments", input);
}
