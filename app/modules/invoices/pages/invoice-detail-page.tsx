"use client";

import { InvoicePartySection } from "@/app/modules/shared/components/invoice-party-section";
import { InvoiceDetailTable } from "@/app/modules/shared/components/invoice-detail-table";
import { InvoicePaidAmount } from "@/app/modules/shared/components/invoice-paid-amount";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BackButton } from "@/app/modules/shared/components/back-button";
import { useAppNavigation } from "@/app/modules/shared/hooks/use-app-navigation";
import type { InvoiceNavigationMode } from "../types/invoices.types";
import { Link } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { CancelInvoiceDialog } from "@/app/modules/invoices/components/cancel-invoice-dialog";
import { useInvoiceNeighbors } from "../hooks/use-invoice-neighbors";
import { InvoiceNavigation } from "../components/invoice-navigation";
import { InvoiceShareModal } from "@/app/modules/invoices/components/invoice-share-modal";
import { useInvoiceDetail } from "@/app/modules/invoices/hooks/use-invoice-detail";
import { formatInvoiceDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import { Badge } from "@/app/modules/shared/components/badge";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Toast } from "@/app/modules/shared/components/toast";

interface InvoiceDetailPageProps {
  invoiceId: string;
}

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const t = useTranslations("invoices");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const router = useAppNavigation();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const navigation = useInvoiceNeighbors(invoiceId);
  const searchParams = useSearchParams();
  const [navigationChoice, setNavigationChoice] = useState<{
    invoiceId: string;
    mode: InvoiceNavigationMode;
  } | null>(null);
  const requestedMode = searchParams.get("navigation");
  const navigationMode =
    navigationChoice?.invoiceId === invoiceId
      ? navigationChoice.mode
      : requestedMode === "customer" || requestedMode === "cash"
        ? requestedMode
        : "number";
  const {
    invoice,
    status,
    error,
    refresh,
    customerName,
    itemsById,
    isCancelOpen,
    openCancel,
    closeCancel,
    submitCancel,
    isCancelling,
    cancelError,
    toastKind,
    clearToast,
  } = useInvoiceDetail(invoiceId);

  const currency = t("currency");
  const isCurrentRecord = invoice?.id === invoiceId;
  const title = invoice && isCurrentRecord ? t("detailTitle", { number: invoice.invoiceNumber }) : t("title");
  const subtitle = invoice && isCurrentRecord ? formatInvoiceDate(invoice.createdAt, locale) : undefined;

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      navigation={<BackButton fallback="/invoices" />}
      metadata={
        invoice && isCurrentRecord && status === "success" ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant={invoice.status === "saved" ? "success" : "danger"}>
              {invoice.status === "saved" ? t("statusSaved") : t("statusCancelled")}
            </Badge>
            {invoice.remaining <= 0 ? (
              <Badge variant="success">{t("paidInFull")}</Badge>
            ) : (
              <Badge variant="warning">{t("unpaidRemaining")}</Badge>
            )}
          </div>
        ) : null
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {invoice && isCurrentRecord && status === "success" ? (
            <>
              <Button type="button" variant="primary" onClick={() => router.push(`/invoices/${invoice.id}/export`)}>
                <PrinterIcon />
                {t("print")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="!border-transparent !bg-[#25D366] !text-white hover:!bg-[#20c45b]"
                onClick={() => setIsShareOpen(true)}
              >
                <WhatsAppIcon />
                {t("whatsappOnly")}
              </Button>
            </>
          ) : null}
          {invoice && isCurrentRecord && status === "success" && invoice.status === "saved" ? (
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className="ds-focus-ring inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted"
            >
              {t("editInvoice")}
            </Link>
          ) : null}
        </div>
      }
    >
      <Toast open={toastKind === "cancelled"} message={t("cancelSuccess")} variant="success" onClose={clearToast} />
      <Toast open={toastKind === "updated"} message={t("updateSuccess")} variant="success" onClose={clearToast} />

      <CancelInvoiceDialog
        open={isCancelOpen}
        invoiceNumber={invoice?.invoiceNumber ?? ""}
        confirming={isCancelling}
        error={cancelError}
        onConfirm={() => void submitCancel()}
        onCancel={closeCancel}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {status === "loading" || status === "idle" || (status === "success" && !isCurrentRecord) ? (
          <LoadingState message={tShared("loading")} />
        ) : status === "error" || !invoice ? (
          <ErrorState title={t("detailError")} message={error ?? undefined} retryLabel={t("retry")} onRetry={refresh} />
        ) : (
          <>
            <SurfaceCard padding="sm">
              <InvoiceNavigation
                mode={navigationMode}
                onModeChange={(mode) => setNavigationChoice({ invoiceId, mode })}
                neighbors={navigation.neighbors}
                isCustomerSale={invoice.type === "customer_sale"}
              />
              {navigation.failed && (
                <p role="alert" className="text-sm text-danger">
                  {t("neighborLoadError")}{" "}
                  <button type="button" className="ds-focus-ring underline" onClick={navigation.retry}>
                    {t("retryNavigation")}
                  </button>
                </p>
              )}
            </SurfaceCard>
            <InvoicePartySection
              label={t("customer")}
              name={invoice.type === "cash_sale" ? t("cashCustomer") : customerName || "-"}
              href={
                invoice.type === "customer_sale" && invoice.customerId && invoice.customer && customerName
                  ? `/customers/${invoice.customerId}`
                  : undefined
              }
            />
            <SurfaceCard>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">{t("linesDetailTitle")}</h2>
              <InvoiceDetailTable
                total={invoice.total}
                unavailableLabel={t("itemUnavailable")}
                lines={invoice.lines.map((line) => ({
                  ...line,
                  unitRate: line.piecePrice,
                  name: itemsById[line.itemId]?.name ?? null,
                }))}
              />
            </SurfaceCard>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-text-secondary">{t("total")}</p>
                <p className="mt-1 text-lg font-bold text-text-primary">
                  {formatMoney(invoice.total, locale)} {currency}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-text-secondary">{t("discount")}</p>
                <p className="mt-1 text-lg font-bold text-text-primary">
                  {formatMoney(invoice.discount, locale)} {currency}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-text-secondary">{t("paid")}</p>
                <p className="mt-1 text-lg font-bold text-success">
                  <InvoicePaidAmount
                    paid={invoice.paid}
                    accountPaymentAmount={invoice.accountPaymentAmount}
                    currency={currency}
                  />
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-medium text-text-secondary">{t("remaining")}</p>
                <p className={`mt-1 text-lg font-bold ${invoice.remaining > 0 ? "text-danger" : "text-success"}`}>
                  {formatMoney(invoice.remaining, locale)} {currency}
                </p>
              </div>
            </div>

            {invoice.status === "saved" ? (
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
                <Button type="button" variant="danger" onClick={openCancel}>
                  <CancelIcon />
                  {t("cancel")}
                </Button>
              </div>
            ) : null}

            {isShareOpen && (
              <InvoiceShareModal
                invoiceId={invoice.id}
                onRestore={() => setIsShareOpen(true)}
                onClose={() => setIsShareOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function PrinterIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M6 14h12v7H6v-7Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <circle cx="18" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17.5 6.5A7.8 7.8 0 0 0 12 4.2C7.7 4.2 4.2 7.7 4.2 12c0 1.4.4 2.7 1.1 3.9L4 20l4.3-1.1c1.1.6 2.4 1 3.7 1 4.3 0 7.8-3.5 7.8-7.8 0-2.1-.8-4.1-2.3-5.6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M15.3 14.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.6.8-.1.1-.2.2-.4.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.4.1-.1.1-.2.2-.3 0-.1 0-.2-.1-.3s-.5-1.2-.7-1.6c-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.1-.4-.2Z"
        fill="currentColor"
      />
    </svg>
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
