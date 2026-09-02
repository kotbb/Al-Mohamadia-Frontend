"use client";

import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/app/modules/shared/components/input";
import { SegmentedControl } from "@/app/modules/shared/components/segmented-control";
import type { ItemFormValues } from "@/app/modules/items/hooks/use-item-form";
import type { Category, PricingMode } from "@/app/modules/items/types/items.types";

interface ItemFormProps {
  values: ItemFormValues;
  categories: Category[];
  isEdit: boolean;
  isSubmitting: boolean;
  error: string | null;
  codeIsManual?: boolean;
  onFieldChange: <K extends keyof ItemFormValues>(
    key: K,
    value: ItemFormValues[K],
  ) => void;
  onSubmit: () => Promise<void>;
  compact?: boolean;
}

export function ItemForm({
  values,
  categories,
  isEdit,
  isSubmitting,
  error,
  codeIsManual = true,
  onFieldChange,
  onSubmit,
  compact = false,
}: ItemFormProps) {
  const t = useTranslations("items");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

  const pricingOptions: Array<{ value: PricingMode; label: string }> = [
    { value: "per_piece", label: t("pricingPerPiece") },
    { value: "per_cubic_meter", label: t("pricingPerCubicMeter") },
  ];

  const gap = compact ? "gap-4" : "gap-6";
  const codeHint = isEdit
    ? undefined
    : codeIsManual
      ? t("fieldCodeHintManual")
      : t("fieldCodeHintAuto");

  return (
    <form id="item-form" onSubmit={handleSubmit} className={`flex flex-col ${gap}`}>
      <Input
        name="name"
        label={t("fieldName")}
        value={values.name}
        onChange={(event) => onFieldChange("name", event.target.value)}
        required
        disabled={isSubmitting}
      />

      <label className="flex w-full flex-col gap-1.5">
        <span className="text-base font-medium text-text-secondary">
          {t("fieldCategory")}
        </span>
        <select
          value={values.categoryId}
          onChange={(event) => onFieldChange("categoryId", event.target.value)}
          required
          disabled={isSubmitting}
          className="ds-focus-input min-h-11 rounded-xl border border-border bg-surface px-4 text-base text-text-primary disabled:bg-surface-muted"
        >
          <option value="" disabled>
            {t("fieldCategoryPlaceholder")}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <Input
        name="code"
        label={t("fieldCode")}
        value={values.code}
        onChange={(event) => onFieldChange("code", event.target.value)}
        required
        disabled={isSubmitting}
        hint={codeHint}
      />

      <SegmentedControl
        label={t("fieldPricingMode")}
        value={values.pricingMode}
        options={pricingOptions}
        onChange={(value) => onFieldChange("pricingMode", value)}
        disabled={isSubmitting}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="unitPrice"
          type="number"
          min={0}
          step="0.01"
          label={t("fieldUnitPrice")}
          value={values.unitPrice}
          onChange={(event) => onFieldChange("unitPrice", event.target.value)}
          disabled={isSubmitting}
        />
        <Input
          name="cost"
          type="number"
          min={0}
          step="0.01"
          label={t("fieldCost")}
          value={values.cost}
          onChange={(event) => onFieldChange("cost", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className={`grid gap-4 ${isEdit ? "" : "sm:grid-cols-2"}`}>
        <Input
          name="reorderThreshold"
          type="number"
          min={0}
          step="1"
          label={t("fieldReorderThreshold")}
          value={values.reorderThreshold}
          onChange={(event) => onFieldChange("reorderThreshold", event.target.value)}
          disabled={isSubmitting}
        />

        {!isEdit ? (
          <Input
            name="stockQuantity"
            type="number"
            min={0}
            step="1"
            label={t("fieldStockQuantity")}
            value={values.stockQuantity}
            onChange={(event) => onFieldChange("stockQuantity", event.target.value)}
            disabled={isSubmitting}
          />
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 text-base text-text-secondary">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(event) => onFieldChange("isActive", event.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        {t("fieldActive")}
      </label>

      {error ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
