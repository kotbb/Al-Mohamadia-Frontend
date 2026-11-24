"use client";

import { InvoicePartySection } from "@/app/modules/shared/components/invoice-party-section";
import { InvoiceDetailTable } from "@/app/modules/shared/components/invoice-detail-table";
import { InvoicePaidAmount } from "@/app/modules/shared/components/invoice-paid-amount";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BackButton } from "@/app/modules/shared/components/back-button";
import { AppShell } from "@/app/layout/app-shell";
import { formatInvoiceDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { usePurchaseDetail } from "@/app/modules/purchases/hooks/use-purchase-detail";
import { Badge } from "@/app/modules/shared/components/badge";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Toast } from "@/app/modules/shared/components/toast";

interface PurchaseDetailPageProps {
  purchaseId: string;
}

export function PurchaseDetailPage({ purchaseId }: PurchaseDetailPageProps) {
  const t = useTranslations("purchases");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const currency = t("currency");

  const {
    purchase,
    supplier,
    itemsMap,
    status,
    error,
    refresh,
    isCancelConfirmOpen,
    openCancelConfirm,
    closeCancelConfirm,
    submitCancel,
    isCancelling,
    cancelError,
    toast,
    clearToast,
  } = usePurchaseDetail(purchaseId);

  const isCurrentRecord = purchase?.id === purchaseId;
  const title = purchase && isCurrentRecord ? t("detailTitle", { number: purchase.invoiceNumber }) : t("title");

  const subtitle = purchase && isCurrentRecord ? formatInvoiceDate(purchase.createdAt, locale) : undefined;

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      navigation={<BackButton fallback="/purchases" />}
      metadata={
        purchase && isCurrentRecord && status === "success" ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant={purchase.status === "saved" ? "success" : "danger"}>
              {purchase.status === "saved" ? t("statusSaved") : t("statusCancelled")}
            </Badge>
            {purchase.remaining <= 0 ? (
              <Badge variant="success">{t("paidInFull")}</Badge>
            ) : (
              <Badge variant="warning">{t("unpaidRemaining")}</Badge>
            )}
          </div>
        ) : null
      }
      actions={
        purchase && isCurrentRecord && status === "success" && purchase.status === "saved" ? (
          <Link
            href={`/purchases/${purchase.id}/edit`}
            className="ds-focus-ring inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-primary hover:bg-surface-muted"
          >
            {t("edit")}
          </Link>
        ) : null
      }
    >
      <Toast open={toast !== null} message={t("cancelSuccess")} variant="success" onClose={clearToast} />

      <ConfirmDialog
        open={isCancelConfirmOpen}
        title={t("confirmCancelTitle")}
        description={
          <div className="flex flex-col gap-2">
            <p>
              {t("confirmCancelBody", {
                number: purchase?.invoiceNumber ?? "",
              })}
            </p>
            {cancelError ? (
              <p className="text-danger" role="alert">
                {cancelError}
              </p>
            ) : null}
          </div>
        }
        confirmLabel={isCancelling ? tShared("loading") : t("confirmCancelAction")}
        cancelLabel={t("modalCancel")}
        confirming={isCancelling}
        tone="danger"
        onConfirm={() => void submitCancel()}
        onCancel={closeCancelConfirm}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {status === "loading" || status === "idle" || (status === "success" && !isCurrentRecord) ? (
          <LoadingState message={tShared("loading")} />
        ) : status === "error" || !purchase ? (
          <ErrorState title={t("detailError")} message={error ?? undefined} retryLabel={t("retry")} onRetry={refresh} />
        ) : (
          <>
            {/* Status Alert if Cancelled */}
            {purchase.status === "cancelled" ? (
              <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">
                <WarningIcon />
                <span className="text-sm font-medium">{t("cancelledNotice")}</span>
              </div>
            ) : null}

            {/* Line items Card */}
            <InvoicePartySection
              label={t("colSupplier")}
              name={supplier?.name ?? "-"}
              href={supplier ? `/suppliers/${supplier.id}` : undefined}
            />
            <SurfaceCard>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">{t("linesDetailTitle")}</h2>
              <InvoiceDetailTable
                total={purchase.total}
                unavailableLabel={t("validationItem")}
                lines={purchase.lines.map((line) => ({
                  ...line,
                  unitRate: line.unitCost,
                  name: itemsMap[line.itemId]?.name ?? null,
                }))}
              />
            </SurfaceCard>

            {/* Financial Summary Card */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-text-secondary">{t("total")}</p>
                <p className="mt-1 text-lg font-bold text-text-primary">
                  {formatMoney(purchase.total, locale)} {currency}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-text-secondary">{t("paid")}</p>
                <p className="mt-1 text-lg font-bold text-success">
                  <InvoicePaidAmount
                    paid={purchase.paid}
                    accountPaymentAmount={purchase.accountPaymentAmount}
                    currency={currency}
                  />
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-text-secondary">{t("remaining")}</p>
                <p className={`mt-1 text-lg font-bold ${purchase.remaining > 0 ? "text-danger" : "text-success"}`}>
                  {formatMoney(purchase.remaining, locale)} {currency}
                </p>
              </div>
            </div>

            {/* Notes Card if any */}
            {purchase.notes ? (
              <SurfaceCard>
                <h3 className="text-xs font-semibold text-text-secondary">{t("fieldNotes")}</h3>
                <p className="mt-1 text-sm text-text-primary whitespace-pre-wrap">{purchase.notes}</p>
              </SurfaceCard>
            ) : null}

            {purchase.status === "saved" ? (
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                <Button type="button" variant="danger" onClick={openCancelConfirm}>
                  <CancelIcon />
                  <span>{t("cancelPurchase")}</span>
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}

function CancelIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="m9 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
