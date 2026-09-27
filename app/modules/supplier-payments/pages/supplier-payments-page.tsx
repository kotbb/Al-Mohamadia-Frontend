"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { RecordSupplierPaymentModal } from "@/app/modules/supplier-payments/components/record-supplier-payment-modal";
import { SupplierPaymentsFilters } from "@/app/modules/supplier-payments/components/supplier-payments-filters";
import { SupplierPaymentsTable } from "@/app/modules/supplier-payments/components/supplier-payments-table";
import { useRecordSupplierPayment } from "@/app/modules/supplier-payments/hooks/use-record-supplier-payment";
import { useSupplierPayments } from "@/app/modules/supplier-payments/hooks/use-supplier-payments";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Toast } from "@/app/modules/shared/components/toast";

export function SupplierPaymentsPage() {
  const t = useTranslations("supplierPayments");
  const locale = useLocale();
  const currency = t("currency");
  const history = useAuditHistory({ entityType: "SupplierPayment" });
  const [recordSuccessToast, setRecordSuccessToast] = useState(false);
  const recordPaymentHook = useRecordSupplierPayment();

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
    supplierSearch,
    setSupplierSearch,
    selectedSupplier,
    selectSupplier,
    clearSupplier,
    supplierSuggestions,
    isSearchingSuppliers,
    listStatus,
    listError,
    supplierNames,
    refresh,
    confirmPayment,
    isCancelling,
    cancelError,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    toast,
    clearToast,
  } = useSupplierPayments();

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

      <RecordSupplierPaymentModal
        open={recordPaymentHook.isOpen}
        onClose={recordPaymentHook.close}
        supplier={recordPaymentHook.supplier}
        onSelectSupplier={recordPaymentHook.selectSupplier}
        onClearSupplier={recordPaymentHook.clearSupplier}
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
        {/* Total Paid Stat Card */}
        <SurfaceCard className="p-4 sm:p-5">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-text-secondary sm:text-sm">
              {t("totalPaid")}
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
        <SupplierPaymentsFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          methodFilter={methodFilter}
          onMethodChange={setMethodFilter}
          periodFilter={periodFilter}
          onPeriodChange={setPeriodFilter}
          periodDate={periodDate}
          onPeriodDateChange={setPeriodDate}
          supplierSearch={supplierSearch}
          onSupplierSearchChange={setSupplierSearch}
          selectedSupplier={selectedSupplier}
          onSelectSupplier={selectSupplier}
          onClearSupplier={clearSupplier}
          supplierSuggestions={supplierSuggestions}
          isSearchingSuppliers={isSearchingSuppliers}
        />

        {/* Table */}
        <SupplierPaymentsTable
          payments={payments}
          supplierNames={supplierNames}
          showSupplier={true}
          status={listStatus}
          error={listError}
          onRetry={refresh}
          onCancel={openCancelConfirm}
          onViewHistory={(payment) =>
            history.openRecord(
              payment.id,
              formatMoney(payment.amount, locale),
            )
          }
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
