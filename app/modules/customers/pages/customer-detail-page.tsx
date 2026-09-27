"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { CustomerFormModal } from "@/app/modules/customers/components/customer-form-modal";
import { CustomerMergeModal } from "@/app/modules/customers/components/customer-merge-modal";
import { useCustomerDetail } from "@/app/modules/customers/hooks/use-customer-detail";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { PaymentsTable } from "@/app/modules/payments/components/payments-table";
import { RecordPaymentModal } from "@/app/modules/payments/components/record-payment-modal";
import { useCustomerPayments } from "@/app/modules/payments/hooks/use-customer-payments";
import { useRecordPayment } from "@/app/modules/payments/hooks/use-record-payment";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";

interface CustomerDetailPageProps {
  customerId: string;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const t = useTranslations("customers");
  const tAudit = useTranslations("audit");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const backHref = fromParam && fromParam.startsWith("/") ? fromParam : "/customers";
  const customerHistory = useAuditHistory({ entityType: "Customer" });
  const paymentHistory = useAuditHistory({ entityType: "Payment" });
  const [paymentToast, setPaymentToast] = useState<
    "recorded" | "cancelled" | null
  >(null);
  const recordPaymentHook = useRecordPayment();
  const customerPayments = useCustomerPayments(customerId);
  const {
    customer,
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
  } = useCustomerDetail(customerId);

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
      ? t("confirmDeleteBody", { name: customer?.name ?? "" })
      : confirmKind === "deactivate"
        ? t("confirmDeactivateBody", { name: customer?.name ?? "" })
        : confirmKind === "activate"
          ? t("confirmActivateBody", { name: customer?.name ?? "" })
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

  if (status === "error" || !customer) {
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
      title={customer.name}
      subtitle={customer.phone}
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
            variant="secondary"
            size="sm"
            className="min-h-10 rounded-lg px-3.5 text-sm"
            onClick={() => customerHistory.openRecord(customer.id, customer.name)}
          >
            {tAudit("viewHistory")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={customer.balance <= 0 || !customer.isActive}
            title={customer.balance <= 0 ? t("recordPaymentDisabled") : undefined}
            onClick={() =>
              recordPaymentHook.open({
                id: customer.id,
                name: customer.name,
                balance: customer.balance,
              })
            }
          >
            {t("recordPayment")}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={openEdit}>
            {t("edit")}
          </Button>
        </div>
      }
    >
      {customerHistory.modal}
      {paymentHistory.modal}
      <Toast
        open={toast !== null}
        message={toastMessage}
        variant={toast?.variant ?? "success"}
        onClose={clearToast}
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

      <RecordPaymentModal
        open={recordPaymentHook.isOpen}
        onClose={recordPaymentHook.close}
        customer={recordPaymentHook.customer}
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
            customerPayments.refresh();
          });
        }}
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
        open={customerPayments.confirmPayment !== null}
        title={t("confirmCancelPaymentTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmCancelPaymentBody", {
                amount: formatMoney(
                  customerPayments.confirmPayment?.amount ?? 0,
                  locale,
                ),
                currency: t("currency"),
              })}
            </p>
            {customerPayments.cancelError ? (
              <p className="text-danger" role="alert">
                {customerPayments.cancelError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={t("confirmCancelPaymentAction")}
        cancelLabel={t("modalCancel")}
        confirming={customerPayments.isCancelling}
        tone="danger"
        onConfirm={() =>
          void customerPayments.submitCancel(() => {
            setPaymentToast("cancelled");
            refresh();
          })
        }
        onCancel={customerPayments.closeCancelConfirm}
      />

      <div className="flex flex-col gap-6">
        <SurfaceCard padding="lg">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium text-text-secondary">
                {t("personalDetails")}
              </h2>
              <dl className="mt-3 flex flex-col gap-3 text-base">
                <div>
                  <dt className="text-text-muted">{t("fieldPhone")}</dt>
                  <dd className="font-medium text-text-primary">{customer.phone}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">{t("fieldAddress")}</dt>
                  <dd className="font-medium text-text-primary">
                    {customer.address?.trim() ? customer.address : "-"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="lg:text-end">
              <p className="text-sm text-text-secondary">{t("currentBalance")}</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">
                {formatMoney(customer.balance, locale)} {t("currency")}
              </p>
            </div>
          </div>
        </SurfaceCard>

        {/* Payment History Section */}
        <SurfaceCard padding="lg">
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-text-primary">
              {t("paymentHistoryTitle")}
            </h2>

            <PaymentsTable
              payments={customerPayments.payments}
              showCustomer={false}
              status={customerPayments.status}
              error={customerPayments.error}
              onRetry={customerPayments.refresh}
              onCancel={customerPayments.openCancelConfirm}
              onViewHistory={(payment) =>
                paymentHistory.openRecord(
                  payment.id,
                  formatMoney(payment.amount, locale),
                )
              }
            />

            {customerPayments.status === "success" &&
            customerPayments.totalPages > 1 ? (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={customerPayments.page <= 1}
                  onClick={() =>
                    customerPayments.setPage(customerPayments.page - 1)
                  }
                >
                  {tShared("prevPage") || "Previous"}
                </Button>
                <span className="text-sm text-text-secondary">
                  {customerPayments.page} / {customerPayments.totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={
                    customerPayments.page >= customerPayments.totalPages
                  }
                  onClick={() =>
                    customerPayments.setPage(customerPayments.page + 1)
                  }
                >
                  {tShared("nextPage") || "Next"}
                </Button>
              </div>
            ) : null}
          </div>
        </SurfaceCard>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" size="sm" onClick={() => void openMerge()}>
            {t("mergeButton")}
          </Button>
          {customer.isActive ? (
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
            disabled={customer.balance !== 0}
            onClick={openDeleteConfirm}
          >
            {customer.balance !== 0 ? t("deleteBlocked") : t("delete")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
