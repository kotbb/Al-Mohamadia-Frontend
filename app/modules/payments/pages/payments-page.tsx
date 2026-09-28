"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { PaymentsFilters } from "@/app/modules/payments/components/payments-filters";
import { PaymentsTable } from "@/app/modules/payments/components/payments-table";
import { RecordPaymentModal } from "@/app/modules/payments/components/record-payment-modal";
import { usePayments } from "@/app/modules/payments/hooks/use-payments";
import { useRecordPayment } from "@/app/modules/payments/hooks/use-record-payment";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Toast } from "@/app/modules/shared/components/toast";

export function PaymentsPage() {
  const t = useTranslations("payments");
  const locale = useLocale();
  const currency = t("currency");
  const history = useAuditHistory({ entityType: "Payment" });
  const [recordSuccessToast, setRecordSuccessToast] = useState(false);
  const recordPaymentHook = useRecordPayment();

  const {
    payments,
    summaryTotal,
    page,
    setPage,
    totalPages,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    periodFilter,
    setPeriodFilter,
    periodDate,
    setPeriodDate,
    customerSearch,
    setCustomerSearch,
    selectedCustomer,
    selectCustomer,
    clearCustomer,
    customerSuggestions,
    isSearchingCustomers,
    listStatus,
    listError,
    customerNames,
    refresh,
    confirmPayment,
    isCancelling,
    cancelError,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    toast,
    clearToast,
  } = usePayments();

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
            onClick={() => recordPaymentHook.open()}
          >
            {t("recordTitle")}
          </Button>
        </div>
      }
    >
      {history.modal}
      <Toast
        open={recordSuccessToast}
        message={t("recordSuccess")}
        variant="success"
        onClose={() => setRecordSuccessToast(false)}
      />

      <RecordPaymentModal
        open={recordPaymentHook.isOpen}
        onClose={recordPaymentHook.close}
        customer={recordPaymentHook.customer}
        onSelectCustomer={recordPaymentHook.selectCustomer}
        onClearCustomer={recordPaymentHook.clearCustomer}
        amount={recordPaymentHook.amount}
        onAmountChange={recordPaymentHook.setAmount}
        method={recordPaymentHook.method}
        onMethodChange={recordPaymentHook.setMethod}
        notes={recordPaymentHook.notes}
        onNotesChange={recordPaymentHook.setNotes}
        isSubmitting={recordPaymentHook.isSubmitting}
        error={recordPaymentHook.error}
        onSubmit={() =>
          recordPaymentHook.submit(() => {
            refresh();
            setRecordSuccessToast(true);
          })
        }
      />

      <Toast
        open={toast !== null}
        message={t("cancelSuccess")}
        variant={toast?.variant ?? "success"}
        onClose={clearToast}
      />

      <ConfirmDialog
        open={confirmPayment !== null}
        title={t("confirmCancelTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmCancelBody", {
                amount: formatMoney(confirmPayment?.amount ?? 0, locale),
                currency,
              })}
            </p>
            {cancelError ? (
              <p className="text-danger" role="alert">
                {cancelError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={t("confirmCancelAction")}
        cancelLabel={t("modalCancel")}
        confirming={isCancelling}
        tone="danger"
        onConfirm={() => void submitCancel()}
        onCancel={closeCancelConfirm}
      />

      <div className="flex flex-col gap-6">
        {/* Total Collected Stat Card */}
        <SurfaceCard className="p-4 sm:p-5">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-text-secondary sm:text-sm">
              {t("totalCollected")}
            </p>
            <p className="text-2xl font-bold text-text-primary sm:text-3xl">
              {formatMoney(summaryTotal, locale)}{" "}
              <span className="text-sm font-normal text-text-secondary">
                {currency}
              </span>
            </p>
          </div>
        </SurfaceCard>

        {/* Filters */}
        <PaymentsFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          methodFilter={methodFilter}
          onMethodChange={setMethodFilter}
          periodFilter={periodFilter}
          onPeriodChange={setPeriodFilter}
          periodDate={periodDate}
          onPeriodDateChange={setPeriodDate}
          customerSearch={customerSearch}
          onCustomerSearchChange={setCustomerSearch}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={selectCustomer}
          onClearCustomer={clearCustomer}
          customerSuggestions={customerSuggestions}
          isSearchingCustomers={isSearchingCustomers}
        />

        {/* Table */}
        <PaymentsTable
          payments={payments}
          customerNames={customerNames}
          showCustomer={true}
          status={listStatus}
          error={listError}
          onRetry={refresh}
          onCancel={openCancelConfirm}
          onHistory={(payment, label) => history.openRecord(payment.id, label)}
        />

        {/* Pagination */}
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
