"use client";

import { useLocale, useTranslations } from "next-intl";
import { NavigableTableRow } from "@/app/modules/shared/components/navigable-table-row";
import { Link } from "@/i18n/navigation";
import { formatInvoiceDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { PurchaseInvoice, PurchaseInvoiceListItem } from "@/app/modules/purchases/types/purchases.types";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import {
  historyRowAction,
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface PurchasesTableProps {
  purchases: PurchaseInvoiceListItem[];
  showSupplier?: boolean;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onCancel?: (purchase: PurchaseInvoice) => void;
  onEdit?: (purchase: PurchaseInvoice) => void;
  onHistory: (purchase: PurchaseInvoice) => void;
}

function PurchaseBagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M16 10a4 4 0 0 1-8 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PurchasesTable({
  purchases,
  showSupplier = true,
  status,
  error,
  onRetry,
  onCancel,
  onEdit,
  onHistory,
}: PurchasesTableProps) {
  const t = useTranslations("purchases");
  const tAudit = useTranslations("audit");
  const tShared = useTranslations("shared");
  const locale = useLocale();

  if (status === "loading" || status === "idle") {
    return <LoadingState message={tShared("loading")} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        title={t("listError")}
        message={error ?? undefined}
        retryLabel={t("retry")}
        onRetry={onRetry}
      />
    );
  }

  if (purchases.length === 0) {
    return (
      <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  return (
    <div className="overflow-x-auto rounded-shell border border-border bg-surface">
      <table className="w-full min-w-[48rem] border-collapse text-sm lg:text-base">
        <thead className="bg-surface-muted">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colInvoiceNumber")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colDate")}
            </th>
            {showSupplier ? (
              <th className="px-4 py-3 text-start font-medium text-text-secondary">
                {t("colSupplier")}
              </th>
            ) : null}
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colTotal")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colRemaining")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colStatus")}
            </th>
            <th className="w-28 px-4 py-3 text-center font-medium text-text-secondary">
              {t("colActions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => {
            const supplierName = purchase.supplierId
              ? (purchase.supplierName ?? "-")
              : "-";

            const actions: RowActionItem[] = [
              historyRowAction(tAudit("viewHistory"), () =>
                onHistory(purchase),
              ),
            ];

            if (purchase.status === "saved" && onEdit) {
              actions.push({ id: "edit", label: t("edit"), onSelect: () => onEdit(purchase) });
            }
            if (purchase.status === "saved" && onCancel) {
              actions.push({
                id: "cancel",
                label: t("cancelPurchase"),
                onSelect: () => onCancel(purchase),
                tone: "danger",
              });
            }

            return (
              <NavigableTableRow
                key={purchase.id}
                href={`/purchases/${purchase.id}`}
                className="border-b border-border last:border-b-0 hover:bg-surface-muted/60 transition-colors"
              >
                {/* Invoice Number */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/purchases/${purchase.id}`}
                    className="ds-focus-ring group inline-flex items-center gap-3 rounded-xl transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-150 group-hover/record:bg-primary group-hover/record:text-primary-foreground group-hover/record:shadow-sm">
                      <PurchaseBagIcon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold whitespace-nowrap text-text-primary transition-colors group-hover/record:text-primary group-hover/record:underline">
                      {purchase.invoiceNumber}
                    </span>
                  </Link>
                </td>

                {/* Date */}
                <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                  {formatInvoiceDate(purchase.createdAt, locale)}
                </td>

                {/* Supplier */}
                {showSupplier ? (
                  <td className="px-4 py-3 whitespace-nowrap text-text-primary">
                    {purchase.supplierId && purchase.supplierName !== null ? (
                      <Link
                        href={`/suppliers/${purchase.supplierId}?from=/purchases`}
                        className="hover:underline font-medium whitespace-nowrap"
                      >
                        {supplierName}
                      </Link>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </td>
                ) : null}

                {/* Total */}
                <td className="px-4 py-3 whitespace-nowrap font-medium text-text-primary">
                  {formatMoney(purchase.total, locale)}
                </td>

                {/* Remaining */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`font-semibold ${
                      purchase.remaining > 0
                        ? "text-danger font-bold"
                        : "text-text-secondary"
                    }`}
                  >
                    {formatMoney(purchase.remaining, locale)}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                  {purchase.status === "cancelled" ? (
                    <Badge variant="danger">{t("statusCancelled")}</Badge>
                  ) : purchase.remaining === 0 ? (
                    <Badge variant="success">{t("statusPaid")}</Badge>
                  ) : purchase.paid > 0 ? (
                    <Badge variant="warning">{t("statusPartial")}</Badge>
                  ) : (
                    <Badge variant="info">{t("statusSaved")}</Badge>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {actions.length > 0 ? (
                      <RowActionsMenu label={t("colActions")} items={actions} />
                    ) : null}
                  </div>
                </td>
              </NavigableTableRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
