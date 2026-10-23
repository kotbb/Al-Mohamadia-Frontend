"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { CategoriesList } from "@/app/modules/items/components/categories-list";
import { CatalogSummaryCard } from "@/app/modules/items/components/catalog-summary-card";
import { CatalogPagination } from "@/app/modules/items/components/catalog-pagination";
import { CategoriesToolbar } from "@/app/modules/items/components/categories-toolbar";
import { CategoryFormModal } from "@/app/modules/items/components/category-form-modal";
import { useCategories } from "@/app/modules/items/hooks/use-categories";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";

export function CategoriesPage() {
  const t = useTranslations("categories");
  const history = useAuditHistory({ entityType: "Category" });
  const {
    categories,
    pageCategories,
    page,
    totalPages,
    setPage,
    filters,
    setSearch,
    setIsActive,
    hasFilters,
    listStatus,
    listError,
    refresh,
    formMode,
    isFormOpen,
    openCreate,
    openEdit,
    closeForm,
    formName,
    setFormName,
    isSaving,
    formError,
    submitForm,
    toast,
    clearToast,
    confirmKind,
    confirmCategory,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
  } = useCategories();

  const toastMessage =
    toast?.kind === "created"
      ? t("createSuccess")
      : toast?.kind === "updated"
        ? t("updateSuccess")
        : toast?.kind === "activated"
          ? t("activateSuccess")
          : toast?.kind === "deactivated"
            ? t("deactivateSuccess")
            : toast?.kind === "deleted"
              ? t("deleteSuccess")
              : "";

  const confirmName = confirmCategory?.name ?? "";

  const confirmTitle =
    confirmKind === "delete"
      ? t("confirmDeleteTitle")
      : confirmKind === "deactivate"
        ? t("confirmDeactivateTitle")
        : confirmKind === "activate"
          ? t("confirmActivateTitle")
          : "";

  const confirmDescription =
    confirmKind === "delete"
      ? t("confirmDeleteBody", { name: confirmName })
      : confirmKind === "deactivate"
        ? t("confirmDeactivateBody", { name: confirmName })
        : confirmKind === "activate"
          ? t("confirmActivateBody", { name: confirmName })
          : "";

  const confirmLabel =
    confirmKind === "delete"
      ? t("delete")
      : confirmKind === "deactivate"
        ? t("deactivate")
        : t("activate");

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
            onClick={openCreate}
          >
            <PlusIcon />
            {t("addCategory")}
          </Button>
        </div>
      }
    >
      {history.modal}
      <Toast
        open={toast !== null}
        message={toastMessage}
        variant={toast?.variant ?? "success"}
        onClose={clearToast}
      />

      <CategoryFormModal
        open={isFormOpen}
        mode={formMode}
        onClose={closeForm}
        name={formName}
        onNameChange={setFormName}
        isSubmitting={isSaving}
        error={formError}
        onSubmit={submitForm}
      />

      <ConfirmDialog
        open={confirmKind !== null}
        title={confirmTitle}
        description={
          <div className="flex flex-col gap-2">
            <p>{confirmDescription}</p>
            {confirmError ? (
              <p className="text-danger" role="alert">
                {confirmError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={confirmLabel}
        cancelLabel={t("modalCancel")}
        confirming={isConfirming}
        tone={confirmKind === "activate" ? "success" : "danger"}
        onConfirm={() => void submitConfirm()}
        onCancel={closeConfirm}
      />

      <div className="space-y-6">
        <CatalogSummaryCard
          label={t("totalCategories")}
          count={listStatus === "success" ? categories.length : null}
          isLoading={listStatus === "loading" || listStatus === "idle"}
        />
        <CategoriesToolbar filters={filters} onSearchChange={setSearch} onActiveChange={setIsActive} />
        <CategoriesList
          categories={pageCategories}
          hasFilters={hasFilters}
          status={listStatus}
          error={listError}
          onRetry={refresh}
          onEdit={openEdit}
          onDeactivate={openDeactivateConfirm}
          onActivate={openActivateConfirm}
          onDelete={openDeleteConfirm}
          onHistory={(category) => history.openRecord(category.id, category.name)}
        />
        {listStatus === "success" ? (
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
