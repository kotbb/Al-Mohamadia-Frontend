import type { Supplier } from "@/app/modules/suppliers/types/suppliers.types";
import type { Item } from "@/app/modules/items/types/items.types";
import type { PricingMode } from "@/app/modules/items/types/items.types";

export type PurchaseInvoiceStatus = "saved" | "cancelled";

export interface PurchaseInvoiceLine {
  itemId: string;
  quantity: number;
  pricingModeSnapshot?: PricingMode;
  width: number | null;
  length: number | null;
  thickness: number | null;
  unitCost: number;
  lineTotal: number;
  note: string | null;
}

export interface PurchaseInvoice {
  accountPaymentAmount?: number;
  id: string;
  invoiceNumber: string;
  supplierId: string;
  lines: PurchaseInvoiceLine[];
  total: number;
  paid: number;
  remaining: number;
  status: PurchaseInvoiceStatus;
  notes: string | null;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseInvoiceListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PurchaseInvoiceListSummary {
  totalAmount: number;
}

export interface PurchaseInvoiceListResponse {
  items: PurchaseInvoiceListItem[];
  meta: PurchaseInvoiceListMeta;
  summary: PurchaseInvoiceListSummary;
}

export interface ListPurchasesFilters {
  supplierId?: string;
  status?: PurchaseInvoiceStatus;
  period?: "day" | "week" | "month" | "year";
  date?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CreatePurchaseInvoiceLineInput {
  itemId: string;
  quantity: number;
  unitCost: number;
  width?: number;
  length?: number;
  thickness?: number;
  note?: string;
}

export interface CreatePurchaseInvoiceInput {
  accountPaymentAmount?: number;
  supplierId: string;
  lines: CreatePurchaseInvoiceLineInput[];
  paid?: number;
  existingDebtPayment?: number;
  notes?: string;
}

export type UpdatePurchaseInvoiceInput = Omit<CreatePurchaseInvoiceInput, "existingDebtPayment" | "paid"> & { paid: number };

export interface PurchaseLineFormState {
  key: string;
  itemId: string;
  quantity: string;
  unitCost: string;
  widthM: string;
  lengthM: string;
  thicknessM: string;
  note: string;
}

export interface PurchaseInvoiceListItem extends PurchaseInvoice {
  supplierName: string | null;
}

export interface PurchaseInvoiceDetail extends PurchaseInvoice {
  supplier: Supplier | null;
  items: Item[];
}
