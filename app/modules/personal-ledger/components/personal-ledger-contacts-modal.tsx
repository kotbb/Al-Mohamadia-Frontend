"use client";

import { useEffect, useRef } from "react";
import { useLeaveGuard } from "@/app/modules/shared/hooks/use-leave-guard";
import { useTranslations } from "next-intl";
import type { LedgerDialogProps } from "../types/ledger-dialog-flow.types";
import { useAppNavigation } from "@/app/modules/shared/hooks/use-app-navigation";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { DashedAddButton } from "@/app/modules/shared/components/dashed-add-button";
import { RowActionsMenu } from "@/app/modules/shared/components/row-actions-menu";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { usePersonalLedgerContacts } from "../hooks/use-personal-ledger-contacts";
import { PersonalLedgerPagination } from "./personal-ledger-pagination";
import { PersonalLedgerResourceState } from "./personal-ledger-resource-state";

export function PersonalLedgerContactsModal({
  onClose,
  onContact,
  onChanged,
  open = true,
  active = true,
  ...modal
}: LedgerDialogProps & { onContact: (id: string) => void; onChanged: () => void }) {
  const { openLayer, back } = useAppNavigation();
  const t = useTranslations("personalLedger");
  const state = usePersonalLedgerContacts(onChanged, open && active);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const editorKey = `${modal.layerKey ?? "ledger-contacts"}:editor`;
  const editorOpen = open && state.editor !== null;
  useLeaveGuard({ dirty: state.isDirty, busy: state.saving, enabled: editorOpen, layerKey: editorKey });
  useEffect(() => {
    if (!editorOpen) return;
    const original = stateRef.current.editor;
    return openLayer(
      editorKey,
      () => stateRef.current.cancelEdit(),
      () => {
        if (original) stateRef.current.restoreEditor(original);
      },
    );
  }, [editorOpen, editorKey, openLayer]);
  return (
    <Modal
      {...modal}
      open={open}
      active={active}
      busy={state.saving}
      onClose={onClose}
      title={t("manageContacts")}
      size="lg"
    >
      <div className="space-y-4">
        <Input
          name="ledger-contact-search"
          label={t("search")}
          value={state.query}
          onChange={(event) => state.search(event.target.value)}
        />
        <PersonalLedgerResourceState resource={state.resource}>
          {state.resource.data?.items.length ? (
            <ul className="divide-y divide-border">
              {state.resource.data.items.map((person) => (
                <li key={person.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <button
                      type="button"
                      className="ds-focus-ring rounded text-start font-medium text-text-primary hover:underline"
                      disabled={state.saving}
                      onClick={() => onContact(person.id)}
                    >
                      {person.name}
                    </button>
                    <p className="mt-1 text-xs text-text-muted">
                      {t(person.customerId ? "storeCustomer" : "personalContact")}
                      {!person.isActive ? ` · ${t("archived")}` : ""}
                    </p>
                  </div>
                  <RowActionsMenu
                    label={t("actions")}
                    size="default"
                    disabled={state.saving}
                    items={[
                      { id: "view", label: t("view"), onSelect: () => onContact(person.id) },
                      { id: "rename", label: t("rename"), onSelect: () => state.edit(person) },
                    ]}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("noPeople")} />
          )}
          {state.resource.data ? (
            <PersonalLedgerPagination meta={state.resource.data.meta} onChange={state.setPage} />
          ) : null}
        </PersonalLedgerResourceState>
        {state.error ? (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        ) : null}
        {state.editor ? (
          <form
            className="space-y-3 rounded-xl border border-border bg-surface-muted p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void state.save();
            }}
          >
            <Input
              name="ledger-contact-name"
              label={t("personName")}
              required
              maxLength={200}
              value={state.editor.name}
              onChange={(event) => state.setName(event.target.value)}
              disabled={state.saving}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" disabled={state.saving} onClick={() => back()}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={state.saving}>
                {state.saving ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex justify-end">
            <DashedAddButton label={t("addPerson")} disabled={state.saving} onClick={() => state.edit(null)} />
          </div>
        )}
      </div>
    </Modal>
  );
}
