"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { RecordSupplierPaymentModal } from "@/app/modules/supplier-payments/components/record-supplier-payment-modal";
import { useRecordSupplierPayment } from "@/app/modules/supplier-payments/hooks/use-record-supplier-payment";
import { SupplierFormModal } from "@/app/modules/suppliers/components/supplier-form-modal";
import { SupplierMergeModal } from "@/app/modules/suppliers/components/supplier-merge-modal";
import { useSupplierDetail } from "@/app/modules/suppliers/hooks/use-supplier-detail";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";
import { PurchasesTable } from "@/app/modules/purchases/components/purchases-table";
import { usePurchases } from "@/app/modules/purchases/hooks/use-purchases";
import { SupplierPaymentsTable } from "@/app/modules/supplier-payments/components/supplier-payments-table";
import { useSupplierAccountPayments } from "@/app/modules/supplier-payments/hooks/use-supplier-account-payments";

interface SupplierDetailPageProps {
  supplierId: string;
}

export function SupplierDetailPage({ supplierId }: SupplierDetailPageProps) {
  const t = useTranslations("suppliers");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const backHref =
    fromParam && fromParam.startsWith("/") ? fromParam : "/suppliers";
  const supplierPurchases = usePurchases({ supplierId, pageSize: 10 });
  const supplierPayments = useSupplierAccountPayments(supplierId);
  const purchaseHistory = useAuditHistory({ entityType: "PurchaseInvoice" });
  const supplierPaymentHistory = useAuditHistory({
    entityType: "SupplierPayment",
  });
  const recordPaymentHook = useRecordSupplierPayment();
  const [paymentToast, setPaymentToast] = useState<
    "recorded" | "cancelled" | null
  >(null);
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
      subtitle={supplier.phone ?? "-"}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary hover:bg-surface-muted"
          >
            {t("backToList")}
          </Link>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={supplier.amountOwed <= 0 || !supplier.isActive}
            title={
              supplier.amountOwed <= 0 ? t("recordPaymentDisabled") : undefined
            }
            onClick={() =>
              recordPaymentHook.open({
                id: supplier.id,
                name: supplier.name,
                amountOwed: supplier.amountOwed,
              })
            }
          >
            {t("recordPayment")}
          </Button>
          <Link
            href={`/purchases/new?supplierId=${supplier.id}`}
            className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary hover:bg-surface-muted"
          >
            {t("newPurchase")}
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openEdit}
          >
            {t("edit")}
          </Button>
        </div>
      }
    >
      {purchaseHistory.modal}
      {supplierPaymentHistory.modal}
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

      <ConfirmDialog
        open={supplierPurchases.confirmPurchase !== null}
        title={t("confirmCancelPurchaseTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmCancelPurchaseBody", {
                number: supplierPurchases.confirmPurchase?.invoiceNumber ?? "",
              })}
            </p>
            {supplierPurchases.confirmError ? (
              <p className="text-danger" role="alert">
                {supplierPurchases.confirmError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={t("confirmCancelPurchaseAction")}
        cancelLabel={t("modalCancel")}
        confirming={supplierPurchases.isConfirming}
        tone="danger"
        onConfirm={() =>
          void supplierPurchases.submitCancel(() => {
            refresh();
          })
        }
        onCancel={supplierPurchases.closeCancelConfirm}
      />

      <ConfirmDialog
        open={supplierPayments.confirmPayment !== null}
        title={t("confirmCancelPaymentTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmCancelPaymentBody", {
                amount: formatMoney(
                  supplierPayments.confirmPayment?.amount ?? 0,
                  locale,
                ),
                currency: t("currency"),
              })}
            </p>
            {supplierPayments.cancelError ? (
              <p className="text-danger" role="alert">
                {supplierPayments.cancelError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={t("confirmCancelPaymentAction")}
        cancelLabel={t("modalCancel")}
        confirming={supplierPayments.isCancelling}
        tone="danger"
        onConfirm={() =>
          void supplierPayments.submitCancel(() => {
            setPaymentToast("cancelled");
            refresh();
          })
        }
        onCancel={supplierPayments.closeCancelConfirm}
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
                  <dt className="text-text-muted">{t("detailPhone")}</dt>
                  <dd className="font-medium text-text-primary">
                    {supplier.phone ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted">{t("detailAddress")}</dt>
                  <dd className="font-medium text-text-primary">
                    {supplier.address?.trim() ? supplier.address : "-"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="lg:text-end">
              <p className="text-sm text-text-secondary">
                {t("currentAmountOwed")}
              </p>
              <p className={`mt-2 text-3xl font-bold ${supplier.amountOwed > 0 ? "text-danger" : "text-text-primary"}`}>
                {formatMoney(supplier.amountOwed, locale)} {t("currency")}
              </p>
            </div>
          </div>
        </SurfaceCard>

        {/* Purchases History Section */}
        <SurfaceCard padding="lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text-primary">
                {t("purchaseHistoryTitle")}
              </h2>
              <Link
                href={`/purchases/new?supplierId=${supplier.id}`}
                className="ds-focus-ring inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                + {t("newPurchase")}
              </Link>
            </div>

            <PurchasesTable
              purchases={supplierPurchases.purchases}
              showSupplier={false}
              status={supplierPurchases.listStatus}
              error={supplierPurchases.listError}
              onRetry={supplierPurchases.refresh}
              onCancel={supplierPurchases.openCancelConfirm}
              onHistory={(purchase) =>
                purchaseHistory.openRecord(purchase.id, purchase.invoiceNumber)
              }
            />

            {supplierPurchases.listStatus === "success" &&
            supplierPurchases.totalPages > 1 ? (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={supplierPurchases.page <= 1}
                  onClick={() =>
                    supplierPurchases.setPage(supplierPurchases.page - 1)
                  }
                >
                  {tShared("prevPage")}
                </Button>
                <span className="text-sm text-text-secondary">
                  {supplierPurchases.page} / {supplierPurchases.totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={
                    supplierPurchases.page >= supplierPurchases.totalPages
                  }
                  onClick={() =>
                    supplierPurchases.setPage(supplierPurchases.page + 1)
                  }
                >
                  {tShared("nextPage")}
                </Button>
              </div>
            ) : null}
          </div>
        </SurfaceCard>

        {/* Payment History */}
        <SurfaceCard padding="lg">
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-text-primary">
              {t("paymentHistoryTitle")}
            </h2>
            <SupplierPaymentsTable
              payments={supplierPayments.payments}
              status={supplierPayments.status}
              error={supplierPayments.error}
              onRetry={supplierPayments.refresh}
              onCancel={supplierPayments.openCancelConfirm}
              onHistory={(payment, label) =>
                supplierPaymentHistory.openRecord(payment.id, label)
              }
            />
            {supplierPayments.status === "success" &&
            supplierPayments.totalPages > 1 ? (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={supplierPayments.page <= 1}
                  onClick={() =>
                    supplierPayments.setPage(supplierPayments.page - 1)
                  }
                >
                  {tShared("prevPage")}
                </Button>
                <span className="text-sm text-text-secondary">
                  {supplierPayments.page} / {supplierPayments.totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={
                    supplierPayments.page >= supplierPayments.totalPages
                  }
                  onClick={() =>
                    supplierPayments.setPage(supplierPayments.page + 1)
                  }
                >
                  {tShared("nextPage")}
                </Button>
              </div>
            ) : null}
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

      <RecordSupplierPaymentModal
        open={recordPaymentHook.isOpen}
        onClose={recordPaymentHook.close}
        supplier={recordPaymentHook.supplier}
        amount={recordPaymentHook.amount}
        onAmountChange={recordPaymentHook.setAmount}
        method={recordPaymentHook.method}
        onMethodChange={recordPaymentHook.setMethod}
        notes={recordPaymentHook.notes}
        onNotesChange={recordPaymentHook.setNotes}
        isSubmitting={recordPaymentHook.isSubmitting}
        error={recordPaymentHook.error}
        onSubmit={() => {
          void recordPaymentHook.submit(() => {
            setPaymentToast("recorded");
            refresh();
            supplierPayments.refresh();
          });
        }}
      />

      <Toast
        open={paymentToast !== null}
        message={
          paymentToast === "recorded"
            ? t("paymentRecordedSuccess")
            : paymentToast === "cancelled"
              ? t("paymentCancelledSuccess")
              : ""
        }
        variant="success"
        onClose={() => setPaymentToast(null)}
      />
    </AppShell>
  );
}
