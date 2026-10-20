export type PricingMode = "per_piece" | "per_cubic_meter" | "free_amount";

export interface DimensionDefaults {
  thickness: number[];
  width: number[];
  length: number[];
}
export type DimensionName = keyof DimensionDefaults;
export interface AddDimensionDefaultInput {
  dimension: DimensionName;
  value: number;
}
export interface ItemDimensionDefaultsResponse {
  itemId: string;
  dimensionDefaults: DimensionDefaults;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
  isActive?: boolean;
}

export interface ItemCategorySummary {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  category: ItemCategorySummary;
  isWood: boolean;
  pricingMode: PricingMode;
  dimensionDefaults: DimensionDefaults;
  unitPrice: number;
  cost: number;
  stockQuantity: number;
  reorderThreshold: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceHistoryEntry {
  id: string;
  itemId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string | null;
  createdAt?: string;
}

export interface CreateItemInput {
  dimensionDefaults?: DimensionDefaults;
  code: string;
  name: string;
  categoryId: string;
  pricingMode: PricingMode;
  isWood?: boolean;
  unitPrice?: number;
  cost?: number;
  stockQuantity?: number;
  reorderThreshold?: number;
  isActive?: boolean;
}

export interface UpdateItemInput {
  dimensionDefaults?: DimensionDefaults;
  code?: string;
  name?: string;
  categoryId?: string;
  isWood?: boolean;
  reorderThreshold?: number;
  isActive?: boolean;
}

export interface UpdateItemPricingInput {
  unitPrice?: number;
  cost?: number;
}

export interface ListItemsFilters {
  categoryId?: string;
  isActive?: boolean;
}
