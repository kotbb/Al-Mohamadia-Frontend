"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { CancelInvoiceDialog } from "@/app/modules/invoices/components/cancel-invoice-dialog";
import { InvoiceShareModal } from "@/app/modules/invoices/components/invoice-share-modal";
import { getInvoiceNeighbors } from "@/app/modules/invoices/services/invoices.service";
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
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [neighbors, setNeighbors] = useState<{ previousId: string | null; nextId: string | null }>({ previousId: null, nextId: null });
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

  useEffect(() => {
    const controller = new AbortController();
    getInvoiceNeighbors(invoiceId, controller.signal).then(setNeighbors).catch(() => setNeighbors({ previousId: null, nextId: null }));
    return () => controller.abort();
  }, [invoiceId]);

  const currency = t("currency");
  const title = invoice
    ? t("detailTitle", { number: invoice.invoiceNumber })
    : t("title");
  const subtitleParts: string[] = [];
  if (invoice) {
    if (invoice.type === "cash_sale") {
      subtitleParts.push(t("cashCustomer"));
    } else if (customerName) {
      subtitleParts.push(customerName);
    }
    subtitleParts.push(formatInvoiceDate(invoice.createdAt, locale));
  }

  return (
    <AppShell
      title={title}
      subtitle={subtitleParts.join(" · ") || undefined}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {invoice && invoice.status === "saved" ? (
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted"
            >
              <EditIcon />
              {t("editInvoice")}
            </Link>
          ) : null}
          <Link
            href="/invoices"
            className="ds-focus-ring inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted"
          >
            {t("backToList")}
          </Link>
        </div>
      }
    >
      <Toast
        open={toastKind === "cancelled"}
        message={t("cancelSuccess")}
        variant="success"
        onClose={clearToast}
      />
      <Toast
        open={toastKind === "updated"}
        message={t("updateSuccess")}
        variant="success"
        onClose={clearToast}
      />

      <CancelInvoiceDialog
        open={isCancelOpen}
        invoiceNumber={invoice?.invoiceNumber ?? ""}
        confirming={isCancelling}
        error={cancelError}
        onConfirm={() => void submitCancel()}
        onCancel={closeCancel}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {status === "loading" || status === "idle" ? (
          <LoadingState message={tShared("loading")} />
        ) : status === "error" || !invoice ? (
          <ErrorState
            title={t("detailError")}
            message={error ?? undefined}
            retryLabel={t("retry")}
            onRetry={refresh}
          />
        ) : (
          <>
            {invoice.type === "customer_sale" && (neighbors.previousId || neighbors.nextId) && <nav aria-label={t("invoiceNavigation")} className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-3">
              {neighbors.previousId && <Link href={`/invoices/${neighbors.previousId}`} className="rounded-lg border border-border px-3 py-2 text-sm">{t("previousCustomerInvoice")}</Link>}
              {neighbors.nextId && <Link href={`/invoices/${neighbors.nextId}`} className="rounded-lg border border-border px-3 py-2 text-sm">{t("nextCustomerInvoice")}</Link>}
            </nav>}
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge
                variant={invoice.status === "saved" ? "success" : "danger"}
              >
                {invoice.status === "saved"
                  ? t("statusSaved")
                  : t("statusCancelled")}
              </Badge>
              <Badge variant="info">
                {invoice.type === "cash_sale"
                  ? t("typeCash")
                  : t("typeCustomer")}
              </Badge>
              {invoice.remaining <= 0 ? (
                <Badge variant="success">{t("paidInFull")}</Badge>
              ) : (
                <Badge variant="warning">{t("unpaidRemaining")}</Badge>
              )}
            </div>

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
                    {invoice.lines.map((line, index) => {
                      const item = itemsById[line.itemId];
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
                                  {t("itemUnavailable")}
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
                            {formatMoney(line.piecePrice, locale)} {currency}
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

            <SurfaceCard>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                    <p className="text-xs font-medium text-text-secondary">
                      {t("total")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-text-primary">
                      {formatMoney(invoice.total, locale)} {currency}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                    <p className="text-xs font-medium text-text-secondary">
                      {t("discount")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-text-primary">
                      {formatMoney(invoice.discount, locale)} {currency}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                    <p className="text-xs font-medium text-text-secondary">
                      {t("paid")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-text-primary">
                      {formatMoney(invoice.paid, locale)} {currency}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-border bg-surface-muted px-6 py-4 text-start lg:min-w-[15rem] lg:text-end">
                  <p className="text-xs font-medium text-text-secondary">
                    {t("remaining")}
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      invoice.remaining > 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {formatMoney(invoice.remaining, locale)} {currency}
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              <div className="flex flex-wrap items-center gap-3">
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
              </div>
              {invoice.status === "saved" ? (
                <Button type="button" variant="danger" onClick={openCancel}>
                  <CancelIcon />
                  {t("cancel")}
                </Button>
              ) : null}
            </div>

            {isShareOpen && <InvoiceShareModal invoiceId={invoice.id} onClose={() => setIsShareOpen(false)} />}
          </>
        )}
      </div>
    </AppShell>
  );
}

function PrinterIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M6 14h12v7H6v-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
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

function EditIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
