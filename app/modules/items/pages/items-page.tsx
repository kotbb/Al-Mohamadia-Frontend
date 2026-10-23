"use client";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { CategoryItemsTable } from "@/app/modules/items/components/category-items-table";
import { ItemsToolbar } from "@/app/modules/items/components/items-toolbar";
import { CatalogSummaryCard } from "@/app/modules/items/components/catalog-summary-card";
import { CatalogPagination } from "@/app/modules/items/components/catalog-pagination";
import { CategoryToggleButton } from "@/app/modules/shared/components/category-toggle-button";
import { useCategoryCollapse } from "@/app/modules/shared/hooks/use-category-collapse";
import { useItemsPage } from "@/app/modules/items/hooks/use-items-page";
import { deleteItem } from "@/app/modules/items/services/items.service";
import type { Item } from "@/app/modules/items/types/items.types";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";

export function ItemsPage() {
  const describeError = useApiErrorMessage();
  const t = useTranslations("items");
  const tShared = useTranslations("shared");
  const history = useAuditHistory({ entityType: "Item" });
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const {
    categories,
    totalItems,
    groupedItems,
    page,
    totalPages,
    setPage,
    status,
    error,
    refresh,
    filters,
    setSearch,
    setCategoryId,
    setIsActive,
  } = useItemsPage();
  const { isCategoryCollapsed, allCollapsed, toggleCategory, toggleAll } =
    useCategoryCollapse(groupedItems.map(({ category }) => category.id));

  function openCreatePage() {
    router.push("/items/new");
  }
  function openEditPage(itemId: string) {
    router.push(`/items/${itemId}/edit`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      setToastOpen(true);
      refresh();
    } catch (error: unknown) {
      const message = describeError(error, "Delete failed");
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {history.button}
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="min-h-10 rounded-lg px-3.5 text-sm"
            onClick={openCreatePage}
          >
            <PlusIcon />
            {t("addItem")}
          </Button>
        </div>
      }
    >
      {history.modal}
      <Toast
        open={toastOpen}
        message={t("deleteSuccess")}
        variant="danger"
        onClose={() => setToastOpen(false)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t("confirmDeleteTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmDeleteBody", {
                name: deleteTarget?.name ?? "",
              })}
            </p>
            {deleteError ? (
              <p className="text-danger" role="alert">
                {deleteError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        confirming={isDeleting}
        confirmingLabel={t("deleting")}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />

      <div className="flex min-h-0 w-full flex-col gap-5">
        <CatalogSummaryCard
          label={t("totalItems")}
          count={status === "success" ? totalItems : null}
          isLoading={status === "loading" || status === "idle"}
        />
        <ItemsToolbar
          filters={filters}
          categories={categories}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
          onActiveChange={setIsActive}
        />

        {status === "loading" || status === "idle" ? (
          <LoadingState message={tShared("loading")} />
        ) : status === "error" ? (
          <ErrorState
            title={t("listError")}
            message={error ?? undefined}
            retryLabel={t("retry")}
            onRetry={refresh}
          />
        ) : groupedItems.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="flex flex-col gap-6 pb-2">
            <div className="flex justify-end">
              <CategoryToggleButton allCollapsed={allCollapsed} onClick={toggleAll} />
            </div>
            {groupedItems.map(({ category, items }) => (
              <CategoryItemsTable
                key={category.id}
                category={category}
                items={items}
                isCollapsed={isCategoryCollapsed(category.id)}
                onToggle={() => toggleCategory(category.id)}
                onEdit={openEditPage}
                onDelete={setDeleteTarget}
                onHistory={(item) => history.openRecord(item.id, item.name)}
              />
            ))}
          </div>
        )}
        {status === "success" ? (
          <CatalogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        ) : null}
      </div>
    </AppShell>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
