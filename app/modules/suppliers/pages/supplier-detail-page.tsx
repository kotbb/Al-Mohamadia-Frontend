"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { RecordSupplierPaymentModal } from "@/app/modules/supplier-payments/components/record-supplier-payment-modal";
import { useRecordSupplierPayment } from "@/app/modules/supplier-payments/hooks/use-record-supplier-payment";
import { SupplierFormModal } from "@/app/modules/suppliers/components/supplier-form-modal";
import { useSupplierDetail } from "@/app/modules/suppliers/hooks/use-supplier-detail";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { AccountFinancialSummary } from "@/app/modules/shared/components/account-financial-summary";
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
  const account = useTranslations("accountDetails");
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
    originalPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    formAmountOwed,
    setFormAmountOwed,
    isSaving,
    formError,
    submitForm,
    toast,
    clearToast,
  } = useSupplierDetail(supplierId);

  const refreshPayments = supplierPayments.refresh;
  const refreshPurchases = supplierPurchases.refresh;
  useEffect(() => {
    refreshPayments();
    refreshPurchases();
  }, [supplier?.amountOwed, refreshPayments, refreshPurchases]);

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
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary hover:bg-surface-muted"
          >
            {t("backToList")}
          </Link>
          {supplier.isActive ? (
            <Link href={`/purchases/new?supplierId=${supplier.id}`}
              className="ds-focus-ring inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
              {account("newInvoice")}
            </Link>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!supplier.isActive}
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
        originalPhone={originalPhone}
        onPhoneChange={setFormPhone}
        address={formAddress}
        onAddressChange={setFormAddress}
        amountOwed={formAmountOwed}
        onAmountOwedChange={setFormAmountOwed}
        isSubmitting={isSaving}
        error={formError}
        onSubmit={submitForm}
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
            supplierPayments.refresh();
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
            supplierPurchases.refresh();
          })
        }
        onCancel={supplierPayments.closeCancelConfirm}
      />

      <div className="flex flex-col gap-4">
        <AccountFinancialSummary
          totalInvoiced={supplier.financialSummary?.totalInvoiced ?? 0}
          totalPaid={supplier.financialSummary?.totalPaid ?? 0}
          currentBalance={supplier.amountOwed} party="supplier" currency={t("currency")} />

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
            supplierPurchases.refresh();
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
