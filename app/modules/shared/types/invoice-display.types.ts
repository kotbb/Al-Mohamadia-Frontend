export interface InvoiceDisplayLine {
  itemId: string;
  quantity: number;
  pricingModeSnapshot?: "per_piece" | "per_cubic_meter" | "free_amount";
  thickness: number | null;
  width: number | null;
  length: number | null;
  unitRate: number;
  lineTotal: number;
  note: string | null;
  name: string | null;
}
