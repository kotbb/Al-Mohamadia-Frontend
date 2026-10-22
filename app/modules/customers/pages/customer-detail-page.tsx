"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { CustomerInvoiceHistory } from "@/app/modules/customers/components/customer-invoice-history";
import { CustomerFormModal } from "@/app/modules/customers/components/customer-form-modal";
import { useCustomerDetail } from "@/app/modules/customers/hooks/use-customer-detail";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { PaymentsTable } from "@/app/modules/payments/components/payments-table";
import { RecordPaymentModal } from "@/app/modules/payments/components/record-payment-modal";
import { useCustomerPayments } from "@/app/modules/payments/hooks/use-customer-payments";
import { useRecordPayment } from "@/app/modules/payments/hooks/use-record-payment";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { AccountFinancialSummary } from "@/app/modules/shared/components/account-financial-summary";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";

interface CustomerDetailPageProps {
  customerId: string;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const t = useTranslations("customers");
  const tShared = useTranslations("shared");
  const account = useTranslations("accountDetails");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const backHref =
    fromParam && fromParam.startsWith("/") ? fromParam : "/customers";
  const [paymentToast, setPaymentToast] = useState<
    "recorded" | "cancelled" | null
  >(null);
  const recordPaymentHook = useRecordPayment();
  const customerPayments = useCustomerPayments(customerId);
  const paymentHistory = useAuditHistory({ entityType: "Payment" });
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
    originalPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    formBalance,
    setFormBalance,
    isSaving,
    formError,
    submitForm,
    toast,
    clearToast,
  } = useCustomerDetail(customerId);

  const refreshPayments = customerPayments.refresh;
  useEffect(() => {
    refreshPayments();
  }, [customer?.balance, refreshPayments]);

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
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary hover:bg-surface-muted"
          >
            {t("backToList")}
          </Link>
          {customer.isActive ? (
            <Link href={`/invoices/new?customerId=${customer.id}`}
              className="ds-focus-ring inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
              {account("newInvoice")}
            </Link>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!customer.isActive}
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
        originalPhone={originalPhone}
        onPhoneChange={setFormPhone}
        address={formAddress}
        onAddressChange={setFormAddress}
        balance={formBalance}
        onBalanceChange={setFormBalance}
        isSubmitting={isSaving}
        error={formError}
        onSubmit={submitForm}
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
        <AccountFinancialSummary
          totalInvoiced={customer.financialSummary?.totalInvoiced ?? 0}
          totalPaid={customer.financialSummary?.totalPaid ?? 0}
          currentBalance={customer.balance} party="customer" currency={t("currency")} />

        <CustomerInvoiceHistory customerId={customerId} customerName={customer.name} onFinancialChange={() => { refresh(); customerPayments.refresh(); }} />

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
              onHistory={(payment, label) =>
                paymentHistory.openRecord(payment.id, label)
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
                  {tShared("prevPage")}
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
                  {tShared("nextPage")}
                </Button>
              </div>
            ) : null}
          </div>
        </SurfaceCard>


      </div>
    </AppShell>
  );
}
