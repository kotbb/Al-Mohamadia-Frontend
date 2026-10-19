"use client";

import { useLocale, useTranslations } from "next-intl";
import { NavigableTableRow } from "@/app/modules/shared/components/navigable-table-row";
import { Link } from "@/i18n/navigation";
import type { Customer } from "@/app/modules/customers/types/customers.types";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import {
  historyRowAction,
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface CustomersListProps {
  customers: Customer[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onEdit: (customer: Customer) => void;
  onDeactivate: (customer: Customer) => void;
  onActivate: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onHistory: (customer: Customer) => void;
}

function StatusIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M5.5 8 7 9.5 10.5 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 5.5 10.5 10.5M10.5 5.5 5.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CustomersList({
  customers,
  status,
  error,
  onRetry,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  onHistory,
}: CustomersListProps) {
  const t = useTranslations("customers");
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

  if (customers.length === 0) {
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
              {t("colName")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colPhone")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colBalance")}
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
          {customers.map((customer) => {
            const actions: RowActionItem[] = [
              historyRowAction(tAudit("viewHistory"), () =>
                onHistory(customer),
              ),
              {
                id: "edit",
                label: t("edit"),
                onSelect: () => onEdit(customer),
              },
              customer.isActive
                ? {
                    id: "deactivate",
                    label: t("deactivate"),
                    onSelect: () => onDeactivate(customer),
                    tone: "danger",
                  }
                : {
                    id: "activate",
                    label: t("activate"),
                    onSelect: () => onActivate(customer),
                  },
              {
                id: "delete",
                label:
                  customer.balance !== 0 ? t("deleteBlocked") : t("delete"),
                onSelect: () => onDelete(customer),
                tone: "danger",
                disabled: customer.balance !== 0,
              },
            ];

            return (
              <NavigableTableRow
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-muted/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="ds-focus-ring group inline-flex items-center gap-3 rounded-xl transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary transition-all duration-150 group-hover/record:bg-primary group-hover/record:text-primary-foreground group-hover/record:shadow-sm">
                      {customer.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-text-primary transition-colors group-hover/record:text-primary group-hover/record:underline">
                      {customer.name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {customer.phone ?? "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={
                      customer.balance > 0
                        ? "font-bold text-text-primary"
                        : "text-text-secondary"
                    }
                  >
                    {formatMoney(customer.balance, locale)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={customer.isActive ? "success" : "danger"}>
                    {customer.isActive ? (
                      <>
                        <StatusIcon active />
                        {t("statusActive")}
                      </>
                    ) : (
                      <>
                        <StatusIcon active={false} />
                        {t("statusInactive")}
                      </>
                    )}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="ds-focus-ring rounded-lg px-2 py-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t("view")}
                    </Link>
                    <RowActionsMenu label={t("colActions")} items={actions} />
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
