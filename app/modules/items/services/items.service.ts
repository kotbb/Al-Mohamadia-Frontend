import { apiClient } from "@/lib/api/client";
import type {
  AddDimensionDefaultInput,
  ItemDimensionDefaultsResponse,
} from "../types/items.types";

import type {
  CreateItemInput,
  Item,
  ListItemsFilters,
  PriceHistoryEntry,
  UpdateItemInput,
  UpdateItemPricingInput,
} from "@/app/modules/items/types/items.types";

export function addItemDimensionDefault(
  itemId: string,
  input: AddDimensionDefaultInput,
): Promise<ItemDimensionDefaultsResponse> {
  return apiClient.post<ItemDimensionDefaultsResponse>(
    `/items/${itemId}/dimension-defaults`,
    input,
  );
}
function buildItemsQuery(filters?: ListItemsFilters): string {
  if (!filters) return "/items";
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }
  const query = params.toString();
  return query ? `/items?${query}` : "/items";
}

export async function listItems(
  filters?: ListItemsFilters,
  signal?: AbortSignal,
): Promise<Item[]> {
  return apiClient.get<Item[]>(buildItemsQuery(filters), { signal });
}

export async function getItem(id: string, signal?: AbortSignal): Promise<Item> {
  return apiClient.get<Item>(`/items/${id}`, { signal });
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  return apiClient.post<Item>("/items", input);
}

export async function updateItem(
  id: string,
  input: UpdateItemInput,
): Promise<Item> {
  return apiClient.patch<Item>(`/items/${id}`, input);
}

export async function updatePricing(
  id: string,
  input: UpdateItemPricingInput,
): Promise<Item> {
  return apiClient.patch<Item>(`/items/${id}/pricing`, input);
}

export async function getPriceHistory(
  id: string,
  signal?: AbortSignal,
): Promise<PriceHistoryEntry[]> {
  return apiClient.get<PriceHistoryEntry[]>(`/items/${id}/price-history`, {
    signal,
  });
}

export async function deleteItem(id: string): Promise<Item> {
  return apiClient.delete<Item>(`/items/${id}`);
}
