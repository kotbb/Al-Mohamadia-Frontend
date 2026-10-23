export type InventoryPricingMode =
  | "per_piece"
  | "per_cubic_meter"
  | "PIECE"
  | "CUBIC_METER";

export function isCubicPricingMode(mode?: string): boolean {
  return mode === "per_cubic_meter" || mode === "CUBIC_METER";
}

export type StockStatusFilter =
  | "all"
  | "normal"
  | "low_stock"
  | "out_of_stock"
  | "negative_stock";

export interface StockItemCategory {
  id: string;
  name: string;
}

export interface StockItem {
  id: string;
  name: string;
  categoryId: string;
  category: StockItemCategory | null;
  isWood: boolean;
  pricingMode: InventoryPricingMode;
  unitPrice: number;
  cost: number;
  stockQuantity: number;
  reorderThreshold: number;
  isActive: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isNegativeStock: boolean;
  valuationAtCost: number;
  valuationAtSellingPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockListSummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  negativeStockCount: number;
  normalStockCount: number;
}

export interface StockListMeta {
  page: number;
  limit: number;
  total: number;
  paginationMode?: "items" | "categories";
  totalItems?: number;
  totalPages?: number;
}

export interface StockListResponse {
  items: StockItem[];
  meta: StockListMeta;
  summary: StockListSummary;
}

export interface ListStockFilters {
  categoryId?: string;
  stockStatus?: StockStatusFilter;
  q?: string;
  page?: number;
  limit?: number;
  paginationMode?: "items" | "categories";
}

export interface CategoryValuation {
  categoryId: string;
  categoryName: string;
  itemsCount: number;
  valuationAtCost: number;
  valuationAtSellingPrice: number;
}

export interface InventoryValuation {
  totalItemsCount: number;
  totalValuationAtCost: number;
  totalValuationAtSellingPrice: number;
  potentialProfit: number;
  categories: CategoryValuation[];
}

export interface CreateStockAdjustmentInput {
  itemId: string;
  newQuantity: number;
  reason: string;
}

export interface AdjustStockResult {
  itemId: string;
  oldQuantity: number;
  newQuantity: number;
  reason: string;
}
