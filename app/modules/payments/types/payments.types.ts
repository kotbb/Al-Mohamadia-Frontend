export type PaymentMethod =
  | "cash"
  | "instapay"
  | "vodafone_cash"
  | "bank_transfer"
  | "check";

export type PaymentPeriod = "day" | "week" | "month" | "year";

export interface Payment {
  id: string;
  customerId: string | null;
  invoiceId: string | null;
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

export interface PaymentListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaymentListSummary {
  totalAmount: number;
}

export interface PaymentListResponse {
  items: Payment[];
  meta: PaymentListMeta;
  summary: PaymentListSummary;
}

export interface ListPaymentsFilters {
  customerId?: string;
  invoiceId?: string;
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

export interface RecordPaymentInput {
  customerId: string;
  amount: number;
  method?: PaymentMethod;
  notes?: string;
}
