"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import {
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface SuppliersListProps {
  suppliers: Supplier[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onEdit: (supplier: Supplier) => void;
  onDeactivate: (supplier: Supplier) => void;
  onActivate: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
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

export function SuppliersList({
  suppliers,
  status,
  error,
  onRetry,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: SuppliersListProps) {
  const t = useTranslations("suppliers");
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

  if (suppliers.length === 0) {
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
              {t("colAmountOwed")}
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
          {suppliers.map((supplier) => {
            const actions: RowActionItem[] = [
              {
                id: "edit",
                label: t("edit"),
                onSelect: () => onEdit(supplier),
              },
              supplier.isActive
                ? {
                    id: "deactivate",
                    label: t("deactivate"),
                    onSelect: () => onDeactivate(supplier),
                    tone: "danger",
                  }
                : {
                    id: "activate",
                    label: t("activate"),
                    onSelect: () => onActivate(supplier),
                  },
              {
                id: "delete",
                label:
                  supplier.amountOwed !== 0 ? t("deleteBlocked") : t("delete"),
                onSelect: () => onDelete(supplier),
                tone: "danger",
                disabled: supplier.amountOwed !== 0,
              },
            ];

            return (
              <tr
                key={supplier.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {supplier.name}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {supplier.phone ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-primary">
                  {formatMoney(supplier.amountOwed, locale)} {currency}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={supplier.isActive ? "success" : "danger"}>
                    {supplier.isActive ? (
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
                      href={`/suppliers/${supplier.id}`}
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
