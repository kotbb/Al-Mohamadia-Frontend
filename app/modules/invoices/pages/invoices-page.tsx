"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { InvoiceFilters } from "@/app/modules/invoices/components/invoice-filters";
import { InvoiceShareModal } from "@/app/modules/invoices/components/invoice-share-modal";
import { InvoicesList } from "@/app/modules/invoices/components/invoices-list";
import { useInvoices } from "@/app/modules/invoices/hooks/use-invoices";
import type { SalesInvoice } from "@/app/modules/invoices/types/invoices.types";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
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
  const [shareInvoiceTarget, setShareInvoiceTarget] = useState<SalesInvoice | null>(
    null,
  );

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
    customRange,
    setCustomRange,
    setPeriodDate,
    searchInput,
    setSearchInput,
    listStatus,
    hasLoaded,
    isRefreshing,
    actionsDisabled,
    listError,
    refresh,
    toast,
    clearToast,
    confirmInvoice,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    isConfirming,
    confirmError,
  } = useInvoices();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      router.replace("/invoices/new");
    }
  }, [searchParams, router]);

  function openCreate() {
    router.push("/invoices/new");
  }

  function handleEdit(invoice: SalesInvoice) {
    router.push(`/invoices/${invoice.id}/edit`);
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
      {shareInvoiceTarget && <InvoiceShareModal invoiceId={shareInvoiceTarget.id} onClose={() => setShareInvoiceTarget(null)} />}
      <Toast
        open={toast !== null}
        message={toastMessage}
        variant={toast?.variant ?? "success"}
        onClose={clearToast}
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
        {hasLoaded ? (
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
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
          onPeriodDateChange={setPeriodDate}
        />

        <div aria-busy={isRefreshing}>
          {hasLoaded ? (
            <div
              className="mb-2 flex min-h-6 items-center gap-2 text-sm text-text-secondary"
              role="status"
            >
              {isRefreshing ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  {t("updatingList")}
                </>
              ) : listStatus === "error" ? (
                <div
                  className="flex flex-wrap items-center gap-2 text-danger"
                  role="alert"
                >
                  <span>{listError ?? t("listError")}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                  >
                    {t("retry")}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
          <InvoicesList
            invoices={invoices}
            customerNames={customerNames}
            status={hasLoaded ? "success" : listStatus}
            actionsDisabled={actionsDisabled}
            error={listError}
            onRetry={refresh}
            onEdit={handleEdit}
            onPrint={(invoice) => router.push(`/invoices/${invoice.id}/export`)}
            onShare={(invoice) => setShareInvoiceTarget(invoice)}
            onCancel={openCancelConfirm}
            onHistory={(invoice) =>
              history.openRecord(invoice.id, invoice.invoiceNumber)
            }
          />
        </div>

        {hasLoaded && totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={actionsDisabled || page <= 1}
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
              disabled={actionsDisabled || page >= totalPages}
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
