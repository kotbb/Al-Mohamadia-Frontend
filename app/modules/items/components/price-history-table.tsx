"use client";

import { useLocale, useTranslations } from "next-intl";
import type { PriceHistoryEntry } from "@/app/modules/items/types/items.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";

interface PriceHistoryTableProps {
  history: PriceHistoryEntry[];
  compact?: boolean;
}

function formatFieldLabel(
  field: string,
  t: ReturnType<typeof useTranslations>,
): string {
  if (field === "unitPrice") return t("historySellingPrice");
  if (field === "cost") return t("historyCost");
  return field;
}

function formatValue(
  field: string,
  value: unknown,
  locale: string,
): string {
  if (value === null || value === undefined) return "—";
  if (field === "unitPrice" || field === "cost") {
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isNaN(numeric)) return formatMoney(numeric, locale);
  }
  return String(value);
}

export function PriceHistoryTable({
  history,
  compact = false,
}: PriceHistoryTableProps) {
  const t = useTranslations("items");
  const locale = useLocale();
  const cell = compact ? "px-3 py-2.5 text-sm" : "px-5 py-4";
  const head = compact
    ? "px-3 py-2.5 text-start text-sm font-medium text-text-secondary"
    : "px-5 py-4 text-start font-medium text-text-secondary";

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white dark:bg-surface">
      <table
        className={`w-full border-collapse ${
          compact ? "min-w-[36rem] text-sm" : "min-w-[48rem] text-base"
        }`}
      >
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className={head}>{t("historyColField")}</th>
            <th className={head}>{t("historyColOld")}</th>
            <th className={head}>{t("historyColNew")}</th>
            <th className={head}>{t("historyColChangedBy")}</th>
            <th className={head}>{t("historyColDate")}</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-border last:border-b-0"
            >
              <td className={`${cell} text-text-primary`}>
                {formatFieldLabel(entry.field, t)}
              </td>
              <td className={`${cell} text-text-secondary`}>
                {formatValue(entry.field, entry.oldValue, locale)}
              </td>
              <td className={`${cell} text-text-primary`}>
                {formatValue(entry.field, entry.newValue, locale)}
              </td>
              <td className={`${cell} font-mono text-xs text-text-muted`}>
                {entry.changedBy}
              </td>
              <td className={`${cell} whitespace-nowrap text-text-muted`}>
                {entry.createdAt
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(entry.createdAt))
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
