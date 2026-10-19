"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatInvoiceDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { PaymentMethodBadge } from "@/app/modules/payments/components/payment-method-badge";
import type { SupplierPayment } from "@/app/modules/supplier-payments/types/supplier-payments.types";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import {
  historyRowAction,
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface SupplierPaymentsTableProps {
  payments: SupplierPayment[];
  supplierNames?: Record<string, string>;
  showSupplier?: boolean;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onCancel: (payment: SupplierPayment) => void;
  onHistory: (payment: SupplierPayment, label: string) => void;
}

export function SupplierPaymentsTable({
  payments,
  supplierNames = {},
  showSupplier = false,
  status,
  error,
  onRetry,
  onCancel,
  onHistory,
}: SupplierPaymentsTableProps) {
  const t = useTranslations("supplierPayments");
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

  if (payments.length === 0) {
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
              {t("colDate")}
            </th>
            {showSupplier ? (
              <th className="px-4 py-3 text-start font-medium text-text-secondary">
                {t("colSupplier")}
              </th>
            ) : null}
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colAmount")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colMethod")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colNotes")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colStatus")}
            </th>
            <th className="w-24 px-4 py-3 text-center font-medium text-text-secondary">
              {t("colActions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const supplierName = payment.supplierId
              ? (supplierNames[payment.supplierId] ?? "…")
              : "-";

            const actions: RowActionItem[] = [
              historyRowAction(tAudit("viewHistory"), () =>
                onHistory(payment, supplierName),
              ),
            ];

            if (!payment.isReversed && !payment.purchaseInvoiceId) {
              actions.push({
                id: "cancel",
                label: t("cancel"),
                onSelect: () => onCancel(payment),
                tone: "danger",
              });
            }

            return (
              <tr
                key={payment.id}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-muted/50"
              >
                <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                  {formatInvoiceDate(payment.createdAt, locale)}
                </td>
                {showSupplier ? (
                  <td className="px-4 py-3 text-text-primary">
                    {payment.supplierId ? (
                      <Link
                        href={`/suppliers/${payment.supplierId}?from=/supplier-payments`}
                        className="ds-focus-ring rounded font-medium text-text-primary hover:underline"
                      >
                        {supplierName}
                      </Link>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </td>
                ) : null}
                <td
                  className={`px-4 py-3 whitespace-nowrap font-semibold ${
                    payment.isReversed
                      ? "text-text-secondary"
                      : "text-text-primary"
                  }`}
                >
                  {formatMoney(payment.amount, locale)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PaymentMethodBadge method={payment.method} />
                </td>
                <td
                  className="max-w-[14rem] truncate px-4 py-3 text-text-secondary"
                  title={payment.notes ?? ""}
                >
                  {payment.notes?.trim() ? payment.notes : "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={payment.isReversed ? "danger" : "success"}>
                    {payment.isReversed
                      ? t("statusCancelled")
                      : t("statusActive")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  {actions.length > 0 ? (
                    <div className="flex items-center justify-center">
                      <RowActionsMenu label={t("colActions")} items={actions} />
                    </div>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
