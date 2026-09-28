"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { InvoiceFilters } from "@/app/modules/invoices/components/invoice-filters";
import { InvoiceFormModal } from "@/app/modules/invoices/components/invoice-form-modal";
import { InvoicePreviewModal } from "@/app/modules/invoices/components/invoice-preview-modal";
import { InvoicesList } from "@/app/modules/invoices/components/invoices-list";
import { useInvoiceForm } from "@/app/modules/invoices/hooks/use-invoice-form";
import { useInvoices } from "@/app/modules/invoices/hooks/use-invoices";
import type { SalesInvoice } from "@/app/modules/invoices/types/invoices.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Toast } from "@/app/modules/shared/components/toast";

export function InvoicesPage() {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const router = useRouter();
  const history = useAuditHistory({ entityType: "SalesInvoice" });
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [autoPrintOnOpen, setAutoPrintOnOpen] = useState(false);
  const form = useInvoiceForm();

  const {
    invoices,
    customerNames,
    summaryTotalAmount,
    page,
    totalPages,
    setPage,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    periodDate,
    setPeriodDate,
    searchInput,
    setSearchInput,
    listStatus,
    listError,
    refresh,
    toast,
    clearToast,
    showToast,
    confirmInvoice,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    isConfirming,
    confirmError,
    shareInvoice,
    actionError,
    clearActionError,
  } = useInvoices();

  const isNewFromUrl = searchParams.get("new") === "1";
  const { resetForm } = form;

  useEffect(() => {
    if (isNewFromUrl) {
      resetForm();
      setIsFormOpen(true);
    }
  }, [isNewFromUrl, resetForm]);

  function openCreate() {
    form.resetForm();
    setIsFormOpen(true);
  }

  function handleEdit(invoice: SalesInvoice) {
    form.initializeForEdit(invoice);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    form.resetForm();
    if (searchParams.get("new") === "1") {
      router.replace("/invoices");
    }
  }

  function handleFormSuccess(id: string, printed: boolean) {
    const isEdit = form.isEdit;
    setIsFormOpen(false);
    form.resetForm();
    if (searchParams.get("new") === "1") {
      router.replace("/invoices");
    }
    showToast({ kind: isEdit ? "updated" : "created", variant: "success" });
    refresh();
    if (printed) {
      setAutoPrintOnOpen(true);
      setPreviewInvoice({ id } as SalesInvoice);
    }
  }

  const toastMessage =
    toast?.kind === "cancelled"
      ? t("cancelSuccess")
      : toast?.kind === "updated"
        ? t("updateSuccess")
        : toast?.kind === "created"
          ? t("createSuccess")
          : "";

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
            {t("addInvoice")}
          </Button>
        </div>
      }
    >
      {history.modal}
      <InvoiceFormModal
        open={isFormOpen}
        onClose={closeForm}
        form={form}
        onSuccess={handleFormSuccess}
      />
      <InvoicePreviewModal
        open={previewInvoice !== null}
        onClose={() => {
          setPreviewInvoice(null);
          setAutoPrintOnOpen(false);
        }}
        invoiceId={previewInvoice?.id ?? null}
        initialInvoice={previewInvoice}
        autoPrint={autoPrintOnOpen}
        customerName={
          previewInvoice?.customerId
            ? customerNames[previewInvoice.customerId]
            : null
        }
      />
      <Toast
        open={toast !== null}
        message={toastMessage}
        variant={toast?.variant ?? "success"}
        onClose={clearToast}
      />

      <Toast
        open={actionError !== null}
        message={actionError ?? ""}
        variant="danger"
        onClose={clearActionError}
      />

      <ConfirmDialog
        open={confirmInvoice !== null}
        title={t("confirmCancelTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmCancelBody", {
                number: confirmInvoice?.invoiceNumber ?? "",
              })}
            </p>
            {confirmError ? (
              <p className="text-danger" role="alert">
                {confirmError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={t("confirmCancelAction")}
        cancelLabel={t("modalCancel")}
        confirming={isConfirming}
        tone="danger"
        onConfirm={() => void submitCancel()}
        onCancel={closeCancelConfirm}
      />

      <div className="flex flex-col gap-4">
        {listStatus === "success" ? (
          <SurfaceCard padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-1">
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  {t("summarySalesTotal")}
                </p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {formatMoney(summaryTotalAmount, locale)} {t("currency")}
                </p>
              </div>
            </div>
          </SurfaceCard>
        ) : null}

        <InvoiceFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          periodFilter={periodFilter}
          onPeriodChange={setPeriodFilter}
          periodDate={periodDate}
          onPeriodDateChange={setPeriodDate}
        />

        <InvoicesList
          invoices={invoices}
          customerNames={customerNames}
          status={listStatus}
          error={listError}
          onRetry={refresh}
          onEdit={handleEdit}
          onPrint={(invoice) => setPreviewInvoice(invoice)}
          onShare={(invoice) => void shareInvoice(invoice)}
          onCancel={openCancelConfirm}
          onHistory={(invoice) =>
            history.openRecord(invoice.id, invoice.invoiceNumber)
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
