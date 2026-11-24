"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useAppNavigation } from "@/app/modules/shared/hooks/use-app-navigation";
import { useLeaveGuard } from "@/app/modules/shared/hooks/use-leave-guard";
import { AccountCombobox } from "@/app/modules/shared/components/account-combobox";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";
import { DashedAddButton } from "@/app/modules/shared/components/dashed-add-button";
import type { LedgerPersonOption } from "../types/personal-ledger.types";
import { usePersonalLedgerPeople } from "../hooks/use-personal-ledger-people";

interface Props {
  value: LedgerPersonOption | null;
  onChange: (value: LedgerPersonOption | null) => void;
  onCreate: (name: string) => Promise<boolean>;
  saving: boolean;
  active?: boolean;
  layerKey?: string;
}

export function PersonalLedgerPersonPicker({
  value,
  onChange,
  onCreate,
  saving,
  active = true,
  layerKey = "ledger-movement",
}: Props) {
  const t = useTranslations("personalLedger");
  const people = usePersonalLedgerPeople(active);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const { openLayer, back } = useAppNavigation();
  const pickerKey = `${layerKey}:add-person`;
  const close = useRef(() => {
    setAdding(false);
    setName("");
  });
  useLeaveGuard({ dirty: adding && name !== "", busy: saving, enabled: adding, layerKey: pickerKey });
  useEffect(() => {
    if (!adding) return;
    return openLayer(
      pickerKey,
      () => close.current(),
      () => setAdding(true),
    );
  }, [adding, pickerKey, openLayer]);
  async function create() {
    if (await onCreate(name)) {
      setName("");
      setAdding(false);
      people.setQuery("");
      people.resource.retry();
    }
  }
  return (
    <div className="space-y-3">
      <AccountCombobox
        name="ledger-person"
        labels={{
          label: t("person"),
          placeholder: t("personPlaceholder"),
          clear: t("changePerson"),
          loading: t("loading"),
          empty: t("noPeople"),
        }}
        query={people.query}
        onQueryChange={people.setQuery}
        results={people.resource.data ?? []}
        loading={people.resource.loading}
        allAccounts={people.resource.data ?? []}
        allAccountsLoading={people.resource.loading}
        selectedAccount={value}
        originalAccount={value}
        onSelect={onChange}
        onClear={() => onChange(null)}
      />
      <p className="text-xs text-text-muted">{t("personHint")}</p>
      {people.resource.error ? (
        <p role="alert" className="text-sm text-danger">
          {people.resource.error}{" "}
          <button type="button" className="ds-focus-ring underline" onClick={people.resource.retry}>
            {t("retry")}
          </button>
        </p>
      ) : null}
      {adding ? (
        <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-3">
          <Input
            name="ledger-new-person"
            label={t("personName")}
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={saving} onClick={() => back()}>
              {t("cancel")}
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void create()}>
              {saving ? t("saving") : t("addPerson")}
            </Button>
          </div>
        </div>
      ) : (
        <DashedAddButton label={t("addPerson")} disabled={saving} onClick={() => setAdding(true)} />
      )}
    </div>
  );
}
