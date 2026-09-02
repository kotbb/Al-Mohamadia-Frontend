"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/types";
import { listCategories } from "@/app/modules/items/services/categories.service";
import { listItems } from "@/app/modules/items/services/items.service";
import {
  getBaseReferencePrice,
  updateBaseReferencePrice,
} from "@/app/modules/items/services/settings.service";
import type {
  BaseReferencePrice,
  Category,
  Item,
} from "@/app/modules/items/types/items.types";

type LoadStatus = "idle" | "loading" | "success" | "error";

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
  basePrice: BaseReferencePrice | null;
  basePriceStatus: LoadStatus;
  basePriceError: string | null;
  basePriceDraft: string;
  setBasePriceDraft: (value: string) => void;
  isSavingBasePrice: boolean;
  saveBasePriceError: string | null;
  saveBasePrice: () => Promise<void>;
}

export function useItemsPage(): UseItemsPageResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [basePrice, setBasePrice] = useState<BaseReferencePrice | null>(null);
  const [basePriceStatus, setBasePriceStatus] = useState<LoadStatus>("loading");
  const [basePriceError, setBasePriceError] = useState<string | null>(null);
  const [basePriceDraft, setBasePriceDraft] = useState("");
  const [isSavingBasePrice, setIsSavingBasePrice] = useState(false);
  const [saveBasePriceError, setSaveBasePriceError] = useState<string | null>(
    null,
  );

  const [filters, setFilters] = useState<ItemsPageFilters>({
    search: "",
    categoryId: "",
    isActive: "all",
  });

  const refresh = useCallback(() => {
    setStatus("loading");
    setError(null);
    setBasePriceStatus("loading");
    setBasePriceError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      listCategories(controller.signal),
      listItems(undefined, controller.signal),
      getBaseReferencePrice(controller.signal),
    ])
      .then(([categoryList, itemList, baseReferencePrice]) => {
        setCategories(categoryList.filter((category) => !category.isDeleted));
        setItems(itemList.filter((item) => !item.isDeleted));
        setStatus("success");
        setError(null);
        setBasePrice(baseReferencePrice);
        setBasePriceDraft(
          baseReferencePrice.value !== null ? String(baseReferencePrice.value) : "",
        );
        setBasePriceStatus("success");
        setBasePriceError(null);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          loadError instanceof ApiError
            ? loadError.message
            : loadError instanceof Error
              ? loadError.message
              : "Request failed";
        setCategories([]);
        setItems([]);
        setStatus("error");
        setError(message);
        setBasePriceStatus("error");
        setBasePriceError(message);
      });

    return () => controller.abort();
  }, [tick]);

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return items.filter((item) => {
      if (filters.categoryId && item.category.id !== filters.categoryId) {
        return false;
      }
      if (filters.isActive === "active" && !item.isActive) return false;
      if (filters.isActive === "inactive" && item.isActive) return false;
      if (!search) return true;
      return (
        item.name.toLowerCase().includes(search) ||
        item.code.toLowerCase().includes(search)
      );
    });
  }, [items, filters]);

  const groupedItems = useMemo(() => {
    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    const groups = new Map<string, Item[]>();

    for (const item of filteredItems) {
      const categoryId = item.category.id;
      const existing = groups.get(categoryId) ?? [];
      existing.push(item);
      groups.set(categoryId, existing);
    }

    return Array.from(groups.entries())
      .map(([categoryId, groupItems]) => {
        const category =
          categoryMap.get(categoryId) ??
          ({
            id: categoryId,
            name: groupItems[0]?.category.name ?? categoryId,
            isActive: true,
            isDeleted: false,
          } satisfies Category);
        return { category, items: groupItems };
      })
      .sort((a, b) => a.category.name.localeCompare(b.category.name));
  }, [categories, filteredItems]);

  const setSearch = useCallback((value: string) => {
    setFilters((current) => ({ ...current, search: value }));
  }, []);

  const setCategoryId = useCallback((value: string) => {
    setFilters((current) => ({ ...current, categoryId: value }));
  }, []);

  const setIsActive = useCallback((value: ItemsPageFilters["isActive"]) => {
    setFilters((current) => ({ ...current, isActive: value }));
  }, []);

  const saveBasePrice = useCallback(async () => {
    const parsed = Number(basePriceDraft);
    if (Number.isNaN(parsed) || parsed < 0) {
      setSaveBasePriceError("Invalid price");
      return;
    }

    setIsSavingBasePrice(true);
    setSaveBasePriceError(null);
    try {
      const updated = await updateBaseReferencePrice({ value: parsed });
      setBasePrice(updated);
      setBasePriceDraft(String(updated.value ?? ""));
    } catch (saveError: unknown) {
      const message =
        saveError instanceof ApiError
          ? saveError.message
          : saveError instanceof Error
            ? saveError.message
            : "Save failed";
      setSaveBasePriceError(message);
    } finally {
      setIsSavingBasePrice(false);
    }
  }, [basePriceDraft]);

  return {
    categories,
    items: filteredItems,
    groupedItems,
    status,
    error,
    refresh,
    filters,
    setSearch,
    setCategoryId,
    setIsActive,
    basePrice,
    basePriceStatus,
    basePriceError,
    basePriceDraft,
    setBasePriceDraft,
    isSavingBasePrice,
    saveBasePriceError,
    saveBasePrice,
  };
}
