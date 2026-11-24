"use client";

import { useUrlState } from "@/app/modules/shared/hooks/use-url-state";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import {
  createPersonalLedgerContact,
  listPersonalLedgerContacts,
  updatePersonalLedgerContact,
} from "../services/personal-ledger.service";
import type { LedgerContact } from "../types/personal-ledger.types";
import { usePersonalLedgerResource } from "./use-personal-ledger-resource";

export function usePersonalLedgerContacts(onChanged: () => void, active = true) {
  const t = useTranslations("personalLedger");
  const errorMessage = useApiErrorMessage();
  const [page, setPage] = useUrlState("contactsPage", 1);
  const [query, setQuery] = useUrlState("contactsQ", "");
  const [editor, setEditor] = useState<{ id: string | null; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const [originalName, setOriginalName] = useState("");
  const load = useCallback(
    (signal: AbortSignal) => listPersonalLedgerContacts({ page, q: query, includeInactive: true }, signal),
    [page, query],
  );
  const resource = usePersonalLedgerResource(load, 0, active);

  async function save() {
    if (lock.current || !editor) return;
    if (!editor.name.trim()) {
      setError(t("personRequired"));
      return;
    }
    lock.current = true;
    setSaving(true);
    setError(null);
    try {
      if (editor.id) await updatePersonalLedgerContact(editor.id, { name: editor.name.trim() });
      else await createPersonalLedgerContact({ name: editor.name.trim() });
      setEditor(null);
      resource.retry();
      onChanged();
    } catch (error) {
      setError(errorMessage(error, t("saveError")));
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }

  return {
    resource,
    page,
    setPage,
    query,
    search: (q: string) => {
      setPage(1);
      setQuery(q);
    },
    editor,
    edit: (person: LedgerContact | null) => {
      setError(null);
      setOriginalName(person?.name ?? "");
      setEditor({ id: person?.id ?? null, name: person?.name ?? "" });
    },
    restoreEditor: (value: { id: string | null; name: string }) => {
      setOriginalName(value.name);
      setEditor(value);
    },
    isDirty: editor !== null && editor.name !== originalName,
    setName: (name: string) => setEditor((old) => (old ? { ...old, name } : null)),
    cancelEdit: () => setEditor(null),
    save,
    saving,
    error,
  };
}
