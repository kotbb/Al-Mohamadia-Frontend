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
  historyRowAction,
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface InvoicesListProps {
  invoices: SalesInvoice[];
  customerNames: Record<string, string>;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onEdit?: (invoice: SalesInvoice) => void;
  onPrint: (invoice: SalesInvoice) => void;
  onShare: (invoice: SalesInvoice) => void;
  onCancel: (invoice: SalesInvoice) => void;
  onHistory: (invoice: SalesInvoice) => void;
}

function InvoiceDocIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InvoicesList({
  invoices,
  customerNames,
  status,
  error,
  onRetry,
  onEdit,
  onPrint,
  onShare,
  onCancel,
  onHistory,
}: InvoicesListProps) {
  const t = useTranslations("invoices");
  const tAudit = useTranslations("audit");
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
                  : "-";

            const actions: RowActionItem[] = [
              historyRowAction(tAudit("viewHistory"), () => onHistory(invoice)),
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
              if (onEdit) {
                actions.push({
                  id: "edit",
                  label: t("edit"),
                  onSelect: () => onEdit(invoice),
                });
              }
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
                className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-muted/50"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="ds-focus-ring group inline-flex items-center gap-3 rounded-xl transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-150 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
                      <InvoiceDocIcon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold whitespace-nowrap text-text-primary transition-colors group-hover:text-primary group-hover:underline">
                      {invoice.invoiceNumber}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                  {formatInvoiceDate(invoice.createdAt, locale)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-text-primary">
                  {customerLabel}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-text-primary">
                  {formatMoney(invoice.total, locale)} {currency}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={
                      invoice.remaining > 0
                        ? "font-bold text-danger"
                        : "text-text-secondary"
                    }
                  >
                    {formatMoney(invoice.remaining, locale)} {currency}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={invoice.status === "saved" ? "success" : "danger"}
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
