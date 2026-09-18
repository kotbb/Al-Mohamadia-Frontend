export type PurchaseInvoiceStatus = "saved" | "cancelled";

export interface PurchaseInvoiceLine {
  itemId: string;
  quantity: number;
  width: number | null;
  length: number | null;
  thickness: number | null;
  unitCost: number;
  lineTotal: number;
  note: string | null;
}

export interface PurchaseInvoice {
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
  items: PurchaseInvoice[];
  meta: PurchaseInvoiceListMeta;
  summary: PurchaseInvoiceListSummary;
}

export interface ListPurchasesFilters {
  supplierId?: string;
  status?: PurchaseInvoiceStatus;
  period?: "day" | "week" | "month" | "year";
  date?: string;
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
  supplierId: string;
  lines: CreatePurchaseInvoiceLineInput[];
  paid?: number;
  notes?: string;
}

export interface PurchaseLineFormState {
  key: string;
  itemId: string;
  quantity: string;
  unitCost: string;
  widthCm: string;
  lengthCm: string;
  thicknessCm: string;
  note: string;
}
