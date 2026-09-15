import { apiClient } from "@/lib/api/client";
import type {
  CreateSalesInvoiceInput,
  ListSalesInvoicesFilters,
  SalesInvoice,
  SalesInvoiceListResponse,
  SalesInvoiceSharePayload,
} from "@/app/modules/invoices/types/invoices.types";

function buildListQuery(filters?: ListSalesInvoicesFilters): string {
  if (!filters) return "/sales-invoices";
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.period) {
    params.set("period", filters.period);
    if (filters.date) params.set("date", filters.date);
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
): Promise<SalesInvoice> {
  return apiClient.get<SalesInvoice>(`/sales-invoices/${id}`, { signal });
}

export async function createSalesInvoice(
  input: CreateSalesInvoiceInput,
): Promise<SalesInvoice> {
  return apiClient.post<SalesInvoice>("/sales-invoices", input);
}

export async function cancelSalesInvoice(id: string): Promise<SalesInvoice> {
  return apiClient.post<SalesInvoice>(`/sales-invoices/${id}/cancel`);
}

export async function getSalesInvoicePdfBlob(
  id: string,
  signal?: AbortSignal,
): Promise<Blob> {
  return apiClient.getBlob(`/sales-invoices/${id}/pdf`, { signal });
}

export async function getSalesInvoiceShare(
  id: string,
  signal?: AbortSignal,
): Promise<SalesInvoiceSharePayload> {
  return apiClient.get<SalesInvoiceSharePayload>(
    `/sales-invoices/${id}/share`,
    { signal },
  );
}

export function openPdfBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
