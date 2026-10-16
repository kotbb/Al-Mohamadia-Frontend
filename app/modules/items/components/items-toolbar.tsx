"use client";

import { useTranslations } from "next-intl";
import type { Category } from "@/app/modules/items/types/items.types";
import type { ItemsPageFilters } from "@/app/modules/items/types/use-items-page.types";

interface ItemsToolbarProps {
  filters: ItemsPageFilters;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onActiveChange: (value: ItemsPageFilters["isActive"]) => void;
}

export function ItemsToolbar({
  filters,
  categories,
  onSearchChange,
  onCategoryChange,
  onActiveChange,
}: ItemsToolbarProps) {
  const t = useTranslations("items");

  return (
    <div className="rounded-xl border border-border bg-white p-3 dark:bg-surface sm:p-3.5">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">
            {t("searchLabel")}
          </span>
          <input
            name="search"
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ds-focus-input min-h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted"
          />
        </label>

        <label className="flex w-full flex-col gap-1 sm:w-40">
          <span className="text-xs font-medium text-text-secondary">
            {t("filterCategory")}
          </span>
          <select
            value={filters.categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="ds-focus-input min-h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="">{t("filterAllCategories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex w-full flex-col gap-1 sm:w-32">
          <span className="text-xs font-medium text-text-secondary">
            {t("filterStatus")}
          </span>
          <select
            value={filters.isActive}
            onChange={(event) =>
              onActiveChange(event.target.value as ItemsPageFilters["isActive"])
            }
            className="ds-focus-input min-h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="all">{t("filterAllStatus")}</option>
            <option value="active">{t("filterActive")}</option>
            <option value="inactive">{t("filterInactive")}</option>
          </select>
        </label>
      </div>
    </div>
  );
}
