"use client";

import { useLocale, useTranslations } from "next-intl";
import type { StockAdjustment } from "@/app/modules/inventory/types/inventory.types";
import { formatInvoiceDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { Badge } from "@/app/modules/shared/components/badge";
import { Button } from "@/app/modules/shared/components/button";

interface AdjustmentsTableProps {
  adjustments: StockAdjustment[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdjustmentsTable({
  adjustments,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: AdjustmentsTableProps) {
  const t = useTranslations("inventory");
  const tShared = useTranslations("shared");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-shell border border-border bg-surface">
        <table className="w-full min-w-[48rem] border-collapse text-sm lg:text-base">
          <thead className="bg-surface-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-start font-medium text-text-secondary">
                {t("colDate")}
              </th>
              <th className="px-4 py-3 text-start font-medium text-text-secondary">
                {t("colItem")}
              </th>
              <th className="px-3 py-3 text-center font-medium text-text-secondary">
                {t("colDifference")}
              </th>
              <th className="px-3 py-3 text-center font-medium text-text-secondary">
                {t("colQuantityBeforeAfter")}
              </th>
              <th className="px-4 py-3 text-start font-medium text-text-secondary">
                {t("colReason")}
              </th>
              <th className="px-4 py-3 text-center font-medium text-text-secondary">
                {t("colAdjuster")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-secondary">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>{t("loading")}</span>
                  </div>
                </td>
              </tr>
            ) : adjustments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="mx-auto max-w-sm space-y-1">
                    <p className="font-semibold text-text-primary">
                      {t("emptyAdjustmentsTitle")}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t("emptyAdjustmentsDesc")}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              adjustments.map((adj) => {
                const isPositive = adj.diffQuantity > 0;
                const formattedDate = formatInvoiceDate(adj.createdAt, locale);

                return (
                  <tr
                    key={adj.id}
                    className="border-b border-border transition-colors hover:bg-surface-muted/50"
                  >
                    {/* Date & Time */}
                    <td className="px-4 py-3.5 tabular-nums text-xs font-medium text-text-secondary whitespace-nowrap">
                      {formattedDate}
                    </td>

                    {/* Item */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-text-primary block">
                        {adj.item?.name || "-"}
                      </span>
                    </td>

                    {/* Difference */}
                    <td className="px-3 py-3.5 text-center">
                      <Badge variant={isPositive ? "success" : "danger"}>
                        {isPositive ? `+${adj.diffQuantity}` : `${adj.diffQuantity}`}
                      </Badge>
                    </td>

                    {/* Before -> After */}
                    <td className="px-3 py-3.5 text-center tabular-nums text-xs">
                      <span className="text-text-muted font-medium">
                        {adj.oldQuantity}
                      </span>
                      <span className="mx-1 text-text-secondary">→</span>
                      <span className="font-bold text-text-primary">
                        {adj.newQuantity}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3.5 text-xs font-medium text-text-primary">
                      <span className="inline-block max-w-xs break-words">
                        {adj.reason}
                      </span>
                    </td>

                    {/* Adjuster */}
                    <td className="px-4 py-3.5 text-center text-xs text-text-secondary">
                      <span>{adj.adjuster?.username || adj.adjustedBy || "-"}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-sm text-text-secondary">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            {tShared("prevPage") || (locale === "ar" ? "السابق" : "Previous")}
          </Button>

          <span className="text-sm">
            {t("pageOf", { page, totalPages })}
          </span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            {tShared("nextPage") || (locale === "ar" ? "التالي" : "Next")}
          </Button>
        </div>
      )}
    </div>
  );
}
