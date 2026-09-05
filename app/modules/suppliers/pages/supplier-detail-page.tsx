"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { SupplierFormModal } from "@/app/modules/suppliers/components/supplier-form-modal";
import { SupplierMergeModal } from "@/app/modules/suppliers/components/supplier-merge-modal";
import { useSupplierDetail } from "@/app/modules/suppliers/hooks/use-supplier-detail";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";

interface SupplierDetailPageProps {
  supplierId: string;
}

export function SupplierDetailPage({ supplierId }: SupplierDetailPageProps) {
  const t = useTranslations("suppliers");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const {
    supplier,
    status,
    error,
    refresh,
    formMode,
    isFormOpen,
    openEdit,
    closeForm,
    formName,
    setFormName,
    formPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    formAmountOwed,
    setFormAmountOwed,
    isSaving,
    formError,
    submitForm,
    isMergeOpen,
    openMerge,
    closeMerge,
    mergeTargetId,
    setMergeTargetId,
    mergeSourceIds,
    toggleMergeSource,
    mergeOptions,
    isMerging,
    mergeError,
    submitMerge,
    confirmKind,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
    toast,
    clearToast,
  } = useSupplierDetail(supplierId);

  const toastMessage =
    toast?.kind === "updated"
      ? t("updateSuccess")
      : toast?.kind === "activated"
        ? t("activateSuccess")
        : toast?.kind === "deactivated"
          ? t("deactivateSuccess")
          : toast?.kind === "deleted"
            ? t("deleteSuccess")
            : toast?.kind === "merged"
              ? t("mergeSuccess")
              : "";

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
      ? t("confirmDeleteBody", { name: supplier?.name ?? "" })
      : confirmKind === "deactivate"
        ? t("confirmDeactivateBody", { name: supplier?.name ?? "" })
        : confirmKind === "activate"
          ? t("confirmActivateBody", { name: supplier?.name ?? "" })
          : "";
  const confirmLabel =
    confirmKind === "delete"
      ? t("delete")
      : confirmKind === "deactivate"
        ? t("deactivate")
        : t("activate");

  if (status === "loading") {
    return (
      <AppShell title={t("title")} subtitle={t("subtitle")}>
        <LoadingState message={tShared("loading")} />
      </AppShell>
    );
  }

  if (status === "error" || !supplier) {
    return (
      <AppShell title={t("title")} subtitle={t("subtitle")}>
        <ErrorState
          title={t("detailError")}
          message={error ?? undefined}
          retryLabel={t("retry")}
          onRetry={refresh}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={supplier.name}
      subtitle={supplier.phone ?? "—"}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/suppliers"
            className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary hover:bg-surface-muted"
          >
            {t("backToList")}
          </Link>
          <Button type="button" variant="secondary" size="sm" onClick={openEdit}>
            {t("edit")}
          </Button>
        </div>
      }
    >
      <Toast
        open={toast !== null}
        message={toastMessage}
        variant={toast?.variant ?? "success"}
        onClose={clearToast}
      />

      <SupplierFormModal
        open={isFormOpen}
        mode={formMode}
        onClose={closeForm}
        name={formName}
        onNameChange={setFormName}
        phone={formPhone}
        onPhoneChange={setFormPhone}
        address={formAddress}
        onAddressChange={setFormAddress}
        amountOwed={formAmountOwed}
        onAmountOwedChange={setFormAmountOwed}
        isSubmitting={isSaving}
        error={formError}
        onSubmit={submitForm}
      />

      <SupplierMergeModal
        open={isMergeOpen}
        onClose={closeMerge}
        options={mergeOptions}
        targetId={mergeTargetId}
        onTargetChange={setMergeTargetId}
        sourceIds={mergeSourceIds}
        onToggleSource={toggleMergeSource}
        isSubmitting={isMerging}
        error={mergeError}
        onSubmit={submitMerge}
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
        tone={confirmKind === "activate" ? "primary" : "danger"}
        onConfirm={() => void submitConfirm()}
        onCancel={closeConfirm}
      />

      <div className="flex flex-col gap-4">
        <SurfaceCard padding="lg">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium text-text-secondary">
                {t("personalDetails")}
              </h2>
              <dl className="mt-3 flex flex-col gap-3 text-base">
                <div>
                  <dt className="text-text-muted">{t("fieldPhone")}</dt>
                  <dd className="font-medium text-text-primary">
                    {supplier.phone ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted">{t("fieldAddress")}</dt>
                  <dd className="font-medium text-text-primary">
                    {supplier.address?.trim() ? supplier.address : "—"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="lg:text-end">
              <p className="text-sm text-text-secondary">{t("currentAmountOwed")}</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {formatMoney(supplier.amountOwed, locale)} {t("currency")}
              </p>
            </div>
          </div>
        </SurfaceCard>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => void openMerge()}
          >
            {t("mergeButton")}
          </Button>
          {supplier.isActive ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openDeactivateConfirm}
            >
              {t("deactivate")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openActivateConfirm}
            >
              {t("activate")}
            </Button>
          )}
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={supplier.amountOwed !== 0}
            onClick={openDeleteConfirm}
          >
            {supplier.amountOwed !== 0 ? t("deleteBlocked") : t("delete")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
