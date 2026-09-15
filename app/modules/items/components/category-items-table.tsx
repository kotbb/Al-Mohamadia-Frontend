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
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-border bg-[#faf8f5] px-4 py-3 dark:bg-surface-muted/40">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-text-primary sm:text-base">
            {category.name}
          </h2>
        </div>
        <span className="inline-flex items-center rounded-full border border-border/70 bg-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary">
          {items.length}
        </span>
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
            <tr className="border-b border-border bg-surface dark:bg-surface">
              <th className={`${cell} text-start text-xs font-semibold tracking-wide text-text-secondary`}>
                {t("colItem")}
              </th>
              <th className={`${cell} text-start text-xs font-semibold tracking-wide text-text-secondary`}>
                {t("colUnit")}
              </th>
              <th className={`${cell} text-end pe-6 text-xs font-semibold tracking-wide text-text-secondary`}>
                {t("colPrice")}
              </th>
              <th className={`${cell} text-end pe-6 text-xs font-semibold tracking-wide text-text-secondary`}>
                {t("colCost")}
              </th>
              <th className={`${cell} text-center text-xs font-semibold tracking-wide text-text-secondary`}>
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
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
                  className="transition-colors hover:bg-[#faf7f2]/80 dark:hover:bg-surface-muted/40"
                >
                  <td className={`${cell} align-middle text-text-primary`}>
                    <div className="truncate font-semibold text-text-primary">{item.name}</div>
                    <div className="mt-0.5 inline-block truncate rounded bg-surface-muted/60 px-1.5 py-0.5 font-mono text-xs text-text-muted">
                      {item.code}
                    </div>
                  </td>
                  <td className={`${cell} align-middle text-text-secondary`}>
                    {pricingModeLabel(item.pricingMode, t)}
                  </td>
                  <td className={`${cell} align-middle text-end pe-6 font-semibold tabular-nums text-text-primary`}>
                    {formatMoney(item.unitPrice, locale)}
                  </td>
                  <td className={`${cell} align-middle text-end pe-6 tabular-nums text-text-secondary`}>
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
