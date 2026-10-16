import type { PricingMode } from "@/app/modules/items/types/items.types";

/** Rounds a monetary value to 2 decimal places (EGP) — mirrors backend. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** thickness × width × length in meters → m³, 6 decimal places — mirrors backend. */
export function metersToCubicMeters(
  thicknessM: number,
  widthM: number,
  lengthM: number,
): number {
  const volume = thicknessM * widthM * lengthM;
  return Math.round(volume * 1_000_000) / 1_000_000;
}

/**
 * Line total for a sales line (EGP, caller should roundMoney).
 * per_cubic_meter: quantity × volume × piecePrice; per_piece: quantity × piecePrice.
 */
export function lineTotalForPricing(params: {
  pricingMode: PricingMode;
  quantity: number;
  piecePrice: number;
  thicknessM?: number | null;
  widthM?: number | null;
  lengthM?: number | null;
}): number {
  if (params.pricingMode === "per_piece") {
    return params.quantity * params.piecePrice;
  }

  const thickness = params.thicknessM ?? 0;
  const width = params.widthM ?? 0;
  const length = params.lengthM ?? 0;
  const volume = metersToCubicMeters(thickness, width, length);
  return params.quantity * volume * params.piecePrice;
}

export function computeInvoiceTotals(params: {
  lineTotals: number[];
  discount: number;
  paid: number;
}): {
  total: number;
  discount: number;
  paid: number;
  remaining: number;
  net: number;
} {
  const total = roundMoney(params.lineTotals.reduce((sum, n) => sum + n, 0));
  const discount = roundMoney(params.discount);
  const paid = roundMoney(params.paid);
  const net = roundMoney(total - discount);
  const remaining = roundMoney(net - paid);
  return { total, discount, paid, remaining, net };
}
