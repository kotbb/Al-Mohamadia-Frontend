"use client";

import { useTranslations } from "next-intl";
import type { DimensionDefaultsForm } from "@/app/modules/items/types/dimension-defaults-form.types";
import { DashedAddButton } from "@/app/modules/shared/components/dashed-add-button";

interface DimensionDefaultsEditorProps {
  value: DimensionDefaultsForm;
  onChange: (value: DimensionDefaultsForm) => void;
  disabled: boolean;
}

export function DimensionDefaultsEditor({
  value,
  onChange,
  disabled,
}: DimensionDefaultsEditorProps) {
  const t = useTranslations("items");
  return (
    <fieldset className="rounded-xl border border-border p-4">
      <legend className="px-1 font-semibold text-text-primary">
        {t("dimensionDefaultsTitle")}
      </legend>
      <p className="mb-3 text-sm text-text-secondary">
        {t("dimensionDefaultsHint")}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["thickness", "width", "length"] as const).map((dimension) => (
          <div key={dimension} className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-medium text-text-secondary">
              {t(dimension)}
            </span>
            {value[dimension].map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  aria-label={`${t(dimension)} ${index + 1}`}
                  type="number"
                  min={0}
                  step="any"
                  value={entry}
                  disabled={disabled}
                  className="ds-focus-input min-h-11 min-w-0 w-full rounded-xl border border-border bg-surface px-3 text-base"
                  onChange={(event) =>
                    onChange({
                      ...value,
                      [dimension]: value[dimension].map((old, position) =>
                        position === index ? event.target.value : old,
                      ),
                    })
                  }
                />
                {value[dimension].length > 1 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={t("removeDimensionDefault", {
                      dimension: t(dimension),
                      index: index + 1,
                    })}
                    className="ds-focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                    onClick={() =>
                      onChange({
                        ...value,
                        [dimension]: value[dimension].filter(
                          (_, position) => position !== index,
                        ),
                      })
                    }
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M6 6l12 12M6 18 18 6" />
                    </svg>
                  </button>
                ) : null}
              </div>
            ))}
            <DashedAddButton
              type="button"
              label={t("addDimensionDefault")}
              className="self-end"
              disabled={disabled}
              onClick={() =>
                onChange({ ...value, [dimension]: [...value[dimension], ""] })
              }
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
