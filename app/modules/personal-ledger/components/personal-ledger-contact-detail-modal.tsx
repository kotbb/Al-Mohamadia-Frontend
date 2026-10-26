"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import type { LedgerMovement } from "../types/personal-ledger.types";
import { getPersonalLedgerContact, listPersonalLedgerMovements } from "../services/personal-ledger.service";
import { usePersonalLedgerResource } from "../hooks/use-personal-ledger-resource";
import { PersonalLedgerResourceState } from "./personal-ledger-resource-state";
import { PersonalLedgerSummary } from "./personal-ledger-summary";
import { PersonalLedgerTable } from "./personal-ledger-table";
import { PersonalLedgerPagination } from "./personal-ledger-pagination";

interface Props { id: string; onClose: () => void; onView: (row: LedgerMovement) => void; onEdit: (row: LedgerMovement) => void; onDelete: (row: LedgerMovement) => void; }

export function PersonalLedgerContactDetailModal({ id, onClose, onView, onEdit, onDelete }: Props) {
  const t = useTranslations("personalLedger");
  const [page, setPage] = useState(1);
  const load = useCallback(async (signal: AbortSignal) => {
    const [contact, movements] = await Promise.all([getPersonalLedgerContact(id, signal), listPersonalLedgerMovements({ contactId: id, page }, signal)]);
    return { contact, movements };
  }, [id, page]);
  const resource = usePersonalLedgerResource(load);
  return <Modal open onClose={onClose} title={resource.data?.contact.name ?? t("personDetails")} size="wide" footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>{t("close")}</Button></div>}>
    <PersonalLedgerResourceState resource={resource}>
      {resource.data ? <div className="space-y-5">
        {!resource.data.contact.isActive ? <p className="text-sm text-text-secondary">{t("archivedHint")}</p> : null}
        <PersonalLedgerSummary summary={resource.data.contact.summary} lifetime />
        <PersonalLedgerTable rows={resource.data.movements.items} showContact={false} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        <PersonalLedgerPagination meta={resource.data.movements.meta} onChange={setPage} />
      </div> : null}
    </PersonalLedgerResourceState>
  </Modal>;
}
