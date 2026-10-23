"use client";

import type {
  LoadStatus,
  ItemsPageFilters,
  UseItemsPageResult,
} from "../types/use-items-page.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listCategories } from "@/app/modules/items/services/categories.service";
import { listItems } from "@/app/modules/items/services/items.service";
import type { Category, Item } from "@/app/modules/items/types/items.types";

const CATEGORIES_PER_PAGE = 5;

export function useItemsPage(): UseItemsPageResult {
  const describeError = useApiErrorMessage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [requestedPage, setPage] = useState(1);

  const [filters, setFilters] = useState<ItemsPageFilters>({
    search: "",
    categoryId: "",
    isActive: "all",
  });

  const refresh = useCallback(() => {
    setPage(1);
    setStatus("loading");
    setError(null);
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      listCategories(controller.signal),
      listItems(undefined, controller.signal),
    ])
      .then(([categoryList, itemList]) => {
        setCategories(categoryList.filter((category) => !category.isDeleted));
        setItems(itemList.filter((item) => !item.isDeleted));
        setStatus("success");
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(loadError, "Request failed");
        setCategories([]);
        setItems([]);
        setStatus("error");
        setError(message);
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
      return item.name.toLowerCase().includes(search);
    });
  }, [items, filters]);

  const groupedItems = useMemo(() => {
    const categoryMap = new Map(
      categories.map((category) => [category.id, category]),
    );
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
    setPage(1);
    setFilters((current) => ({ ...current, search: value }));
  }, []);

  const setCategoryId = useCallback((value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, categoryId: value }));
  }, []);

  const setIsActive = useCallback((value: ItemsPageFilters["isActive"]) => {
    setPage(1);
    setFilters((current) => ({ ...current, isActive: value }));
  }, []);

  const totalPages = Math.max(1, Math.ceil(groupedItems.length / CATEGORIES_PER_PAGE));
  const page = Math.max(1, Math.min(requestedPage, totalPages));

  return {
    categories,
    totalItems: items.length,
    groupedItems: groupedItems.slice((page - 1) * CATEGORIES_PER_PAGE, page * CATEGORIES_PER_PAGE),
    page,
    totalPages,
    setPage,
    status,
    error,
    refresh,
    filters,
    setSearch,
    setCategoryId,
    setIsActive,
  };
}
