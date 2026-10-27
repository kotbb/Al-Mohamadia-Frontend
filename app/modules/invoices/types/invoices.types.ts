import type { Customer } from "@/app/modules/customers/types/customers.types";
import type { Item } from "@/app/modules/items/types/items.types";
export type SalesInvoiceType = "cash_sale" | "customer_sale";
export type SalesInvoiceStatus = "saved" | "cancelled";
export type SalesInvoicePeriod = "day" | "week" | "month" | "year";

export interface SalesInvoiceLine {
  itemId: string;
  quantity: number;
  pricingModeSnapshot?: "per_piece" | "per_cubic_meter" | "free_amount";
  width: number | null;
  length: number | null;
  thickness: number | null;
  piecePrice: number;
  costPriceSnapshot: number;
  lineTotal: number;
  note: string | null;
}

export interface SalesInvoice {
  accountPaymentAmount?: number;
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

export interface SalesInvoiceListItem extends SalesInvoice {
  customerName: string | null;
}

export interface SalesInvoiceListSummary {
  totalAmount: number;
}

export interface SalesInvoiceListResponse {
  items: SalesInvoiceListItem[];
  meta: SalesInvoiceListMeta;
  summary: SalesInvoiceListSummary;
}

export interface ListSalesInvoicesFilters {
  customerId?: string;
  q?: string;
  status?: SalesInvoiceStatus;
  period?: SalesInvoicePeriod;
  date?: string;
  from?: string;
  to?: string;
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
  accountPaymentAmount?: number;
  type: SalesInvoiceType;
  customerId?: string;
  lines: CreateSalesInvoiceLineInput[];
  discount?: number;
  paid: number;
  paymentMethod?: string;
  paymentNotes?: string;
}

export type UpdateSalesInvoiceInput = CreateSalesInvoiceInput;

export interface SalesInvoiceSharePayload {
  pdfUrl: string;
  whatsappUrl: string;
  message: string;
}

export interface InvoiceNeighbors {
  previousId: string | null;
  nextId: string | null;
  previousByNumberId: string | null;
  nextByNumberId: string | null;
}

export interface PublicInvoiceLine {
  pricingModeSnapshot: "per_piece" | "per_cubic_meter" | "free_amount";
  itemLabel: string;
  quantity: number;
  width: number | null;
  length: number | null;
  thickness: number | null;
  piecePrice: number;
  lineTotal: number;
  note: string | null;
}

export interface PublicInvoice {
  accountPaymentAmount?: number;
  invoiceNumber: string;
  createdAt: string;
  status: string;
  type: string;
  customerName: string | null;
  lines: PublicInvoiceLine[];
  total: number;
  discount: number;
  paid: number;
  remaining: number;
}

export interface SalesInvoiceDetail extends SalesInvoice {
  customer: Customer | null;
  items: Item[];
}
