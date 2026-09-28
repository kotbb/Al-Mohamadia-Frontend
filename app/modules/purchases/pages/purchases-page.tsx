"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { PurchaseFilters } from "@/app/modules/purchases/components/purchase-filters";
import { PurchaseFormModal } from "@/app/modules/purchases/components/purchase-form-modal";
import { PurchasesTable } from "@/app/modules/purchases/components/purchases-table";
import { usePurchaseForm } from "@/app/modules/purchases/hooks/use-purchase-form";
import { usePurchases } from "@/app/modules/purchases/hooks/use-purchases";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Toast } from "@/app/modules/shared/components/toast";

export function PurchasesPage() {
  const t = useTranslations("purchases");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const history = useAuditHistory({ entityType: "PurchaseInvoice" });
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewFromUrl = searchParams.get("new") === "1";
  const [isCreateOpenManual, setIsCreateOpenManual] = useState(false);
  const isCreateOpen = isNewFromUrl || isCreateOpenManual;

  const initialSupplierId = searchParams.get("supplierId");
  const form = usePurchaseForm({ initialSupplierId });

  const {
    purchases,
    supplierNames,
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
    showToast,
    clearToast,
    confirmPurchase,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    isConfirming,
    confirmError,
    actionError,
    clearActionError,
  } = usePurchases();

  function openCreate() {
    setIsCreateOpenManual(true);
  }

  function closeCreate() {
    setIsCreateOpenManual(false);
    form.resetForm();
    if (searchParams.get("new") === "1") {
      router.replace("/purchases");
    }
  }

  function handleCreateSuccess() {
    setIsCreateOpenManual(false);
    form.resetForm();
    if (searchParams.get("new") === "1") {
      router.replace("/purchases");
    }
    showToast({ kind: "created", variant: "success" });
    refresh();
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
            <span>{t("newPurchaseButton")}</span>
          </Button>
        </div>
      }
    >
      {history.modal}
      <PurchaseFormModal
        open={isCreateOpen}
        onClose={closeCreate}
        form={form}
        onSuccess={handleCreateSuccess}
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
        open={confirmPurchase !== null}
        title={t("confirmCancelTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmCancelBody", {
                number: confirmPurchase?.invoiceNumber ?? "",
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
        {/* Summary Card */}
        {listStatus === "success" ? (
          <SurfaceCard padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-1">
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  {t("summaryPurchasesTotal")}
                </p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {formatMoney(summaryTotalAmount, locale)} {t("currency")}
                </p>
              </div>
            </div>
          </SurfaceCard>
        ) : null}

        <PurchaseFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          periodFilter={periodFilter}
          onPeriodChange={setPeriodFilter}
          periodDate={periodDate}
          onPeriodDateChange={setPeriodDate}
        />

        <PurchasesTable
          purchases={purchases}
          supplierNames={supplierNames}
          showSupplier={true}
          status={listStatus}
          error={listError}
          onRetry={refresh}
          onCancel={openCancelConfirm}
        />

        {listStatus === "success" && totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {tShared("prevPage")}
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
              {tShared("nextPage")}
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
