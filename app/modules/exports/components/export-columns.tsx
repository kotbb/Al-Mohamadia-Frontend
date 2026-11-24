"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/app/modules/shared/components/button";
import type { ExportColumn, ExportLocale } from "../types/exports.types";

export function ExportColumns({
  columns,
  selected,
  onChange,
  lines = false,
}: {
  columns: ExportColumn[];
  selected: string[];
  onChange: (columns: string[]) => void;
  lines?: boolean;
}) {
  const locale = useLocale() as ExportLocale;
  const t = useTranslations("exports");
  const required = lines ? ["invoiceNumber", "lineNumber"] : [];
  const choose = (ids: string[]) =>
    onChange(columns.filter((col) => ids.includes(col.id) || required.includes(col.id)).map((col) => col.id));
  return (
    <details className="rounded-xl border border-border bg-surface">
      <summary className="ds-focus-ring min-h-11 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-text-primary">
        {t(lines ? "lineColumns" : "columns")}{" "}
        <bdi>
          ({selected.length}/{columns.length})
        </bdi>
      </summary>
      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => choose(columns.map((col) => col.id))}>
            {t("selectAll")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => choose(columns.filter((col) => col.default).map((col) => col.id))}
          >
            {t("resetColumns")}
          </Button>
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          {columns.map((col) => (
            <label key={col.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-text-primary">
              <input
                className="ds-focus-ring h-5 w-5 accent-primary"
                type="checkbox"
                checked={selected.includes(col.id)}
                disabled={required.includes(col.id)}
                onChange={(event) =>
                  choose(event.target.checked ? [...selected, col.id] : selected.filter((id) => id !== col.id))
                }
              />
              {col.label[locale]}
              {required.includes(col.id) ? <span className="text-text-secondary">{t("required")}</span> : null}
            </label>
          ))}
        </div>
        {!selected.length ? (
          <p className="text-sm text-danger" role="alert">
            {t("chooseColumn")}
          </p>
        ) : null}
      </div>
    </details>
  );
}
