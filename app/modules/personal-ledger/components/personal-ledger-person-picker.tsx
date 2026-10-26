"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccountCombobox } from "@/app/modules/shared/components/account-combobox";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { DashedAddButton } from "@/app/modules/shared/components/dashed-add-button";
import type { LedgerPersonOption } from "../types/personal-ledger.types";
import { usePersonalLedgerPeople } from "../hooks/use-personal-ledger-people";

interface Props { value: LedgerPersonOption | null; onChange: (value: LedgerPersonOption | null) => void; onCreate: (name: string) => Promise<boolean>; saving: boolean; }

export function PersonalLedgerPersonPicker({ value, onChange, onCreate, saving }: Props) {
  const t = useTranslations("personalLedger");
  const people = usePersonalLedgerPeople();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  async function create() {
    if (await onCreate(name)) { setName(""); setAdding(false); people.setQuery(""); people.resource.retry(); }
  }
  return <div className="space-y-3">
    <AccountCombobox name="ledger-person" labels={{ label: t("person"), placeholder: t("personPlaceholder"), clear: t("changePerson"), loading: t("loading"), empty: t("noPeople") }}
      query={people.query} onQueryChange={people.setQuery} results={people.resource.data ?? []} loading={people.resource.loading}
      allAccounts={people.resource.data ?? []} allAccountsLoading={people.resource.loading} selectedAccount={value} originalAccount={value}
      onSelect={onChange} onClear={() => onChange(null)} />
    <p className="text-xs text-text-muted">{t("personHint")}</p>
    {people.resource.error ? <p role="alert" className="text-sm text-danger">{people.resource.error} <button type="button" className="ds-focus-ring underline" onClick={people.resource.retry}>{t("retry")}</button></p> : null}
    {adding ? <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-3">
      <Input name="ledger-new-person" label={t("personName")} maxLength={200} value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
      <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" disabled={saving} onClick={() => setAdding(false)}>{t("cancel")}</Button><Button size="sm" disabled={saving} onClick={() => void create()}>{saving ? t("saving") : t("addPerson")}</Button></div>
    </div> : <DashedAddButton label={t("addPerson")} disabled={saving} onClick={() => setAdding(true)} />}
  </div>;
}
