"use client";

import { useTranslations } from "next-intl";
import type {
  StockListSummary,
  StockStatusFilter,
} from "@/app/modules/inventory/types/inventory.types";
import type { Category } from "@/app/modules/items/types/items.types";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";

interface StockFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  statusFilter: StockStatusFilter;
  onStatusFilterChange: (status: StockStatusFilter) => void;
  categories: Category[];
  summary: StockListSummary;
}

export function StockFilters({
  searchInput,
  onSearchChange,
  categoryId,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  categories,
  summary,
}: StockFiltersProps) {
  const t = useTranslations("inventory");

  const statusOptions: { value: StockStatusFilter; label: string }[] = [
    { value: "all", label: `${t("statusAll")} (${summary.totalItems})` },
    { value: "normal", label: `${t("statusNormal")} (${summary.normalStockCount})` },
    { value: "low_stock", label: `${t("statusLowStock")} (${summary.lowStockCount})` },
    { value: "out_of_stock", label: `${t("statusOutOfStock")} (${summary.outOfStockCount})` },
    { value: "negative_stock", label: `${t("statusNegativeStock")} (${summary.negativeStockCount})` },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Search and Category */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">
            {t("searchPlaceholder")}
          </span>
          <input
            name="stockSearch"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ds-focus-input min-h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted"
          />
        </label>

        <label className="flex w-full flex-col gap-1 sm:w-56">
          <span className="text-xs font-medium text-text-secondary">
            {t("colCategory")}
          </span>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="ds-focus-input min-h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="">{t("categoryAll")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Status Segmented Control */}
      <div className="w-full overflow-x-auto pb-1">
        <SegmentedControl
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val as StockStatusFilter)}
          options={statusOptions}
        />
      </div>
    </div>
  );
}
