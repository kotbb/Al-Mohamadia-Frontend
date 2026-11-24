"use client";

import { Modal } from "@/app/modules/shared/components/modal";
import { useLocale, useTranslations } from "next-intl";
import type { CategoryValuation } from "@/app/modules/inventory/types/inventory.types";
import { formatMoney } from "@/app/modules/shared/utils/format-money";

interface CategoryValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore?: () => void;
  categories: CategoryValuation[];
}

export function CategoryValuationModal({ isOpen, onClose, onRestore, categories }: CategoryValuationModalProps) {
  const t = useTranslations("inventory");
  const locale = useLocale();

  if (!isOpen) return null;

  return (
    <Modal
      layerKey="inventory:category-valuation-modal"
      open={isOpen}
      onClose={onClose}
      onRestore={onRestore}
      title={t("modalCategoryValuationTitle")}
      size="xl"
    >
      {/* Content Table */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <table className="w-full text-start border-collapse text-sm lg:text-base">
          <thead>
            <tr className="border-b border-border/80 font-medium text-text-secondary">
              <th className="py-3 px-3 text-start">{t("colCategory")}</th>
              <th className="py-3 px-3 text-center">{t("colItemsCount")}</th>
              <th className="py-3 px-3 text-end">{t("colValuationCost")}</th>
              <th className="py-3 px-3 text-end">{t("colValuationSelling")}</th>
              <th className="py-3 px-3 text-end">{t("colPotentialProfit")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {categories.map((cat) => {
              const profit = cat.valuationAtSellingPrice - cat.valuationAtCost;
              return (
                <tr key={cat.categoryId} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-text-primary">{cat.categoryName}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-text-secondary">{cat.itemsCount}</td>
                  <td className="py-3 px-3 text-end tabular-nums font-medium text-text-primary">
                    {formatMoney(cat.valuationAtCost, locale)}
                  </td>
                  <td className="py-3 px-3 text-end tabular-nums font-medium text-text-primary">
                    {formatMoney(cat.valuationAtSellingPrice, locale)}
                  </td>
                  <td
                    className={`py-3 px-3 text-end tabular-nums font-semibold ${
                      profit < 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {formatMoney(profit, locale)}
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-secondary">
                  {t("emptyStockTitle")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
