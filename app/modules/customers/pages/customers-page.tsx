"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { CustomersList } from "@/app/modules/customers/components/customers-list";
import { CustomerFormModal } from "@/app/modules/customers/components/customer-form-modal";
import { CustomerMergeModal } from "@/app/modules/customers/components/customer-merge-modal";
import { useCustomers } from "@/app/modules/customers/hooks/use-customers";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";

export function CustomersPage() {
  const t = useTranslations("customers");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const hasDebtParam = searchParams.get("hasDebt");
  const initialDebtFilter =
    hasDebtParam === "1" || hasDebtParam === "true" ? "hasDebt" : "all";
  const {
    customers,
    totalDebt,
    debtorCount,
    page,
    totalPages,
    setPage,
    debtFilter,
    setDebtFilter,
    searchInput,
    setSearchInput,
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
    formPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    formBalance,
    setFormBalance,
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
    toast,
    clearToast,
    confirmKind,
    confirmCustomer,
    isConfirming,
    confirmError,
    openDeactivateConfirm,
    openActivateConfirm,
    openDeleteConfirm,
    closeConfirm,
    submitConfirm,
  } = useCustomers({ initialDebtFilter });

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
              : toast?.kind === "merged"
                ? t("mergeSuccess")
                : "";

  const confirmName = confirmCustomer?.name ?? "";
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
  const history = useAuditHistory({ entityType: "Customer" });

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {history.button}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-10 rounded-lg px-3.5 text-sm"
            onClick={() => void openMerge()}
          >
            {t("mergeButton")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="min-h-10 rounded-lg px-3.5 text-sm"
            onClick={openCreate}
          >
            <PlusIcon />
            {t("addCustomer")}
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

      <CustomerFormModal
        open={isFormOpen}
        mode={formMode}
        onClose={closeForm}
        name={formName}
        onNameChange={setFormName}
        phone={formPhone}
        onPhoneChange={setFormPhone}
        address={formAddress}
        onAddressChange={setFormAddress}
        balance={formBalance}
        onBalanceChange={setFormBalance}
        isSubmitting={isSaving}
        error={formError}
        onSubmit={submitForm}
      />

      <CustomerMergeModal
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
        <SurfaceCard padding="md">
          <div className="grid gap-4 sm:grid-cols-2 sm:divide-x sm:divide-border rtl:sm:divide-x-reverse">
            <div className="sm:px-4">
              <p className="text-sm text-text-secondary">
                {t("statTotalDebt")}
              </p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {formatMoney(totalDebt, locale)} {t("currency")}
              </p>
            </div>
            <div className="sm:px-4">
              <p className="text-sm text-text-secondary">
                {t("statDebtorCount")}
              </p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {debtorCount}
              </p>
            </div>
          </div>
        </SurfaceCard>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="w-full max-w-xs">
            <SegmentedControl
              value={debtFilter}
              onChange={setDebtFilter}
              options={[
                { value: "all", label: t("filterAll") },
                { value: "hasDebt", label: t("filterHasDebt") },
              ]}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              name="customerSearch"
              label={t("searchLabel")}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("searchPlaceholder")}
              autoComplete="off"
            />
          </div>
        </div>

        <CustomersList
          customers={customers}
          status={listStatus}
          error={listError}
          onRetry={refresh}
          onEdit={openEdit}
          onDeactivate={openDeactivateConfirm}
          onActivate={openActivateConfirm}
          onDelete={openDeleteConfirm}
          onHistory={(customer) =>
            history.openRecord(customer.id, customer.name)
          }
        />

        {listStatus === "success" && totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {t("prevPage")}
            </Button>
            <span className="text-sm text-text-secondary">
              {t("pageOf", { page, totalPages })}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("nextPage")}
            </Button>
          </div>
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
