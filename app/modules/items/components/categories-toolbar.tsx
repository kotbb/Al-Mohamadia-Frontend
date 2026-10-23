"use client";

import { useTranslations } from "next-intl";
import type { CategoriesFilters } from "@/app/modules/items/types/use-categories.types";

interface CategoriesToolbarProps {
  filters: CategoriesFilters;
  onSearchChange: (value: string) => void;
  onActiveChange: (value: CategoriesFilters["isActive"]) => void;
}

export function CategoriesToolbar({ filters, onSearchChange, onActiveChange }: CategoriesToolbarProps) {
  const t = useTranslations("categories");

  return (
    <div className="rounded-xl border border-border bg-surface p-3 sm:p-3.5">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">{t("searchLabel")}</span>
          <input
            name="categorySearch"
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ds-focus-input min-h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted"
          />
        </label>
        <label className="flex w-full flex-col gap-1 sm:w-32">
          <span className="text-xs font-medium text-text-secondary">{t("filterStatus")}</span>
          <select
            name="categoryStatus"
            value={filters.isActive}
            onChange={(event) => onActiveChange(event.target.value as CategoriesFilters["isActive"])}
            className="ds-focus-input min-h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="all">{t("filterAllStatus")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </label>
      </div>
    </div>
  );
}
