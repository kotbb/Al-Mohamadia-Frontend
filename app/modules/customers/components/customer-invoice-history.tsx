"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { InvoicesList } from "@/app/modules/invoices/components/invoices-list";
import { InvoiceShareModal } from "@/app/modules/invoices/components/invoice-share-modal";
import { useInvoices } from "@/app/modules/invoices/hooks/use-invoices";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { Toast } from "@/app/modules/shared/components/toast";

interface CustomerInvoiceHistoryProps {
  customerId: string;
  onFinancialChange: () => void;
}

export function CustomerInvoiceHistory({ customerId, onFinancialChange }: CustomerInvoiceHistoryProps) {
  const account = useTranslations("accountDetails");
  const t = useTranslations("invoices");
  const shared = useTranslations("shared");
  const router = useRouter();
  const history = useAuditHistory({ entityType: "SalesInvoice" });
  const invoices = useInvoices({ customerId, pageSize: 10 });
  const [shareId, setShareId] = useState<string | null>(null);

  return (
    <SurfaceCard padding="lg">
      {history.modal}
      {shareId ? <InvoiceShareModal invoiceId={shareId} onClose={() => setShareId(null)} /> : null}
      <Toast open={invoices.toast !== null} message={t("cancelSuccess")} variant="success" onClose={invoices.clearToast} />
      <ConfirmDialog open={invoices.confirmInvoice !== null} title={t("confirmCancelTitle")}
        description={<div className="flex flex-col gap-2"><p>{t("confirmCancelBody", { number: invoices.confirmInvoice?.invoiceNumber ?? "" })}</p>{invoices.confirmError ? <p className="text-danger" role="alert">{invoices.confirmError}</p> : null}</div>}
        confirmLabel={t("confirmCancelAction")} cancelLabel={t("modalCancel")} confirming={invoices.isConfirming} tone="danger"
        onConfirm={() => void invoices.submitCancel(onFinancialChange)} onCancel={invoices.closeCancelConfirm} />
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-text-primary">{account("invoiceHistoryTitle")}</h2>
        <InvoicesList showCustomer={false} invoices={invoices.invoices}
          status={invoices.listStatus} error={invoices.listError} onRetry={invoices.refresh} actionsDisabled={invoices.actionsDisabled}
          onEdit={(invoice) => router.push(`/invoices/${invoice.id}/edit`)}
          onPrint={(invoice) => router.push(`/invoices/${invoice.id}/export`)} onShare={(invoice) => setShareId(invoice.id)}
          onCancel={invoices.openCancelConfirm} onHistory={(invoice) => history.openRecord(invoice.id, invoice.invoiceNumber)} />
        {invoices.listStatus === "success" && invoices.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" size="sm" disabled={invoices.page <= 1} onClick={() => invoices.setPage(invoices.page - 1)}>{shared("prevPage")}</Button>
            <span className="text-sm text-text-secondary">{invoices.page} / {invoices.totalPages}</span>
            <Button variant="secondary" size="sm" disabled={invoices.page >= invoices.totalPages} onClick={() => invoices.setPage(invoices.page + 1)}>{shared("nextPage")}</Button>
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
