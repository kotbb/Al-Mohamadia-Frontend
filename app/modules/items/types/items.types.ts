export type PricingMode = "per_piece" | "per_cubic_meter";

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
  changedBy: string;
  createdAt?: string;
}

export interface BaseReferencePrice {
  key: string;
  value: number | null;
  updatedAt?: string;
}

export interface CreateItemInput {
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
  code?: string;
  name?: string;
  categoryId?: string;
  isWood?: boolean;
  pricingMode?: PricingMode;
  reorderThreshold?: number;
  isActive?: boolean;
}

export interface UpdateItemPricingInput {
  unitPrice?: number;
  cost?: number;
}

export interface UpdateBaseReferencePriceInput {
  value: number;
}

export interface ListItemsFilters {
  categoryId?: string;
  isActive?: boolean;
}
