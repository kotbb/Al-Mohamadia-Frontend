"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { Button } from "@/app/modules/shared/components/button";
import { useAppNavigation } from "@/app/modules/shared/hooks/use-app-navigation";
import { PersonalLedgerDeleteModal } from "../components/personal-ledger-delete-modal";
import { Toast } from "@/app/modules/shared/components/toast";
import type { LedgerMovement } from "../types/personal-ledger.types";
import { useLedgerDialogFlow } from "../hooks/use-ledger-dialog-flow";
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
  const navigation = useAppNavigation();
  const { flow, dispatch, push } = useLedgerDialogFlow();
  function view(row: LedgerMovement) {
    push({ kind: "movement", id: row.id });
  }
  function edit(row: LedgerMovement) {
    push({ kind: "form", movement: row });
  }
  function contact(id: string) {
    push({ kind: "contact", id });
  }
  function remove(row: LedgerMovement) {
    state.requestDelete(row);
    push({ kind: "delete", movement: row });
  }
  async function confirmDelete(row: LedgerMovement) {
    if (!(await state.submitDelete())) return;
    const retired = flow.entries
      .filter(
        (frame) =>
          (frame.kind === "movement" && frame.id === row.id) ||
          ((frame.kind === "form" || frame.kind === "delete") && frame.movement?.id === row.id),
      )
      .map((frame) => frame.key);
    navigation.retireLayers(retired);
    dispatch({ type: "deleted", id: row.id });
  }

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      hubTabs={false}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => push({ kind: "contacts" })}>
            {t("manageContacts")}
          </Button>
          <Button size="sm" onClick={() => push({ kind: "form" })}>
            <span aria-hidden="true" className="text-lg">
              +
            </span>
            {t("newMovement")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <PersonalLedgerSummary
          summary={state.resource.error ? undefined : state.resource.data?.summary}
          loading={state.resource.loading}
        />
        <PersonalLedgerFilters filters={state.filters} onChange={state.changeFilters} />
        <PersonalLedgerResourceState resource={state.resource}>
          <PersonalLedgerTable
            rows={state.resource.data?.items ?? []}
            onView={view}
            onEdit={edit}
            onDelete={remove}
            onContact={contact}
          />
          {state.resource.data ? (
            <PersonalLedgerPagination meta={state.resource.data.meta} onChange={state.setPage} />
          ) : null}
        </PersonalLedgerResourceState>
      </div>
      {flow.entries.map((entry, index) => {
        const modal = {
          open: index <= flow.position,
          active: index === flow.position,
          nested: index > 0,
          layerKey: entry.key,
          onClose: () => dispatch({ type: "close", key: entry.key }),
          onRestore: () => dispatch({ type: "restore", key: entry.key }),
        };
        switch (entry.kind) {
          case "contacts":
            return <ContactsModal key={entry.key} {...modal} onContact={contact} onChanged={state.refresh} />;
          case "contact":
            return (
              <ContactDetail key={entry.key} {...modal} id={entry.id} onView={view} onEdit={edit} onDelete={remove} />
            );
          case "movement":
            return <MovementDetail key={entry.key} {...modal} id={entry.id} onEdit={edit} onContact={contact} />;
          case "form":
            return (
              <MovementModal
                key={entry.key}
                {...modal}
                movement={entry.movement}
                onSaved={() => {
                  navigation.retireLayers([entry.key, `${entry.key}:add-person`]);
                  dispatch({ type: "completed", key: entry.key });
                  state.refresh();
                  state.setNotice(t("saved"));
                }}
              />
            );
          case "delete":
            return (
              <PersonalLedgerDeleteModal
                key={entry.key}
                {...modal}
                busy={state.deleting}
                error={state.deleteError}
                onConfirm={() => void confirmDelete(entry.movement)}
              />
            );
        }
      })}
      <Toast open={!!state.notice} message={state.notice} onClose={() => state.setNotice("")} />
    </AppShell>
  );
}
