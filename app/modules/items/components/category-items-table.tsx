"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Category, Item } from "@/app/modules/items/types/items.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import {
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface CategoryItemsTableProps {
  category: Category;
  items: Item[];
  onEdit: (itemId: string) => void;
  onPriceHistory: (itemId: string) => void;
  onDelete: (item: Item) => void;
}

function pricingModeLabel(
  mode: Item["pricingMode"],
  t: ReturnType<typeof useTranslations>,
): string {
  return mode === "per_cubic_meter" ? t("unitPerCubicMeter") : t("unitPerPiece");
}

export function CategoryItemsTable({
  category,
  items,
  onEdit,
  onPriceHistory,
  onDelete,
}: CategoryItemsTableProps) {
  const t = useTranslations("items");
  const locale = useLocale();
  const cell = "px-3.5 py-2.5";

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white dark:bg-surface">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="text-sm font-semibold text-text-primary">{category.name}</h2>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[36rem] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className={`${cell} text-start font-medium text-text-secondary`}>
                {t("colItem")}
              </th>
              <th className={`${cell} text-start font-medium text-text-secondary`}>
                {t("colUnit")}
              </th>
              <th className={`${cell} text-start font-medium text-text-secondary`}>
                {t("colPrice")}
              </th>
              <th className={`${cell} text-start font-medium text-text-secondary`}>
                {t("colCost")}
              </th>
              <th className={`${cell} text-center font-medium text-text-secondary`}>
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const actions: RowActionItem[] = [
                {
                  id: "edit",
                  label: t("edit"),
                  onSelect: () => onEdit(item.id),
                },
                {
                  id: "history",
                  label: t("priceHistory"),
                  onSelect: () => onPriceHistory(item.id),
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
                  className="border-b border-border last:border-b-0"
                >
                  <td className={`${cell} align-middle text-text-primary`}>
                    <div className="truncate font-medium">{item.name}</div>
                    <div className="truncate text-xs text-text-muted">{item.code}</div>
                  </td>
                  <td className={`${cell} align-middle text-text-secondary`}>
                    {pricingModeLabel(item.pricingMode, t)}
                  </td>
                  <td className={`${cell} align-middle text-text-primary`}>
                    {formatMoney(item.unitPrice, locale)}
                  </td>
                  <td className={`${cell} align-middle text-text-secondary`}>
                    {formatMoney(item.cost, locale)}
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
