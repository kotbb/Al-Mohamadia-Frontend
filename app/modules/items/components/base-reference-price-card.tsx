"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/app/modules/shared/components/button";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import type { BaseReferencePrice } from "@/app/modules/items/types/items.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";

interface BaseReferencePriceCardProps {
  basePrice: BaseReferencePrice | null;
  draft: string;
  onDraftChange: (value: string) => void;
  isSaving: boolean;
  saveError: string | null;
  onSave: () => Promise<void>;
  status: "idle" | "loading" | "success" | "error";
}

export function BaseReferencePriceCard({
  basePrice,
  draft,
  onDraftChange,
  isSaving,
  saveError,
  onSave,
  status,
}: BaseReferencePriceCardProps) {
  const t = useTranslations("items");
  const locale = useLocale();

  const lastUpdated =
    basePrice?.updatedAt &&
    new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(basePrice.updatedAt),
    );

  return (
    <SurfaceCard padding="sm" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-text-primary">
          {t("basePriceTitle")}
        </h2>
        <p className="mt-0.5 text-xs text-text-muted">{t("basePriceHint")}</p>
        {basePrice?.value !== null && basePrice?.value !== undefined ? (
          <p className="mt-1.5 text-xs text-text-secondary">
            {t("basePriceCurrent", { value: formatMoney(basePrice.value, locale) })}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[14rem] sm:items-stretch">
        {lastUpdated ? (
          <p className="text-[11px] text-text-muted sm:text-end">
            {t("basePriceUpdated", { date: lastUpdated })}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            name="baseReferencePrice"
            type="number"
            min={0}
            step="0.01"
            aria-label={t("basePriceLabel")}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            disabled={status === "loading" || isSaving}
            className="ds-focus-input min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary disabled:bg-surface-muted disabled:text-text-muted sm:w-40 sm:flex-none"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 rounded-lg"
            disabled={status === "loading" || isSaving || !draft.trim()}
            onClick={() => void onSave()}
          >
            {isSaving ? t("saving") : t("saveBasePrice")}
          </Button>
        </div>
        {saveError ? (
          <p className="text-xs text-danger" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
