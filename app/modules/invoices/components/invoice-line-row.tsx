"use client";

import { useLocale, useTranslations } from "next-intl";
import type { InvoiceFormLine } from "@/app/modules/invoices/hooks/use-invoice-form";
import type { Item } from "@/app/modules/items/types/items.types";
import {
  formatMoney,
  roundMoneyAmount,
} from "@/app/modules/items/utils/format-money";
import { Button } from "@/app/modules/shared/components/button";
import { Input } from "@/app/modules/shared/components/input";

interface InvoiceLineRowProps {
  line: InvoiceFormLine;
  items: Item[];
  lineTotal: number;
  canRemove: boolean;
  onSelectItem: (itemId: string) => void;
  onChange: (patch: Partial<InvoiceFormLine>) => void;
  onRemove: () => void;
}

export function InvoiceLineRow({
  line,
  items,
  lineTotal,
  canRemove,
  onSelectItem,
  onChange,
  onRemove,
}: InvoiceLineRowProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const selected = items.find((item) => item.id === line.itemId);
  const isCubic = selected?.pricingMode === "per_cubic_meter";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex w-full flex-col gap-1.5 md:col-span-2">
          <span className="text-base font-medium text-text-secondary">
            {t("fieldItem")}
          </span>
          <select
            className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-base text-text-primary"
            value={line.itemId}
            onChange={(event) => onSelectItem(event.target.value)}
          >
            <option value="">{t("fieldItemPlaceholder")}</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.code})
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
          onChange={(event) => onChange({ quantity: event.target.value })}
        />
        <Input
          name={`price-${line.key}`}
          label={t("fieldPrice")}
          type="number"
          min={0}
          step="any"
          value={line.piecePrice}
          onChange={(event) => onChange({ piecePrice: event.target.value })}
          onBlur={() => {
            const rounded = roundMoneyAmount(line.piecePrice);
            if (rounded === null) return;
            onChange({ piecePrice: String(rounded) });
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
            value={line.thickness}
            onChange={(event) => onChange({ thickness: event.target.value })}
          />
          <Input
            name={`width-${line.key}`}
            label={t("fieldWidth")}
            type="number"
            min={0}
            step="any"
            value={line.width}
            onChange={(event) => onChange({ width: event.target.value })}
          />
          <Input
            name={`length-${line.key}`}
            label={t("fieldLength")}
            type="number"
            min={0}
            step="any"
            value={line.length}
            onChange={(event) => onChange({ length: event.target.value })}
          />
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <Input
          name={`note-${line.key}`}
          label={t("fieldNote")}
          value={line.note}
          maxLength={500}
          onChange={(event) => onChange({ note: event.target.value })}
        />
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-2.5">
          <p className="text-sm text-text-secondary">{t("fieldLineTotal")}</p>
          <p className="font-semibold text-text-primary">
            {formatMoney(lineTotal, locale)} {t("currency")}
          </p>
        </div>
        {canRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            {t("removeLine")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
