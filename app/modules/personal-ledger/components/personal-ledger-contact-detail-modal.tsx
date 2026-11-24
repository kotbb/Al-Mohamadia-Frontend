"use client";

import { useCallback } from "react";
import { useUrlState } from "@/app/modules/shared/hooks/use-url-state";
import { useTranslations } from "next-intl";
import type { LedgerDialogProps } from "../types/ledger-dialog-flow.types";
import { Modal } from "@/app/modules/shared/components/modal";
import type { LedgerMovement } from "../types/personal-ledger.types";
import { getPersonalLedgerContact, listPersonalLedgerMovements } from "../services/personal-ledger.service";
import { usePersonalLedgerResource } from "../hooks/use-personal-ledger-resource";
import { PersonalLedgerResourceState } from "./personal-ledger-resource-state";
import { PersonalLedgerSummary } from "./personal-ledger-summary";
import { PersonalLedgerTable } from "./personal-ledger-table";
import { PersonalLedgerPagination } from "./personal-ledger-pagination";

interface Props extends LedgerDialogProps {
  id: string;
  onView: (row: LedgerMovement) => void;
  onEdit: (row: LedgerMovement) => void;
  onDelete: (row: LedgerMovement) => void;
}

export function PersonalLedgerContactDetailModal({
  id,
  onClose,
  onView,
  onEdit,
  onDelete,
  open = true,
  active = true,
  ...modal
}: Props) {
  const t = useTranslations("personalLedger");
  const [page, setPage] = useUrlState("contactPage", 1);
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [contact, movements] = await Promise.all([
        getPersonalLedgerContact(id, signal),
        listPersonalLedgerMovements({ contactId: id, page }, signal),
      ]);
      return { contact, movements };
    },
    [id, page],
  );
  const resource = usePersonalLedgerResource(load, 0, open && active);
  return (
    <Modal
      {...modal}
      open={open}
      active={active}
      onClose={onClose}
      title={resource.data?.contact.name ?? t("personDetails")}
      size="wide"
    >
      <PersonalLedgerResourceState resource={resource}>
        {resource.data ? (
          <div className="space-y-5">
            {!resource.data.contact.isActive ? (
              <p className="text-sm text-text-secondary">{t("archivedHint")}</p>
            ) : null}
            <PersonalLedgerSummary summary={resource.data.contact.summary} lifetime />
            <PersonalLedgerTable
              rows={resource.data.movements.items}
              showContact={false}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
            <PersonalLedgerPagination meta={resource.data.movements.meta} onChange={setPage} />
          </div>
        ) : null}
      </PersonalLedgerResourceState>
    </Modal>
  );
}
