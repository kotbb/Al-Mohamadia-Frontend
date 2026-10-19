import { metersToCubicMeters } from "@/app/modules/shared/utils/invoice-math";
import type { SalesInvoiceLine } from "../types/invoices.types";

type ReceiptVolumeLine = Pick<
  SalesInvoiceLine,
  "pricingModeSnapshot" | "quantity" | "thickness" | "width" | "length"
>;

export function receiptLineCubicVolume(line: ReceiptVolumeLine): number | null {
  const isCubic = line.pricingModeSnapshot === "per_cubic_meter" ||
    (line.pricingModeSnapshot == null &&
      line.thickness != null && line.width != null && line.length != null);
  if (!isCubic) return null;

  const perPiece = metersToCubicMeters(
    line.thickness ?? 0,
    line.width ?? 0,
    line.length ?? 0,
  );
  return Math.round(line.quantity * perPiece * 1_000_000) / 1_000_000;
}

export function receiptTotalCubicVolume(lines: ReceiptVolumeLine[]): number {
  return Math.round(
    lines.reduce((sum, line) => sum + (receiptLineCubicVolume(line) ?? 0), 0) * 1_000_000,
  ) / 1_000_000;
}

export function formatReceiptCubicVolume(volume: number): string {
  return volume.toLocaleString("en-US", {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  });
}
