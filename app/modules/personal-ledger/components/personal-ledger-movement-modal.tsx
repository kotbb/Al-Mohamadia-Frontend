"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import type { LedgerMethod, LedgerMovement } from "../types/personal-ledger.types";
import { ledgerMethods } from "../utils/personal-ledger-form.util";
import { usePersonalLedgerForm } from "../hooks/use-personal-ledger-form";
import { PersonalLedgerPersonPicker } from "./personal-ledger-person-picker";

export function PersonalLedgerMovementModal({ movement, onClose, onSaved }: { movement?: LedgerMovement; onClose: () => void; onSaved: () => void }) {
  const t = useTranslations("personalLedger");
  const state = usePersonalLedgerForm(movement, onSaved);
  return <Modal open onClose={state.saving ? () => undefined : onClose} title={t(movement ? "editMovement" : "newMovement")} footer={<div className="flex justify-end gap-2">
    <Button variant="secondary" disabled={state.saving} onClick={onClose}>{t("cancel")}</Button><Button type="submit" form="ledger-movement-form" disabled={state.saving}>{state.saving ? t("saving") : t("save")}</Button>
  </div>}>
    <form id="ledger-movement-form" className="space-y-5" noValidate onSubmit={(event) => { event.preventDefault(); void state.save(); }}>
      <fieldset disabled={state.saving} className="min-w-0 space-y-5 disabled:opacity-70">
        <PersonalLedgerPersonPicker value={state.form.person} onChange={(person) => state.change({ person })} onCreate={state.createPerson} saving={state.saving} />
        <SegmentedControl label={t("type")} value={state.form.type} onChange={(type) => state.change({ type })} options={[{ value: "withdrawal", label: t("withdrawal") }, { value: "deposit", label: t("deposit") }]} />
        <Input name="ledger-amount" label={`${t("amount")} (${t("currency")})`} type="number" inputMode="decimal" min="0.01" step="0.01" required value={state.form.amount} onChange={(event) => state.change({ amount: event.target.value })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5 text-base font-medium text-text-secondary">{t("methodOptional")}
            <select className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-text-primary" value={state.form.method} onChange={(event) => state.change({ method: event.target.value as LedgerMethod | "" })}>
              <option value=""></option>{ledgerMethods.map((method) => <option key={method} value={method}>{t(`methods.${method}`)}</option>)}
            </select>
          </label>
          <Input name="ledger-date" label={t("date")} type="date" required max={todayIsoDate()} value={state.form.movementDate} onChange={(event) => state.change({ movementDate: event.target.value })} />
        </div>
        <Input name="ledger-notes" label={t("notesOptional")} maxLength={500} value={state.form.notes} onChange={(event) => state.change({ notes: event.target.value })} />
      </fieldset>
      {state.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
    </form>
  </Modal>;
}
