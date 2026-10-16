import type { SalesInvoiceLine } from "../types/invoices.types";
import { metersToCubicMeters } from "@/app/modules/shared/utils/invoice-math";

export function receiptUnitPrice(
  line: Pick<
    SalesInvoiceLine,
    "pricingModeSnapshot" | "piecePrice" | "thickness" | "width" | "length"
  >,
): number {
  const mode =
    line.pricingModeSnapshot ??
    (line.thickness != null && line.width != null && line.length != null
      ? "per_cubic_meter"
      : "per_piece");
  return mode === "per_piece"
    ? line.piecePrice
    : metersToCubicMeters(
        line.thickness ?? 0,
        line.width ?? 0,
        line.length ?? 0,
      ) * line.piecePrice;
}
