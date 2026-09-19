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
  code: string;
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

export interface StockAdjustmentUser {
  id: string;
  username: string;
}

export interface StockAdjustmentItem {
  id: string;
  code: string;
  name: string;
}

export interface StockAdjustment {
  id: string;
  itemId: string;
  item: StockAdjustmentItem | null;
  oldQuantity: number;
  newQuantity: number;
  diffQuantity: number;
  reason: string;
  adjustedBy: string;
  adjuster: StockAdjustmentUser | null;
  createdAt: string;
}

export interface StockAdjustmentListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface StockAdjustmentListResponse {
  items: StockAdjustment[];
  meta: StockAdjustmentListMeta;
}

export interface CreateStockAdjustmentInput {
  itemId: string;
  newQuantity: number;
  reason: string;
}

export interface ListAdjustmentsFilters {
  itemId?: string;
  period?: "DAY" | "WEEK" | "MONTH" | "YEAR";
  date?: string;
  page?: number;
  limit?: number;
}
