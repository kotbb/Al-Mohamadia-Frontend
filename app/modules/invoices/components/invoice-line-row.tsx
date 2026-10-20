"use client";

import { useLocale, useTranslations } from "next-intl";
import type { InvoiceFormLine } from "@/app/modules/invoices/types/use-invoice-form.types";
import type { DimensionName } from "@/app/modules/items/types/items.types";
import type { Item } from "@/app/modules/items/types/items.types";
import { CategorizedItemOptions } from "@/app/modules/items/components/categorized-item-options";
import {
  formatMoney,
  roundMoneyAmount,
} from "@/app/modules/shared/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { DimensionInput } from "@/app/modules/shared/components/dimension-input";
import { Input } from "@/app/modules/shared/components/input";

interface InvoiceLineRowProps {
  line: InvoiceFormLine;
  items: Item[];
  lineTotal: number;
  canRemove: boolean;
  onSelectItem: (itemId: string) => void;
  onChange: (patch: Partial<InvoiceFormLine>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onAddDimensionDefault: (
    dimension: DimensionName,
    value: number,
  ) => Promise<void>;
}

export function InvoiceLineRow({
  line,
  items,
  lineTotal,
  canRemove,
  onSelectItem,
  onChange,
  onDuplicate,
  onRemove,
  onAddDimensionDefault,
}: InvoiceLineRowProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const selected = items.find((item) => item.id === line.itemId);
  const isCubic = selected?.pricingMode === "per_cubic_meter";
  const isFreeAmount = selected?.pricingMode === "free_amount";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted/30 p-3">
      <div className={`grid items-end gap-2 sm:grid-cols-2 ${isFreeAmount ? "lg:grid-cols-[minmax(0,2fr)_minmax(7rem,1fr)_minmax(0,1.5fr)_minmax(6.5rem,1fr)_minmax(4rem,.5fr)]" : "lg:grid-cols-[minmax(0,2fr)_minmax(4rem,.65fr)_minmax(5.5rem,1fr)_minmax(0,1.5fr)_minmax(6.5rem,1fr)_6rem]"}`}>
        <label className="flex min-w-0 w-full flex-col gap-1 sm:col-span-2 lg:col-span-1">
          <span className="text-sm font-medium text-text-secondary">
            {t("fieldItem")}
          </span>
          <select
            className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary"
            value={line.itemId}
            onChange={(event) => onSelectItem(event.target.value)}
          >
            <option value="">{t("fieldItemPlaceholder")}</option>
            <CategorizedItemOptions items={items} locale={locale} />
          </select>
        </label>

        {!isFreeAmount && <Input
          density="compact"
          name={`qty-${line.key}`}
          label={t("fieldQty")}
          type="number"
          min={0}
          step="any"
          value={line.quantity}
          onChange={(event) => onChange({ quantity: event.target.value })}
        />}
        <Input
          density="compact"
          name={`price-${line.key}`}
          label={t(isFreeAmount ? "fieldFreeAmount" : "fieldPrice")}
          type="number"
          min={isFreeAmount ? 0.01 : 0}
          step="0.01"
          value={line.piecePrice}
          onChange={(event) => onChange({ piecePrice: event.target.value })}
          onBlur={() => {
            const rounded = roundMoneyAmount(line.piecePrice);
            if (rounded === null) return;
            onChange({ piecePrice: String(rounded) });
          }}
        />
        <Input
          density="compact"
          name={`note-${line.key}`}
          label={t("fieldNote")}
          placeholder={t("fieldNotePlaceholder")}
          value={line.note}
          maxLength={500}
          onChange={(event) => onChange({ note: event.target.value })}
        />
        <div className="flex min-h-11 flex-col justify-center rounded-xl border border-border bg-surface-muted px-3 py-1">
          <p className="text-sm text-text-secondary">{t("fieldLineTotal")}</p>
          <p className="whitespace-nowrap text-sm font-semibold text-text-primary">
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
            className="min-h-11 min-w-11 p-0 text-danger"
            aria-label={t("removeLine")}
            title={t("removeLine")}
            onClick={onRemove}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
            </svg>
          </Button>
          ) : null}
        </div>
      </div>
      {selected && !isFreeAmount ? (
        <div className="grid gap-2 sm:grid-cols-3 lg:max-w-xl">
          <DimensionInput
            key={`${line.itemId}-thickness`}
            name={`thickness-${line.key}`}
            onAddDefault={(value) => onAddDimensionDefault("thickness", value)}
            label={t("fieldThickness")}
            value={line.thickness}
            defaults={selected.dimensionDefaults?.thickness}
            required={isCubic}
            onChange={(value) => onChange({ thickness: value })}
          />
          <DimensionInput
            key={`${line.itemId}-width`}
            name={`width-${line.key}`}
            onAddDefault={(value) => onAddDimensionDefault("width", value)}
            label={t("fieldWidth")}
            value={line.width}
            defaults={selected.dimensionDefaults?.width}
            required={isCubic}
            onChange={(value) => onChange({ width: value })}
          />
          <DimensionInput
            key={`${line.itemId}-length`}
            name={`length-${line.key}`}
            onAddDefault={(value) => onAddDimensionDefault("length", value)}
            label={t("fieldLength")}
            value={line.length}
            defaults={selected.dimensionDefaults?.length}
            required={isCubic}
            onChange={(value) => onChange({ length: value })}
          />
        </div>
      ) : null}
    </div>
  );
}
