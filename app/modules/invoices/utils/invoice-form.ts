import { parsePositive } from "@/app/modules/shared/utils/form-numbers";
import {
  lineTotalForPricing,
  roundMoney,
} from "@/app/modules/shared/utils/invoice-math";
import type { Item } from "@/app/modules/items/types/items.types";

import type { InvoiceFormLine } from "../types/use-invoice-form.types";

export function newLine(): InvoiceFormLine {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemId: "",
    quantity: "1",
    piecePrice: "",
    thickness: "",
    width: "",
    length: "",
    note: "",
  };
}

export function lineTotalForFormLine(
  line: InvoiceFormLine,
  itemsById: Map<string, Item>,
): number {
  const item = itemsById.get(line.itemId);
  if (!item) return 0;
  const quantity = parsePositive(line.quantity);
  const piecePrice = parsePositive(line.piecePrice);
  if (quantity === null || piecePrice === null) return 0;
  const thickness =
    item.pricingMode === "per_cubic_meter"
      ? parsePositive(line.thickness)
      : null;
  const width =
    item.pricingMode === "per_cubic_meter" ? parsePositive(line.width) : null;
  const length =
    item.pricingMode === "per_cubic_meter" ? parsePositive(line.length) : null;
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
      piecePrice,
      thicknessM: thickness,
      widthM: width,
      lengthM: length,
    }),
  );
}
