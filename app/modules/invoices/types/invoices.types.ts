export type SalesInvoiceType = "cash_sale" | "customer_sale";
export type SalesInvoiceStatus = "saved" | "cancelled";
export type SalesInvoicePeriod = "day" | "week" | "month" | "year";

export interface SalesInvoiceLine {
  itemId: string;
  quantity: number;
  width: number | null;
  length: number | null;
  thickness: number | null;
  piecePrice: number;
  costPriceSnapshot: number;
  lineTotal: number;
  note: string | null;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  type: SalesInvoiceType;
  customerId: string | null;
  lines: SalesInvoiceLine[];
  total: number;
  discount: number;
  paid: number;
  remaining: number;
  status: SalesInvoiceStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesInvoiceListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SalesInvoiceListResponse {
  items: SalesInvoice[];
  meta: SalesInvoiceListMeta;
}

export interface ListSalesInvoicesFilters {
  q?: string;
  status?: SalesInvoiceStatus;
  period?: SalesInvoicePeriod;
  date?: string;
  page?: number;
  limit?: number;
}

export interface CreateSalesInvoiceLineInput {
  itemId: string;
  quantity: number;
  width?: number;
  length?: number;
  thickness?: number;
  piecePrice: number;
  note?: string;
}

export interface CreateSalesInvoiceInput {
  type: SalesInvoiceType;
  customerId?: string;
  lines: CreateSalesInvoiceLineInput[];
  discount?: number;
  paid: number;
}

export interface SalesInvoiceSharePayload {
  pdfUrl: string;
  whatsappUrl: string;
  message: string;
}
