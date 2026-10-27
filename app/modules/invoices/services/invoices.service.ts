import type { InvoiceNeighbors } from "../types/invoices.types";
import { apiClient } from "@/lib/api/client";
import { getApiUrl } from "@/lib/api/env";
import type {
  CreateSalesInvoiceInput,
  ListSalesInvoicesFilters,
  PublicInvoice,
  SalesInvoice,
  SalesInvoiceDetail,
  SalesInvoiceListResponse,
  SalesInvoiceSharePayload,
  UpdateSalesInvoiceInput,
} from "@/app/modules/invoices/types/invoices.types";

function buildListQuery(filters?: ListSalesInvoicesFilters): string {
  if (!filters) return "/sales-invoices";
  const params = new URLSearchParams();
  if (filters.customerId) params.set("customerId", filters.customerId);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.period) {
    params.set("period", filters.period);
    if (filters.date) params.set("date", filters.date);
  }
  if (filters.from && filters.to) {
    params.set("from", filters.from);
    params.set("to", filters.to);
  }
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/sales-invoices?${query}` : "/sales-invoices";
}

export async function listSalesInvoices(
  filters?: ListSalesInvoicesFilters,
  signal?: AbortSignal,
): Promise<SalesInvoiceListResponse> {
  return apiClient.get<SalesInvoiceListResponse>(buildListQuery(filters), {
    signal,
  });
}

export async function getSalesInvoice(
  id: string,
  signal?: AbortSignal,
): Promise<SalesInvoiceDetail> {
  return apiClient.get<SalesInvoiceDetail>(`/sales-invoices/${id}`, { signal });
}

export async function createSalesInvoice(
  input: CreateSalesInvoiceInput,
): Promise<SalesInvoice> {
  return apiClient.post<SalesInvoice>("/sales-invoices", input);
}

export async function updateSalesInvoice(
  id: string,
  input: UpdateSalesInvoiceInput,
): Promise<SalesInvoice> {
  return apiClient.patch<SalesInvoice>(`/sales-invoices/${id}`, input);
}

export async function cancelSalesInvoice(id: string): Promise<SalesInvoice> {
  return apiClient.post<SalesInvoice>(`/sales-invoices/${id}/cancel`);
}

export async function getInvoiceReceipt(
  id: string,
  signal?: AbortSignal,
): Promise<PublicInvoice> {
  return apiClient.get<PublicInvoice>(`/sales-invoices/${id}/receipt`, {
    signal,
  });
}

export async function getInvoiceNeighbors(
  id: string,
  signal?: AbortSignal,
): Promise<InvoiceNeighbors> {
  return apiClient.get<InvoiceNeighbors>(`/sales-invoices/${id}/neighbors`, {
    signal,
  });
}

export async function getSalesInvoiceShare(
  id: string,
): Promise<SalesInvoiceSharePayload> {
  return apiClient.get<SalesInvoiceSharePayload>(`/sales-invoices/${id}/share`);
}

export async function getPublicInvoice(
  token: string,
  signal?: AbortSignal,
): Promise<PublicInvoice> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/public/sales-invoices/${token}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load invoice (${res.status})`);
  }
  // Backend wraps JSON in { success, data } envelope
  const body = (await res.json()) as { data?: PublicInvoice } | PublicInvoice;
  if ("data" in body && body.data) return body.data;
  return body as PublicInvoice;
}
