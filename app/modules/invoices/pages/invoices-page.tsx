"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { InvoiceFilters } from "@/app/modules/invoices/components/invoice-filters";
import { InvoiceFormModal } from "@/app/modules/invoices/components/invoice-form-modal";
import { InvoicePreviewModal } from "@/app/modules/invoices/components/invoice-preview-modal";
import { InvoicesList } from "@/app/modules/invoices/components/invoices-list";
import { useInvoiceForm } from "@/app/modules/invoices/hooks/use-invoice-form";
import { useInvoices } from "@/app/modules/invoices/hooks/use-invoices";
import type { SalesInvoice } from "@/app/modules/invoices/types/invoices.types";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";

export function InvoicesPage() {
  const t = useTranslations("invoices");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<SalesInvoice | null>(null);
  const form = useInvoiceForm();

  const {
    invoices,
    customerNames,
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

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  function openCreate() {
    setIsCreateOpen(true);
  }

  function closeCreate() {
    setIsCreateOpen(false);
    form.resetForm();
    if (searchParams.get("new") === "1") {
      router.replace("/invoices");
    }
  }

  function handleCreateSuccess(createdId: string, printed: boolean) {
    setIsCreateOpen(false);
    form.resetForm();
    if (searchParams.get("new") === "1") {
      router.replace("/invoices");
    }
    showToast({ kind: "created", variant: "success" });
    refresh();
    if (printed) {
      // Find or set previewInvoice ID so preview modal opens immediately
      setPreviewInvoice({ id: createdId } as SalesInvoice);
    }
  }

  const toastMessage =
    toast?.kind === "cancelled"
      ? t("cancelSuccess")
      : toast?.kind === "created"
        ? t("createSuccess")
        : "";

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
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
      }
    >
      <InvoiceFormModal
        open={isCreateOpen}
        onClose={closeCreate}
        form={form}
        onSuccess={handleCreateSuccess}
      />
      <InvoicePreviewModal
        open={previewInvoice !== null}
        onClose={() => setPreviewInvoice(null)}
        invoiceId={previewInvoice?.id ?? null}
        initialInvoice={previewInvoice}
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
          onPrint={(invoice) => setPreviewInvoice(invoice)}
          onShare={(invoice) => void shareInvoice(invoice)}
          onCancel={openCancelConfirm}
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
