import { parsePositive } from "@/app/modules/shared/utils/form-numbers";
import type { PurchaseLineFormState } from "@/app/modules/purchases/types/purchases.types";
import {
  lineTotalForPricing,
  roundMoney,
} from "@/app/modules/shared/utils/invoice-math";
import type { Item } from "@/app/modules/items/types/items.types";

export function newLine(): PurchaseLineFormState {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemId: "",
    quantity: "1",
    unitCost: "",
    thicknessM: "",
    widthM: "",
    lengthM: "",
    note: "",
  };
}

export function lineTotalForPurchaseLine(
  line: PurchaseLineFormState,
  itemsById: Map<string, Item>,
): number {
  const item = itemsById.get(line.itemId);
  if (!item) return 0;
  const quantity = parsePositive(line.quantity);
  const unitCost = parsePositive(line.unitCost);
  if (quantity === null || unitCost === null) return 0;
  const thickness =
    item.pricingMode === "per_cubic_meter"
      ? parsePositive(line.thicknessM)
      : null;
  const width =
    item.pricingMode === "per_cubic_meter" ? parsePositive(line.widthM) : null;
  const length =
    item.pricingMode === "per_cubic_meter" ? parsePositive(line.lengthM) : null;
  if (
    item.pricingMode === "per_cubic_meter" &&
    (thickness === null || width === null || length === null)
  ) {
    return 0;
  }
  return roundMoney(
    lineTotalForPricing({
      pricingMode: item.pricingMode,
      quantity,
      piecePrice: unitCost,
      thicknessM: thickness,
      widthM: width,
      lengthM: length,
    }),
  );
}
