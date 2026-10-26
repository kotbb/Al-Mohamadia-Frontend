"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { createPersonalLedgerContact, createPersonalLedgerMovement, updatePersonalLedgerMovement } from "../services/personal-ledger.service";
import type { LedgerForm, LedgerMovement } from "../types/personal-ledger.types";
import { ledgerMovementInput, makeLedgerForm, validateLedgerForm } from "../utils/personal-ledger-form.util";

export function usePersonalLedgerForm(movement: LedgerMovement | undefined, onSaved: () => void) {
  const t = useTranslations("personalLedger");
  const errorMessage = useApiErrorMessage();
  const [form, setForm] = useState<LedgerForm>(() => makeLedgerForm(movement));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  function change(next: Partial<LedgerForm>) { setForm((previous) => ({ ...previous, ...next })); setError(null); }

  async function runSaving(operation: () => Promise<void>): Promise<boolean> {
    pending.current = true; setSaving(true); setError(null);
    try { await operation(); return true; }
    catch (error) { setError(errorMessage(error, t("saveError"))); return false; }
    finally { pending.current = false; setSaving(false); }
  }

  async function createPerson(name: string): Promise<boolean> {
    if (pending.current) return false;
    if (!name.trim()) { setError(t("personRequired")); return false; }
    return runSaving(async () => {
      const person = await createPersonalLedgerContact({ name: name.trim() });
      change({ person: { id: `contact:${person.id}`, referenceId: person.id, source: "contact", name: person.name, isActive: person.isActive } });
    });
  }

  async function save() {
    if (pending.current) return;
    const validation = validateLedgerForm(form);
    if (validation) { setError(t(validation)); return; }
    const person = form.person;
    if (!person) return;
    return runSaving(async () => {
      let contactId = person.referenceId;
      if (person.source === "customer") {
        const contact = await createPersonalLedgerContact({ customerId: contactId });
        contactId = contact.id;
        setForm((previous) => ({ ...previous, person: { id: `contact:${contact.id}`, referenceId: contact.id, source: "contact", name: contact.name, isActive: contact.isActive } }));
      }
      const input = ledgerMovementInput(form, contactId);
      if (movement) await updatePersonalLedgerMovement(movement.id, input);
      else await createPersonalLedgerMovement(input);
      onSaved();
    });
  }
  return { form, change, error, saving, createPerson, save };
}
