import { metersToCubicMeters } from "./invoice-math";
import type { InvoiceDisplayLine } from "../types/invoice-display.types";
type PricedLine = Pick<InvoiceDisplayLine, "pricingModeSnapshot" | "thickness" | "width" | "length" | "unitRate">;
export function invoiceDisplayMode(
  line: Pick<InvoiceDisplayLine, "pricingModeSnapshot" | "thickness" | "width" | "length">,
) {
  return (
    line.pricingModeSnapshot ??
    (line.thickness != null && line.width != null && line.length != null ? "per_cubic_meter" : "per_piece")
  );
}
export function invoiceLineUnitPrice(line: PricedLine): number {
  return invoiceDisplayMode(line) === "per_cubic_meter"
    ? metersToCubicMeters(line.thickness ?? 0, line.width ?? 0, line.length ?? 0) * line.unitRate
    : line.unitRate;
}
export function invoiceLineVolume(
  line: Pick<InvoiceDisplayLine, "pricingModeSnapshot" | "quantity" | "thickness" | "width" | "length">,
): number | null {
  if (invoiceDisplayMode(line) !== "per_cubic_meter") return null;
  return (
    Math.round(
      line.quantity * metersToCubicMeters(line.thickness ?? 0, line.width ?? 0, line.length ?? 0) * 1_000_000,
    ) / 1_000_000
  );
}
export function formatInvoiceVolume(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  });
}
