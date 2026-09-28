"use client";

import { useLocale, useTranslations } from "next-intl";
import type { PurchaseLineFormState } from "@/app/modules/purchases/types/purchases.types";
import type { Item } from "@/app/modules/items/types/items.types";
import {
  formatMoney,
  roundMoneyAmount,
} from "@/app/modules/items/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";

interface PurchaseLineRowProps {
  line: PurchaseLineFormState;
  items: Item[];
  lineTotal: number;
  canRemove: boolean;
  onSelectItem: (itemId: string) => void;
  onChange: (patch: Partial<PurchaseLineFormState>) => void;
  onRemove: () => void;
}

export function PurchaseLineRow({
  line,
  items,
  lineTotal,
  canRemove,
  onSelectItem,
  onChange,
  onRemove,
}: PurchaseLineRowProps) {
  const t = useTranslations("purchases");
  const locale = useLocale();
  const selectedItem = items.find((item) => item.id === line.itemId);
  const isCubic = selectedItem?.pricingMode === "per_cubic_meter";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:border-border-hover">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex w-full flex-col gap-1.5 md:col-span-2">
          <span className="text-base font-medium text-text-secondary">
            {t("fieldItem")}
          </span>
          <select
            className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-text-primary"
            value={line.itemId}
            onChange={(e) => onSelectItem(e.target.value)}
          >
            <option value="">{t("fieldItemPlaceholder")}</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <Input
          name={`qty-${line.key}`}
          label={t("fieldQty")}
          type="number"
          min={0}
          step="any"
          value={line.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
        />
        <Input
          name={`cost-${line.key}`}
          label={t("fieldUnitCost")}
          type="number"
          min={0}
          step="any"
          value={line.unitCost}
          onChange={(e) => onChange({ unitCost: e.target.value })}
          onBlur={() => {
            const rounded = roundMoneyAmount(line.unitCost);
            if (rounded === null) return;
            onChange({ unitCost: String(rounded) });
          }}
        />
      </div>

      {isCubic ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            name={`thickness-${line.key}`}
            label={t("fieldThickness")}
            type="number"
            min={0}
            step="any"
            value={line.thicknessCm}
            onChange={(e) => onChange({ thicknessCm: e.target.value })}
          />
          <Input
            name={`width-${line.key}`}
            label={t("fieldWidth")}
            type="number"
            min={0}
            step="any"
            value={line.widthCm}
            onChange={(e) => onChange({ widthCm: e.target.value })}
          />
          <Input
            name={`length-${line.key}`}
            label={t("fieldLength")}
            type="number"
            min={0}
            step="any"
            value={line.lengthCm}
            onChange={(e) => onChange({ lengthCm: e.target.value })}
          />
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <Input
          name={`note-${line.key}`}
          label={t("fieldNote")}
          placeholder={t("fieldNotePlaceholder")}
          value={line.note}
          maxLength={500}
          onChange={(e) => onChange({ note: e.target.value })}
        />
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-2.5">
          <p className="text-xs text-text-secondary">{t("fieldLineTotal")}</p>
          <p className="text-base font-semibold text-text-primary">
            {formatMoney(lineTotal, locale)} {t("currency")}
          </p>
        </div>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger/10"
            onClick={onRemove}
            title={t("removeLine")}
          >
            <TrashIcon />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
