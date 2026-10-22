"use client";

import { useTranslations } from "next-intl";

interface PaymentNotesProps {
  notes: string | null;
  isAdditional: boolean;
}

export function PaymentNotes({ notes, isAdditional }: PaymentNotesProps) {
  const t = useTranslations("invoicePayments");
  if (!isAdditional) return notes?.trim() ? notes : "-";
  const marker = t("additionalAccountPaymentNote");
  return (
    <div className="flex flex-col gap-1">
      <span dir="auto" className="font-medium text-text-primary">{marker}</span>
      {notes?.trim() && notes.trim() !== marker ? <span dir="auto" className="truncate" title={notes}>{notes}</span> : null}
    </div>
  );
}
