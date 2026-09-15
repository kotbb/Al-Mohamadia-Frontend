"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SalesInvoice } from "@/app/modules/invoices/types/invoices.types";
import { formatInvoiceDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import {
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface InvoicesListProps {
  invoices: SalesInvoice[];
  customerNames: Record<string, string>;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onPrint: (invoice: SalesInvoice) => void;
  onShare: (invoice: SalesInvoice) => void;
  onCancel: (invoice: SalesInvoice) => void;
}

export function InvoicesList({
  invoices,
  customerNames,
  status,
  error,
  onRetry,
  onPrint,
  onShare,
  onCancel,
}: InvoicesListProps) {
  const t = useTranslations("invoices");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const currency = t("currency");

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

  if (invoices.length === 0) {
    return (
      <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  return (
    <div className="overflow-x-auto rounded-shell border border-border bg-surface">
      <table className="w-full min-w-[52rem] border-collapse text-sm lg:text-base">
        <thead className="bg-surface-muted">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colNumber")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colDate")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colCustomer")}
            </th>
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
          {invoices.map((invoice) => {
            const customerLabel =
              invoice.type === "cash_sale"
                ? t("cashCustomer")
                : invoice.customerId
                  ? (customerNames[invoice.customerId] ?? "…")
                  : "—";

            const actions: RowActionItem[] = [
              {
                id: "print",
                label: t("print"),
                onSelect: () => onPrint(invoice),
              },
              {
                id: "share",
                label: t("share"),
                onSelect: () => onShare(invoice),
              },
            ];
            if (invoice.status === "saved") {
              actions.push({
                id: "cancel",
                label: t("cancel"),
                onSelect: () => onCancel(invoice),
                tone: "danger",
              });
            }

            return (
              <tr
                key={invoice.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                  {formatInvoiceDate(invoice.createdAt, locale)}
                </td>
                <td className="px-4 py-3 text-text-primary">{customerLabel}</td>
                <td className="px-4 py-3 whitespace-nowrap text-text-primary">
                  {formatMoney(invoice.total, locale)} {currency}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-primary">
                  {formatMoney(invoice.remaining, locale)} {currency}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      invoice.status === "saved" ? "success" : "danger"
                    }
                  >
                    {invoice.status === "saved"
                      ? t("statusSaved")
                      : t("statusCancelled")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="ds-focus-ring rounded-lg px-2 py-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t("view")}
                    </Link>
                    <RowActionsMenu label={t("colActions")} items={actions} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
