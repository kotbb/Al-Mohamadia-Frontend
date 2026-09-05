import { apiClient } from "@/lib/api/client";
import type {
  CreateSupplierInput,
  ListSuppliersFilters,
  MergeSuppliersInput,
  Supplier,
  SupplierListResponse,
  UpdateSupplierInput,
} from "@/app/modules/suppliers/types/suppliers.types";

function buildSuppliersQuery(filters?: ListSuppliersFilters): string {
  if (!filters) return "/suppliers";
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.hasDebt === true) params.set("hasDebt", "true");
  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/suppliers?${query}` : "/suppliers";
}

export async function listSuppliers(
  filters?: ListSuppliersFilters,
  signal?: AbortSignal,
): Promise<SupplierListResponse> {
  return apiClient.get<SupplierListResponse>(buildSuppliersQuery(filters), {
    signal,
  });
}

export async function getSupplier(
  id: string,
  signal?: AbortSignal,
): Promise<Supplier> {
  return apiClient.get<Supplier>(`/suppliers/${id}`, { signal });
}

export async function createSupplier(
  input: CreateSupplierInput,
): Promise<Supplier> {
  return apiClient.post<Supplier>("/suppliers", input);
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  return apiClient.patch<Supplier>(`/suppliers/${id}`, input);
}

export async function deleteSupplier(id: string): Promise<Supplier> {
  return apiClient.delete<Supplier>(`/suppliers/${id}`);
}

export async function mergeSuppliers(
  input: MergeSuppliersInput,
): Promise<Supplier> {
  return apiClient.post<Supplier>("/suppliers/merge", input);
}
