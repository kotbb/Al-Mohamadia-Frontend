import { apiClient } from "@/lib/api/client";
import type {
  CreatePurchaseInvoiceInput,
  ListPurchasesFilters,
  PurchaseInvoice,
  PurchaseInvoiceDetail,
  PurchaseInvoiceListResponse,
  UpdatePurchaseInvoiceInput,
} from "@/app/modules/purchases/types/purchases.types";

function buildPurchasesQuery(filters?: ListPurchasesFilters): string {
  if (!filters) return "/purchases";
  const params = new URLSearchParams();
  if (filters.supplierId) params.set("supplierId", filters.supplierId);
  if (filters.status) params.set("status", filters.status);
  if (filters.period && filters.date) {
    params.set("period", filters.period);
    params.set("date", filters.date);
  }
  if (filters.from && filters.to) {
    params.set("from", filters.from);
    params.set("to", filters.to);
  }
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/purchases?${query}` : "/purchases";
}

export async function listPurchases(
  filters?: ListPurchasesFilters,
  signal?: AbortSignal,
): Promise<PurchaseInvoiceListResponse> {
  return apiClient.get<PurchaseInvoiceListResponse>(
    buildPurchasesQuery(filters),
    { signal },
  );
}

export async function getPurchase(
  id: string,
  signal?: AbortSignal,
): Promise<PurchaseInvoiceDetail> {
  return apiClient.get<PurchaseInvoiceDetail>(`/purchases/${id}`, { signal });
}

export async function createPurchase(
  input: CreatePurchaseInvoiceInput,
): Promise<PurchaseInvoice> {
  return apiClient.post<PurchaseInvoice>("/purchases", input);
}

export async function updatePurchase(id: string, input: UpdatePurchaseInvoiceInput): Promise<PurchaseInvoice> {
  return apiClient.patch<PurchaseInvoice>(`/purchases/${id}`, input);
}

export async function cancelPurchase(id: string): Promise<PurchaseInvoice> {
  return apiClient.post<PurchaseInvoice>(`/purchases/${id}/cancel`);
}
