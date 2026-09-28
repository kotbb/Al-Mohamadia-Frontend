import { apiClient } from "@/lib/api/client";
import { getApiUrl } from "@/lib/api/env";
import type {
  CreateSalesInvoiceInput,
  ListSalesInvoicesFilters,
  PublicInvoice,
  SalesInvoice,
  SalesInvoiceListResponse,
  SalesInvoiceSharePayload,
  UpdateSalesInvoiceInput,
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

export async function updateSalesInvoice(
  id: string,
  input: UpdateSalesInvoiceInput,
): Promise<SalesInvoice> {
  return apiClient.patch<SalesInvoice>(`/sales-invoices/${id}`, input);
}

export async function cancelSalesInvoice(id: string): Promise<SalesInvoice> {
  return apiClient.post<SalesInvoice>(`/sales-invoices/${id}/cancel`);
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

export async function downloadInvoicePdf(
  elementId: string,
  invoiceNumber: string,
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  const element = document.getElementById(elementId);
  if (!element) return;
  await html2pdf()
    .set({
      margin: 0,
      filename: `فاتورة-${invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}
