export type PricingMode = "per_piece" | "per_cubic_meter";

/** Rounds a monetary value to 2 decimal places (EGP) — mirrors backend. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** thickness × width × length in cm → m³, 6 decimal places — mirrors backend. */
export function cmToCubicMeters(
  thicknessCm: number,
  widthCm: number,
  lengthCm: number,
): number {
  const volume = (thicknessCm * widthCm * lengthCm) / 1_000_000;
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
  thicknessCm?: number | null;
  widthCm?: number | null;
  lengthCm?: number | null;
}): number {
  if (params.pricingMode === "per_piece") {
    return params.quantity * params.piecePrice;
  }

  const thickness = params.thicknessCm ?? 0;
  const width = params.widthCm ?? 0;
  const length = params.lengthCm ?? 0;
  const volume = cmToCubicMeters(thickness, width, length);
  return params.quantity * volume * params.piecePrice;
}

export function computeInvoiceTotals(params: {
  lineTotals: number[];
  discount: number;
  paid: number;
}): { total: number; discount: number; paid: number; remaining: number; net: number } {
  const total = roundMoney(params.lineTotals.reduce((sum, n) => sum + n, 0));
  const discount = roundMoney(params.discount);
  const paid = roundMoney(params.paid);
  const net = roundMoney(total - discount);
  const remaining = roundMoney(net - paid);
  return { total, discount, paid, remaining, net };
}
