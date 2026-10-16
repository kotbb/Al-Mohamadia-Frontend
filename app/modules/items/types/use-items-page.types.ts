import type { Category, Item } from "@/app/modules/items/types/items.types";

export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface ItemsPageFilters {
  search: string;
  categoryId: string;
  isActive: "all" | "active" | "inactive";
}

export interface UseItemsPageResult {
  categories: Category[];
  items: Item[];
  groupedItems: Array<{ category: Category; items: Item[] }>;
  status: LoadStatus;
  error: string | null;
  refresh: () => void;
  filters: ItemsPageFilters;
  setSearch: (value: string) => void;
  setCategoryId: (value: string) => void;
  setIsActive: (value: ItemsPageFilters["isActive"]) => void;
}
