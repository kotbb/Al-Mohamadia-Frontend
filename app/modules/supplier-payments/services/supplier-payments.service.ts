import { apiClient } from "@/lib/api/client";
import type {
  ListSupplierPaymentsFilters,
  SupplierPayment,
  SupplierPaymentListResponse,
  RecordSupplierPaymentInput,
} from "@/app/modules/supplier-payments/types/supplier-payments.types";

function buildSupplierPaymentsQuery(filters?: ListSupplierPaymentsFilters): string {
  if (!filters) return "/supplier-payments";
  const params = new URLSearchParams();
  if (filters.supplierId) params.set("supplierId", filters.supplierId);
  if (filters.purchaseInvoiceId) params.set("purchaseInvoiceId", filters.purchaseInvoiceId);
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.method) params.set("method", filters.method);
  if (filters.period) {
    params.set("period", filters.period);
    if (filters.date) params.set("date", filters.date);
  }
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/supplier-payments?${query}` : "/supplier-payments";
}

export async function listSupplierPayments(
  filters?: ListSupplierPaymentsFilters,
  signal?: AbortSignal,
): Promise<SupplierPaymentListResponse> {
  return apiClient.get<SupplierPaymentListResponse>(buildSupplierPaymentsQuery(filters), {
    signal,
  });
}

export async function getSupplierPayment(
  id: string,
  signal?: AbortSignal,
): Promise<SupplierPayment> {
  return apiClient.get<SupplierPayment>(`/supplier-payments/${id}`, { signal });
}

export async function recordSupplierPayment(
  input: RecordSupplierPaymentInput,
): Promise<SupplierPayment> {
  return apiClient.post<SupplierPayment>("/supplier-payments", input);
}

export async function cancelSupplierPayment(id: string): Promise<SupplierPayment> {
  return apiClient.post<SupplierPayment>(`/supplier-payments/${id}/cancel`);
}
