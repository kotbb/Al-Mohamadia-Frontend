import { apiClient } from "@/lib/api/client";
import type {
  ListPaymentsFilters,
  Payment,
  PaymentListResponse,
  RecordPaymentInput,
} from "@/app/modules/payments/types/payments.types";

function buildPaymentsQuery(filters?: ListPaymentsFilters): string {
  if (!filters) return "/payments";
  const params = new URLSearchParams();
  if (filters.customerId) params.set("customerId", filters.customerId);
  if (filters.invoiceId) params.set("invoiceId", filters.invoiceId);
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
  return query ? `/payments?${query}` : "/payments";
}

export async function listPayments(
  filters?: ListPaymentsFilters,
  signal?: AbortSignal,
): Promise<PaymentListResponse> {
  return apiClient.get<PaymentListResponse>(buildPaymentsQuery(filters), {
    signal,
  });
}

export async function getPayment(
  id: string,
  signal?: AbortSignal,
): Promise<Payment> {
  return apiClient.get<Payment>(`/payments/${id}`, { signal });
}

export async function recordPayment(
  input: RecordPaymentInput,
): Promise<Payment> {
  return apiClient.post<Payment>("/payments", input);
}

export async function cancelPayment(id: string): Promise<Payment> {
  return apiClient.post<Payment>(`/payments/${id}/cancel`);
}
