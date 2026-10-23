"use client";

import { useState } from "react";
import { AccountCombobox } from "@/app/modules/shared/components/account-combobox";
import { useLocale, useTranslations } from "next-intl";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { Button } from "@/app/modules/shared/components/button";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { formatMoney } from "@/app/modules/shared/utils/format-money";

interface PurchaseSupplierSectionProps {
  allSuppliers: Supplier[];
  allSuppliersLoading: boolean;
  selectedSupplier: Supplier | null;
  originalSupplier?: Supplier | null;
  supplierQuery: string;
  onSupplierQueryChange: (value: string) => void;
  supplierResults: Supplier[];
  suppliersLoading: boolean;
  onSelectSupplier: (supplier: Supplier) => void;
  onClearSupplier: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function PurchaseSupplierSection({
  allSuppliers,
  allSuppliersLoading,
  selectedSupplier,
  originalSupplier,
  supplierQuery, onSupplierQueryChange, supplierResults, suppliersLoading, onSelectSupplier,
  onClearSupplier,
  notes,
  onNotesChange,
}: PurchaseSupplierSectionProps) {
  const t = useTranslations("purchases");
  const locale = useLocale();
  const [focusSearch, setFocusSearch] = useState(false);

  return (
    <SurfaceCard padding="sm">
      <div className="grid gap-3 md:grid-cols-2 md:items-end">
        {selectedSupplier ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface-muted px-4 py-3.5">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                {t("supplierSelected")}
              </p>
              <p className="text-base font-bold text-text-primary">
                {selectedSupplier.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                {selectedSupplier.phone ? (
                  <span>{selectedSupplier.phone}</span>
                ) : null}
                <span>
                  {t("supplierCurrentDebt")}:{" "}
                  <strong className="text-text-primary">
                    {formatMoney(selectedSupplier.amountOwed, locale)}{" "}
                    {t("currency")}
                  </strong>
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => { onClearSupplier(); onSupplierQueryChange(""); setFocusSearch(true); }}
            >
              {t("supplierChange")}
            </Button>
          </div>
        ) : (
          <AccountCombobox name="supplierSearch" query={supplierQuery} onQueryChange={onSupplierQueryChange}
            results={supplierResults} loading={suppliersLoading} allAccounts={allSuppliers} allAccountsLoading={allSuppliersLoading}
            selectedAccount={selectedSupplier} originalAccount={originalSupplier} focusOnMount={focusSearch}
            onSelect={(supplier) => { setFocusSearch(false); onSelectSupplier(supplier); }} onClear={onClearSupplier}
            labels={{ label: t("selectSupplierLabel"), placeholder: t("supplierSearchPlaceholder"), clear: t("supplierClear"), loading: t("loadingSuppliers"), empty: t("noSuppliersFound") }} />
        )}

        {/* Invoice-level notes */}
        <div>
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-text-secondary">
              {t("fieldNotes")}
            </span>
            <input
              type="text"
              value={notes}
              maxLength={500}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t("fieldNotesPlaceholder")}
              className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text-primary placeholder:text-text-muted"
            />
          </label>
        </div>
      </div>
    </SurfaceCard>
  );
}
