"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import { Button } from "@/app/modules/shared/components/button";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { formatMoney } from "@/app/modules/shared/utils/format-money";

interface PurchaseSupplierSectionProps {
  allSuppliers: Supplier[];
  allSuppliersLoading: boolean;
  selectedSupplier: Supplier | null;
  onSelectSupplierId: (id: string) => void;
  onClearSupplier: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function PurchaseSupplierSection({
  allSuppliers,
  allSuppliersLoading,
  selectedSupplier,
  onSelectSupplierId,
  onClearSupplier,
  notes,
  onNotesChange,
}: PurchaseSupplierSectionProps) {
  const t = useTranslations("purchases");
  const locale = useLocale();

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
              onClick={onClearSupplier}
            >
              {t("supplierClear")}
            </Button>
          </div>
        ) : (
          <div>
            <label className="flex w-full flex-col gap-1.5">
              <span className="text-base font-semibold text-text-primary">
                {t("selectSupplierLabel")}
              </span>
              <select
                className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-text-primary transition-colors focus:border-primary"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectSupplierId(e.target.value);
                  }
                }}
                disabled={allSuppliersLoading}
              >
                <option value="">
                  {allSuppliersLoading
                    ? t("loadingSuppliers")
                    : t("selectSupplierPlaceholder")}
                </option>
                {allSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(${s.phone})` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
