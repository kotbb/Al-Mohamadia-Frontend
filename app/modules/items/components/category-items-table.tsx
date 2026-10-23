"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Category, Item } from "@/app/modules/items/types/items.types";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import {
  historyRowAction,
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface CategoryItemsTableProps {
  category: Category;
  items: Item[];
  isCollapsed: boolean;
  onToggle: () => void;
  onEdit: (itemId: string) => void;
  onDelete: (item: Item) => void;
  onHistory: (item: Item) => void;
}

function pricingModeLabel(
  mode: Item["pricingMode"],
  t: ReturnType<typeof useTranslations>,
): string {
  return mode === "free_amount"
    ? t("unitFreeAmount")
    : mode === "per_cubic_meter"
      ? t("unitPerCubicMeter")
      : t("unitPerPiece");
}

export function CategoryItemsTable({
  category,
  items,
  isCollapsed,
  onToggle,
  onEdit,
  onDelete,
  onHistory,
}: CategoryItemsTableProps) {
  const t = useTranslations("items");
  const tAudit = useTranslations("audit");
  const locale = useLocale();
  const cell = "px-3.5 py-2.5";

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Category Header */}
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          aria-controls={`items-category-${category.id}`}
          className={`ds-focus-ring flex min-h-12 w-full items-center justify-between gap-3 bg-surface-muted px-4 py-3 text-start transition-colors hover:bg-surface-muted/80 ${isCollapsed ? "" : "border-b border-border"}`}
        >
          <span className="flex items-center gap-2.5">
            <svg className={`h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200 motion-reduce:transition-none ${isCollapsed ? "-rotate-90 rtl:rotate-90" : "rotate-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span
              className="h-4 w-1 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-text-primary sm:text-base">
              {category.name}
            </span>
          </span>
          <span className="inline-flex items-center rounded-full border border-border/70 bg-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary">
            {items.length}
          </span>
        </button>
      </h2>

      <div id={`items-category-${category.id}`} hidden={isCollapsed} className="w-full overflow-x-auto">
        <table className="w-full min-w-[36rem] table-fixed border-collapse text-sm lg:text-base">
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-surface dark:bg-surface">
              <th
                className={`${cell} text-start font-medium text-text-secondary`}
              >
                {t("colItem")}
              </th>
              <th
                className={`${cell} text-start font-medium text-text-secondary`}
              >
                {t("colUnit")}
              </th>
              <th
                className={`${cell} text-end pe-6 font-medium text-text-secondary`}
              >
                {t("colCost")}
              </th>
              <th
                className={`${cell} text-end pe-6 font-medium text-text-secondary`}
              >
                {t("colPrice")}
              </th>
              <th
                className={`${cell} text-center font-medium text-text-secondary`}
              >
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => {
              const actions: RowActionItem[] = [
                historyRowAction(tAudit("viewHistory"), () => onHistory(item)),
                {
                  id: "edit",
                  label: t("edit"),
                  onSelect: () => onEdit(item.id),
                },
                {
                  id: "delete",
                  label: t("delete"),
                  onSelect: () => onDelete(item),
                  tone: "danger",
                },
              ];

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-surface-muted/80"
                >
                  <td className={`${cell} align-middle text-text-primary`}>
                    <div className="truncate font-semibold text-text-primary">
                      {item.name}
                    </div>
                  </td>
                  <td className={`${cell} align-middle text-text-secondary`}>
                    {pricingModeLabel(item.pricingMode, t)}
                  </td>
                  <td
                    className={`${cell} align-middle text-end pe-6 tabular-nums text-text-secondary`}
                  >
                    {item.pricingMode === "free_amount"
                      ? ""
                      : formatMoney(item.cost, locale)}
                  </td>
                  <td
                    className={`${cell} align-middle text-end pe-6 font-medium tabular-nums text-text-primary`}
                  >
                    {item.pricingMode === "free_amount"
                      ? ""
                      : formatMoney(item.unitPrice, locale)}
                  </td>
                  <td className={`${cell} align-middle text-center`}>
                    <RowActionsMenu label={t("colActions")} items={actions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
