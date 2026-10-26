"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { Button } from "@/app/modules/shared/components/button";
import { ConfirmDialog } from "@/app/modules/shared/components/row-actions-menu";
import { Toast } from "@/app/modules/shared/components/toast";
import type { LedgerMovement } from "../types/personal-ledger.types";
import { usePersonalLedger } from "../hooks/use-personal-ledger";
import { PersonalLedgerSummary } from "../components/personal-ledger-summary";
import { PersonalLedgerFilters } from "../components/personal-ledger-filters";
import { PersonalLedgerTable } from "../components/personal-ledger-table";
import { PersonalLedgerPagination } from "../components/personal-ledger-pagination";
import { PersonalLedgerResourceState } from "../components/personal-ledger-resource-state";

import { PersonalLedgerMovementModal as MovementModal } from "../components/personal-ledger-movement-modal";
import { PersonalLedgerMovementDetailModal as MovementDetail } from "../components/personal-ledger-movement-detail-modal";
import { PersonalLedgerContactsModal as ContactsModal } from "../components/personal-ledger-contacts-modal";
import { PersonalLedgerContactDetailModal as ContactDetail } from "../components/personal-ledger-contact-detail-modal";

export function PersonalLedgerPage() {
  const t = useTranslations("personalLedger");
  const state = usePersonalLedger();
  const [editing, setEditing] = useState<LedgerMovement | "new" | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  function closeDetails() { setContactId(null); setViewId(null); setContactsOpen(false); }
  function view(row: LedgerMovement) { closeDetails(); setViewId(row.id); }
  function edit(row: LedgerMovement) { closeDetails(); setEditing(row); }
  function contact(id: string) { closeDetails(); setContactId(id); }
  function remove(row: LedgerMovement) { closeDetails(); state.requestDelete(row); }

  return <AppShell title={t("title")} subtitle={t("subtitle")} hubTabs={false} actions={<div className="flex items-center gap-2">
    <Button variant="secondary" size="sm" onClick={() => setContactsOpen(true)}>{t("manageContacts")}</Button>
    <Button size="sm" onClick={() => setEditing("new")}><span aria-hidden="true" className="text-lg">+</span>{t("newMovement")}</Button>
  </div>}>
    <div className="space-y-5">
      <PersonalLedgerSummary summary={state.resource.error ? undefined : state.resource.data?.summary} loading={state.resource.loading} />
      <PersonalLedgerFilters filters={state.filters} onChange={state.changeFilters} />
      <PersonalLedgerResourceState resource={state.resource}>
        <PersonalLedgerTable rows={state.resource.data?.items ?? []} onView={view} onEdit={edit} onDelete={remove} onContact={contact} />
        {state.resource.data ? <PersonalLedgerPagination meta={state.resource.data.meta} onChange={state.setPage} /> : null}
      </PersonalLedgerResourceState>
    </div>
    {editing ? <MovementModal key={editing === "new" ? "new" : editing.id} movement={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); state.refresh(); state.setNotice(t("saved")); }} /> : null}
    {viewId ? <MovementDetail key={viewId} id={viewId} onClose={() => setViewId(null)} onEdit={edit} onContact={contact} /> : null}
    {contactsOpen ? <ContactsModal onClose={() => setContactsOpen(false)} onContact={contact} onChanged={state.refresh} /> : null}
    {contactId ? <ContactDetail key={contactId} id={contactId} onClose={() => setContactId(null)} onView={view} onEdit={edit} onDelete={remove} /> : null}
    <ConfirmDialog open={state.deleteTarget !== null} title={t("deleteMovement")} description={<div className="space-y-2"><p>{t("deleteHint")}</p>{state.deleteError ? <p role="alert" className="text-danger">{state.deleteError}</p> : null}</div>} confirmLabel={t("delete")} cancelLabel={t("cancel")} confirmingLabel={t("deleting")} confirming={state.deleting} onConfirm={() => void state.submitDelete()} onCancel={state.closeDelete} />
    <Toast open={!!state.notice} message={state.notice} onClose={() => state.setNotice("")} />
  </AppShell>;
}
