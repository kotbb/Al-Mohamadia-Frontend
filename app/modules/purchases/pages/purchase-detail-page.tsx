"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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

  const title = purchase
    ? t("detailTitle", { number: purchase.invoiceNumber })
    : t("title");

  const subtitleParts: string[] = [];
  if (purchase) {
    if (supplier) {
      subtitleParts.push(supplier.name);
    }
    subtitleParts.push(formatInvoiceDate(purchase.createdAt, locale));
  }

  return (
    <AppShell
      title={title}
      subtitle={subtitleParts.join(" · ") || undefined}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/purchases"
            className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted"
          >
            {t("backToList")}
          </Link>
        </div>
      }
    >
      <Toast
        open={toast !== null}
        message={t("cancelSuccess")}
        variant="success"
        onClose={clearToast}
      />

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
        confirmLabel={
          isCancelling ? tShared("loading") : t("confirmCancelAction")
        }
        cancelLabel={t("modalCancel")}
        confirming={isCancelling}
        tone="danger"
        onConfirm={() => void submitCancel()}
        onCancel={closeCancelConfirm}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {status === "loading" || status === "idle" ? (
          <LoadingState message={tShared("loading")} />
        ) : status === "error" || !purchase ? (
          <ErrorState
            title={t("detailError")}
            message={error ?? undefined}
            retryLabel={t("retry")}
            onRetry={refresh}
          />
        ) : (
          <>
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
                variant={purchase.status === "saved" ? "success" : "danger"}
              >
                {purchase.status === "saved"
                  ? t("statusSaved")
                  : t("statusCancelled")}
              </Badge>
              {supplier ? (
                <Link href={`/suppliers/${supplier.id}`}>
                  <Badge variant="info">{supplier.name}</Badge>
                </Link>
              ) : (
                <Badge variant="info">{t("supplierPurchase")}</Badge>
              )}
              {purchase.remaining <= 0 ? (
                <Badge variant="success">{t("paidInFull")}</Badge>
              ) : (
                <Badge variant="warning">{t("unpaidRemaining")}</Badge>
              )}
            </div>

            {/* Status Alert if Cancelled */}
            {purchase.status === "cancelled" ? (
              <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">
                <WarningIcon />
                <span className="text-sm font-medium">
                  {t("cancelledNotice")}
                </span>
              </div>
            ) : null}

            {/* Line items Card */}
            <SurfaceCard>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                {t("linesDetailTitle")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse text-sm lg:text-base">
                  <thead className="bg-surface-muted">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start font-medium text-text-secondary">
                        {t("fieldItem")}
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-text-secondary">
                        {t("fieldQty")}
                      </th>
                      <th className="px-4 py-3 text-end font-medium text-text-secondary">
                        {t("fieldPrice")}
                      </th>
                      <th className="px-4 py-3 text-end font-medium text-text-secondary">
                        {t("fieldLineTotal")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.lines.map((line, index) => {
                      const item = itemsMap[line.itemId];
                      const label = item ? item.name : null;
                      const dims =
                        line.thickness != null &&
                        line.width != null &&
                        line.length != null
                          ? `${line.thickness} × ${line.width} × ${line.length} ${locale === "ar" ? "م" : "m"}`
                          : null;
                      return (
                        <tr
                          key={`${line.itemId}-${index}`}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-4 py-3 text-text-primary">
                            <div className="font-semibold text-text-primary">
                              {label ?? (
                                <span className="italic text-text-secondary">
                                  {t("validationItem")}
                                </span>
                              )}
                            </div>
                            {dims ? (
                              <div className="mt-0.5 text-xs text-text-secondary">
                                {dims}
                              </div>
                            ) : null}
                            {line.note ? (
                              <div className="mt-0.5 text-xs text-text-secondary/90 italic">
                                {line.note}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-text-primary">
                            {line.quantity}
                          </td>
                          <td className="px-4 py-3 text-end whitespace-nowrap text-text-primary">
                            {formatMoney(line.unitCost, locale)} {currency}
                          </td>
                          <td className="px-4 py-3 text-end whitespace-nowrap font-medium text-text-primary">
                            {formatMoney(line.lineTotal, locale)} {currency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>

            {/* Financial Summary Card */}
            <SurfaceCard>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                    <p className="text-xs font-medium text-text-secondary">
                      {t("total")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-danger">
                      {formatMoney(purchase.total, locale)} {currency}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                    <p className="text-xs font-medium text-text-secondary">
                      {t("paid")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-danger">
                      {formatMoney(purchase.paid, locale)} {currency}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-border bg-surface-muted px-6 py-4 text-start lg:min-w-[15rem] lg:text-end">
                  <p className="text-xs font-medium text-text-secondary">
                    {t("remaining")}
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      purchase.remaining > 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {formatMoney(purchase.remaining, locale)} {currency}
                  </p>
                </div>
              </div>
            </SurfaceCard>

            {/* Notes Card if any */}
            {purchase.notes ? (
              <SurfaceCard>
                <h3 className="text-xs font-semibold text-text-secondary">
                  {t("fieldNotes")}
                </h3>
                <p className="mt-1 text-sm text-text-primary whitespace-pre-wrap">
                  {purchase.notes}
                </p>
              </SurfaceCard>
            ) : null}

            {purchase.status === "saved" ? (
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                <Button
                  type="button"
                  variant="danger"
                  onClick={openCancelConfirm}
                >
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
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="m9 9 6 6m0-6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
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
