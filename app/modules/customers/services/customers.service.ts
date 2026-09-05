import { apiClient } from "@/lib/api/client";
import type {
  CreateCustomerInput,
  Customer,
  CustomerListResponse,
  ListCustomersFilters,
  MergeCustomersInput,
  UpdateCustomerInput,
} from "@/app/modules/customers/types/customers.types";

function buildCustomersQuery(filters?: ListCustomersFilters): string {
  if (!filters) return "/customers";
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.hasDebt === true) params.set("hasDebt", "true");
  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/customers?${query}` : "/customers";
}

export async function listCustomers(
  filters?: ListCustomersFilters,
  signal?: AbortSignal,
): Promise<CustomerListResponse> {
  return apiClient.get<CustomerListResponse>(buildCustomersQuery(filters), {
    signal,
  });
}

export async function getCustomer(
  id: string,
  signal?: AbortSignal,
): Promise<Customer> {
  return apiClient.get<Customer>(`/customers/${id}`, { signal });
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  return apiClient.post<Customer>("/customers", input);
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<Customer> {
  return apiClient.patch<Customer>(`/customers/${id}`, input);
}

export async function deleteCustomer(id: string): Promise<Customer> {
  return apiClient.delete<Customer>(`/customers/${id}`);
}

export async function mergeCustomers(
  input: MergeCustomersInput,
): Promise<Customer> {
  return apiClient.post<Customer>("/customers/merge", input);
}
