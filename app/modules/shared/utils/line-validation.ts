import { lineTotalForPricing, metersToCubicMeters } from "./invoice-math";
import type { PricingMode } from "@/app/modules/items/types/items.types";

export function isUsableLine(params: {
  pricingMode: PricingMode;
  quantity: number;
  piecePrice: number;
  thicknessM: number;
  widthM: number;
  lengthM: number;
}): boolean {
  const volume = params.pricingMode === "per_piece" ? 1 : metersToCubicMeters(params.thicknessM, params.widthM, params.lengthM);
  const stock = Math.round(params.quantity * volume * 1_000_000) / 1_000_000;
  return Number.isFinite(volume) && volume > 0 && Number.isFinite(stock) && stock > 0 && Number.isFinite(lineTotalForPricing(params));
}
