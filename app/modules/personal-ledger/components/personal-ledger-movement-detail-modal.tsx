"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { LedgerMethod, LedgerMovement } from "../types/personal-ledger.types";
import { getPersonalLedgerMovement } from "../services/personal-ledger.service";
import { usePersonalLedgerResource } from "../hooks/use-personal-ledger-resource";
import { formatLedgerDate, ledgerMethodLabel, ledgerMethods } from "../utils/personal-ledger-form.util";
import { PersonalLedgerResourceState } from "./personal-ledger-resource-state";

interface Props { id: string; onClose: () => void; onEdit: (row: LedgerMovement) => void; onContact: (id: string) => void; }

export function PersonalLedgerMovementDetailModal({ id, onClose, onEdit, onContact }: Props) {
  const t = useTranslations("personalLedger");
  const locale = useLocale();
  const load = useCallback((signal: AbortSignal) => getPersonalLedgerMovement(id, signal), [id]);
  const resource = usePersonalLedgerResource(load);
  const row = resource.data;
  const methods = Object.fromEntries(ledgerMethods.map((method) => [method, t(`methods.${method}`)])) as Record<LedgerMethod, string>;
  return <Modal open onClose={onClose} title={t("movementDetails")} footer={<div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={onClose}>{t("close")}</Button><Button disabled={!row || resource.loading || !!resource.error} onClick={() => row && onEdit(row)}>{t("edit")}</Button></div>}>
    <PersonalLedgerResourceState resource={resource}>
      {row ? <div className="space-y-5">
        <div className={`rounded-xl p-4 ${row.type === "deposit" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}><p className="text-sm font-medium">{t(row.type)}</p><p className="mt-2 text-2xl font-bold tabular-nums"><bdi>{formatMoney(row.amount, locale === "ar" ? "ar-EG-u-nu-latn" : locale)} {t("currency")}</bdi></p></div>
        <dl className="divide-y divide-border">
          <div className="flex justify-between gap-4 py-3"><dt className="text-text-secondary">{t("person")}</dt><dd><button type="button" className="ds-focus-ring rounded text-start font-medium text-primary hover:underline" onClick={() => onContact(row.contactId)}>{row.contactName}</button></dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-text-secondary">{t("date")}</dt><dd>{formatLedgerDate(row.movementDate, locale)}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-text-secondary">{t("method")}</dt><dd>{ledgerMethodLabel(row.method, methods)}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-text-secondary">{t("notes")}</dt><dd className="max-w-[70%] whitespace-pre-wrap break-words">{row.notes || "—"}</dd></div>
        </dl>
      </div> : null}
    </PersonalLedgerResourceState>
  </Modal>;
}
