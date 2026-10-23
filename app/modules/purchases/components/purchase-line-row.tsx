"use client";

import { useLocale, useTranslations } from "next-intl";
import type { PurchaseLineFormState } from "@/app/modules/purchases/types/purchases.types";
import type { DimensionName } from "@/app/modules/items/types/items.types";
import type { Item } from "@/app/modules/items/types/items.types";
import { ItemCombobox } from "@/app/modules/shared/components/item-combobox";
import {
  formatMoney,
  roundMoneyAmount,
} from "@/app/modules/shared/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { DimensionInput } from "@/app/modules/shared/components/dimension-input";
import { Input } from "@/app/modules/shared/components/input";

interface PurchaseLineRowProps {
  line: PurchaseLineFormState;
  items: Item[];
  originalItemIds?: string[];
  lineTotal: number;
  canRemove: boolean;
  onSelectItem: (itemId: string) => void;
  onChange: (patch: Partial<PurchaseLineFormState>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onAddDimensionDefault: (
    dimension: DimensionName,
    value: number,
  ) => Promise<void>;
}

export function PurchaseLineRow({
  line,
  items,
  originalItemIds,
  lineTotal,
  canRemove,
  onSelectItem,
  onChange,
  onDuplicate,
  onRemove,
  onAddDimensionDefault,
}: PurchaseLineRowProps) {
  const t = useTranslations("purchases");
  const locale = useLocale();
  const selectedItem = items.find((item) => item.id === line.itemId);
  const isFreeAmount = selectedItem?.pricingMode === "free_amount";
  const isCubic = selectedItem?.pricingMode === "per_cubic_meter";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted/30 p-3 transition-colors hover:border-border-hover">
      <div className={`grid items-end gap-2 sm:grid-cols-2 ${isFreeAmount ? "lg:grid-cols-[minmax(0,2fr)_minmax(7rem,1fr)_minmax(0,1.5fr)_minmax(6.5rem,1fr)_6rem]" : "lg:grid-cols-[minmax(0,2fr)_minmax(4rem,.65fr)_minmax(5.5rem,1fr)_minmax(0,1.5fr)_minmax(6.5rem,1fr)_6rem]"}`}>
        <ItemCombobox eligibleInactiveItemIds={originalItemIds} items={items} value={line.itemId} name={`item-${line.key}`} onSelect={onSelectItem}
          labels={{ label: t("fieldItem"), placeholder: t("itemSearchPlaceholder"), empty: t("noItemsFound") }} />

        {!isFreeAmount && <Input
          density="compact"
          name={`qty-${line.key}`}
          label={t("fieldQty")}
          type="number"
          min={0}
          step="any"
          value={line.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
        />}
        <Input
          density="compact"
          name={`cost-${line.key}`}
          label={t(isFreeAmount ? "fieldAmount" : "fieldUnitCost")}
          type="number"
          min={0}
          step={isFreeAmount ? "0.01" : "any"}
          value={line.unitCost}
          onChange={(e) => onChange({ unitCost: e.target.value })}
          onBlur={() => {
            if (isFreeAmount) return;
            const rounded = roundMoneyAmount(line.unitCost);
            if (rounded === null) return;
            onChange({ unitCost: String(rounded) });
          }}
        />
        <Input
          density="compact"
          name={`note-${line.key}`}
          label={t("fieldNote")}
          placeholder={t("fieldNotePlaceholder")}
          value={line.note}
          maxLength={500}
          onChange={(e) => onChange({ note: e.target.value })}
        />
        <div className="flex min-h-11 flex-col justify-center rounded-xl border border-border bg-surface-muted px-3 py-1">
          <p className="text-xs text-text-secondary">{t("fieldLineTotal")}</p>
          <p className="text-base whitespace-nowrap text-sm font-semibold text-text-primary">
            {formatMoney(lineTotal, locale)} {t("currency")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11 p-0 text-primary"
            aria-label={t("duplicateLine")}
            title={t("duplicateLine")}
            onClick={onDuplicate}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
          </Button>
          {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11 p-0 text-danger hover:bg-danger/10"
            aria-label={t("removeLine")}
            onClick={onRemove}
            title={t("removeLine")}
          >
            <TrashIcon />
          </Button>
          ) : null}
        </div>
      </div>
      {selectedItem && !isFreeAmount ? (
        <div className="grid gap-2 sm:grid-cols-3 lg:max-w-xl">
          <DimensionInput
            key={`${line.itemId}-thickness`}
            name={`thickness-${line.key}`}
            onAddDefault={(value) => onAddDimensionDefault("thickness", value)}
            label={t("fieldThickness")}
            value={line.thicknessM}
            defaults={selectedItem.dimensionDefaults?.thickness}
            required={isCubic}
            onChange={(value) => onChange({ thicknessM: value })}
          />
          <DimensionInput
            key={`${line.itemId}-width`}
            name={`width-${line.key}`}
            onAddDefault={(value) => onAddDimensionDefault("width", value)}
            label={t("fieldWidth")}
            value={line.widthM}
            defaults={selectedItem.dimensionDefaults?.width}
            required={isCubic}
            onChange={(value) => onChange({ widthM: value })}
          />
          <DimensionInput
            key={`${line.itemId}-length`}
            name={`length-${line.key}`}
            onAddDefault={(value) => onAddDimensionDefault("length", value)}
            label={t("fieldLength")}
            value={line.lengthM}
            defaults={selectedItem.dimensionDefaults?.length}
            required={isCubic}
            onChange={(value) => onChange({ lengthM: value })}
          />
        </div>
      ) : null}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
