"use client";
import { useLocale, useTranslations } from "next-intl";
import type { InvoiceDisplayLine } from "../types/invoice-display.types";
import { formatMoney } from "../utils/format-money";
import {
  formatInvoiceVolume,
  invoiceDisplayMode,
  invoiceLineUnitPrice,
  invoiceLineVolume,
} from "../utils/invoice-line-display";
export function InvoiceDetailTable({
  lines,
  total,
  unavailableLabel,
}: {
  lines: InvoiceDisplayLine[];
  total: number;
  unavailableLabel: string;
}) {
  const t = useTranslations("invoiceDetails");
  const locale = useLocale();
  const hasDimensions = lines.some(
    (line) =>
      invoiceDisplayMode(line) !== "free_amount" &&
      [line.thickness, line.width, line.length].some((value) => value != null),
  );
  const hasVolume = lines.some((line) => invoiceLineVolume(line) !== null);
  const quantity = lines.reduce(
    (sum, line) => sum + (invoiceDisplayMode(line) === "free_amount" ? 0 : line.quantity),
    0,
  );
  const volume =
    Math.round(lines.reduce((sum, line) => sum + (invoiceLineVolume(line) ?? 0), 0) * 1_000_000) / 1_000_000;
  const columns = [
    "item",
    "quantity",
    ...(hasDimensions ? ["thickness", "width", "length"] : []),
    ...(hasVolume ? ["volume"] : []),
    "unitPrice",
    "lineTotal",
  ];
  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full ${hasDimensions || hasVolume ? "min-w-[54rem]" : "min-w-[40rem]"} border-collapse text-sm lg:text-base`}
      >
        <thead className="bg-surface-muted">
          <tr className="border-b border-border">
            {columns.map((key) => (
              <th
                key={key}
                scope="col"
                className={`px-3 py-3 font-medium text-text-secondary ${key === "item" ? "text-start" : key === "unitPrice" || key === "lineTotal" ? "text-end" : "text-center"}`}
              >
                {t(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr>td]:align-baseline">
          {lines.map((line, index) => {
            const mode = invoiceDisplayMode(line);
            const free = mode === "free_amount";
            const cubic = invoiceLineVolume(line);
            return (
              <tr key={`${line.itemId}-${index}`} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-text-primary">
                  <div className="font-semibold">{line.name ?? unavailableLabel}</div>
                  {line.note ? (
                    <div className="mt-0.5 whitespace-pre-wrap break-words text-xs font-normal leading-relaxed text-text-secondary">
                      {line.note}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-center tabular-nums">{free ? "" : line.quantity}</td>
                {hasDimensions
                  ? [line.thickness, line.width, line.length].map((value, i) => (
                      <td key={i} className="px-3 py-3 text-center tabular-nums text-text-secondary">
                        <bdi>{free ? "" : (value ?? "—")}</bdi>
                      </td>
                    ))
                  : null}
                {hasVolume ? (
                  <td className="px-3 py-3 text-center tabular-nums">
                    <bdi>{cubic === null ? "" : formatInvoiceVolume(cubic)}</bdi>
                  </td>
                ) : null}
                <td className="px-3 py-3 text-end tabular-nums">
                  <bdi>{free ? "" : formatMoney(invoiceLineUnitPrice(line), locale)}</bdi>
                  {mode === "per_cubic_meter" ? (
                    <div className="mt-0.5 text-xs text-text-secondary">
                      <bdi>
                        {t("ratePerCubicMeter", {
                          amount: formatMoney(line.unitRate, locale),
                        })}
                      </bdi>
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-end font-medium tabular-nums">
                  <bdi>{formatMoney(line.lineTotal, locale)}</bdi>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border font-semibold">
            <th scope="row" className="px-3 py-3 text-start">
              {t("total")}
            </th>
            <td className="px-3 py-3 text-center tabular-nums">{quantity}</td>
            {hasDimensions ? <td colSpan={3} /> : null}
            {hasVolume ? (
              <td className="px-3 py-3 text-center tabular-nums">
                <bdi>{formatInvoiceVolume(volume)}</bdi>
              </td>
            ) : null}
            <td />
            <td className="px-3 py-3 text-end tabular-nums">
              <bdi>{formatMoney(total, locale)}</bdi>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
