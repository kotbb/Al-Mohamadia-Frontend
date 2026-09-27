"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CategoryListRow } from "@/app/modules/items/hooks/use-categories";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import {
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";
import { formatInvoiceDate } from "@/app/modules/invoices/utils/format-invoice-date";

interface CategoriesListProps {
  categories: CategoryListRow[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onEdit: (category: CategoryListRow) => void;
  onDeactivate: (category: CategoryListRow) => void;
  onActivate: (category: CategoryListRow) => void;
  onDelete: (category: CategoryListRow) => void;
  onViewHistory: (category: CategoryListRow) => void;
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

function CategoryFolderIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CategoriesList({
  categories,
  status,
  error,
  onRetry,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  onViewHistory,
}: CategoriesListProps) {
  const t = useTranslations("categories");
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

  if (categories.length === 0) {
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
              {t("colStatus")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colItems")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colCreated")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colModified")}
            </th>
            <th className="w-16 px-4 py-3 text-center font-medium text-text-secondary">
              {t("colActions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const hasItems = category.itemCount > 0;
            const actions: RowActionItem[] = [
              {
                id: "history",
                label: tAudit("viewHistory"),
                onSelect: () => onViewHistory(category),
              },
              {
                id: "edit",
                label: t("edit"),
                onSelect: () => onEdit(category),
              },
              category.isActive
                ? {
                    id: "deactivate",
                    label: t("deactivate"),
                    onSelect: () => onDeactivate(category),
                    tone: "danger",
                  }
                : {
                    id: "activate",
                    label: t("activate"),
                    onSelect: () => onActivate(category),
                  },
              {
                id: "delete",
                label: hasItems ? t("deleteBlocked") : t("delete"),
                onSelect: () => onDelete(category),
                tone: "danger",
                disabled: hasItems,
              },
            ];

            return (
              <tr
                key={category.id}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-muted/50"
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="ds-focus-ring group inline-flex items-center gap-3 rounded-xl text-start transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-150 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
                      <CategoryFolderIcon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-text-primary transition-colors group-hover:text-primary group-hover:underline">
                      {category.name}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={category.isActive ? "success" : "danger"}>
                    {category.isActive ? (
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
                <td className="px-4 py-3 text-text-secondary">{category.itemCount}</td>
                <td className="px-4 py-3 whitespace-nowrap text-text-muted">
                  {formatInvoiceDate(category.createdAt, locale)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-muted">
                  {formatInvoiceDate(category.updatedAt, locale)}
                </td>
                <td className="px-4 py-3 text-center">
                  <RowActionsMenu label={t("colActions")} items={actions} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
