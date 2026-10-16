import type { PaymentMethod, PaymentPeriod } from "@/app/modules/payments/types/payments.types";

export type { PaymentMethod, PaymentPeriod };

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName?: string | null;
  purchaseInvoiceId: string | null;
  purchaseInvoiceNumber?: string | null;
  amount: number;
  method: PaymentMethod;
  notes: string | null;
  recordedBy: string;
  reversedAt: string | null;
  reversedBy: string | null;
  isReversed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierPaymentListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SupplierPaymentListSummary {
  totalAmount: number;
}

export interface SupplierPaymentListResponse {
  items: SupplierPayment[];
  meta: SupplierPaymentListMeta;
  summary: SupplierPaymentListSummary;
}

export interface ListSupplierPaymentsFilters {
  supplierId?: string;
  purchaseInvoiceId?: string;
  status?: "active" | "reversed" | "all";
  type?: "standalone" | "invoice" | "all";
  method?: PaymentMethod;
  period?: PaymentPeriod;
  date?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface RecordSupplierPaymentInput {
  supplierId: string;
  amount: number;
  method?: PaymentMethod;
  notes?: string;
}
