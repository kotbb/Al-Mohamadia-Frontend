import { apiClient } from "@/lib/api/client";
import type { ExportCatalog, ExportLookupOption, ExportPreview, ExportRequest } from "../types/exports.types";

export const getExportCatalog = (signal?: AbortSignal) => apiClient.get<ExportCatalog>("/exports/catalog", { signal });
export const previewExport = (request: ExportRequest, signal?: AbortSignal) =>
  apiClient.post<ExportPreview>("/exports/preview", request, { signal });
export const downloadExport = (request: ExportRequest, signal?: AbortSignal) =>
  apiClient.postBlob("/exports/excel", request, { signal });

/** Bounded account lookups: never load an entire contact directory for a filter. */
export async function searchExportAccounts(kind: "customers" | "suppliers", q: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ q, limit: "20" });
  return (await apiClient.get<{ items: ExportLookupOption[] }>(`/${kind}?${query}`, { signal })).items;
}
export const getExportCategories = (signal?: AbortSignal) =>
  apiClient.get<ExportLookupOption[]>("/categories", { signal });
export async function getExportAccount(kind: "customers" | "suppliers", id: string, signal?: AbortSignal) {
  return apiClient.get<ExportLookupOption>(`/${kind}/${encodeURIComponent(id)}`, { signal });
}

export async function searchExportReferences(
  field: string,
  q: string,
  signal?: AbortSignal,
): Promise<ExportLookupOption[]> {
  if (field === "customerId" || field === "supplierId")
    return searchExportAccounts(field === "customerId" ? "customers" : "suppliers", q, signal);
  if (field === "categoryId")
    return (await getExportCategories(signal)).filter((row) =>
      row.name.toLocaleLowerCase().includes(q.toLocaleLowerCase()),
    );
  const route = field === "invoiceId" ? "sales-invoices" : "purchases";
  const result = await apiClient.get<{ items: { id: string; invoiceNumber: string }[] }>(
    `/${route}?${new URLSearchParams({ q, limit: "20" })}`,
    { signal },
  );
  return result.items.map((row) => ({ id: row.id, name: row.invoiceNumber }));
}
export async function getExportReference(field: string, id: string, signal?: AbortSignal): Promise<ExportLookupOption> {
  if (field === "customerId" || field === "supplierId")
    return getExportAccount(field === "customerId" ? "customers" : "suppliers", id, signal);
  if (field === "categoryId")
    return (await getExportCategories(signal)).find((row) => row.id === id) ?? { id, name: "" };
  const row = await apiClient.get<{ id: string; invoiceNumber: string }>(
    `/${field === "invoiceId" ? "sales-invoices" : "purchases"}/${encodeURIComponent(id)}`,
    { signal },
  );
  return { id: row.id, name: row.invoiceNumber };
}
