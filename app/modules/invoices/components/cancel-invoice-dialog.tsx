"use client";

import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";

interface CancelInvoiceDialogProps {
  open: boolean;
  invoiceNumber: string;
  confirming: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelInvoiceDialog({
  open,
  invoiceNumber,
  confirming,
  error,
  onConfirm,
  onCancel,
}: CancelInvoiceDialogProps) {
  const t = useTranslations("invoices");

  return (
    <ConfirmDialog
      open={open}
      title={t("confirmCancelTitle")}
      description={
        <div className="flex flex-col gap-2">
          <p>{t("confirmCancelBody", { number: invoiceNumber })}</p>
          {error ? (
            <p className="text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      }
      confirmLabel={
        confirming ? t("cancelling") : t("confirmCancelAction")
      }
      cancelLabel={t("modalCancel")}
      confirming={confirming}
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
