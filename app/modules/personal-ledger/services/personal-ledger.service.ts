import { apiClient } from "@/lib/api/client";
import type { LedgerContact, LedgerContactDetail, LedgerContactFilters, LedgerContactList, LedgerMovement, LedgerMovementFilters, LedgerMovementInput, LedgerMovementList } from "../types/personal-ledger.types";

function ledgerQuery(resource: string, filters: object = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `/personal-ledger/${resource}${params.size ? `?${params}` : ""}`;
}

export function listPersonalLedgerContacts(filters: LedgerContactFilters = {}, signal?: AbortSignal) {
  return apiClient.get<LedgerContactList>(ledgerQuery("contacts", filters), { signal });
}
export function createPersonalLedgerContact(input: { name: string } | { customerId: string }) {
  return apiClient.post<LedgerContact>("/personal-ledger/contacts", input);
}
export function updatePersonalLedgerContact(id: string, input: { name: string }) {
  return apiClient.patch<LedgerContact>(`/personal-ledger/contacts/${id}`, input);
}
export function getPersonalLedgerContact(id: string, signal?: AbortSignal) {
  return apiClient.get<LedgerContactDetail>(`/personal-ledger/contacts/${id}`, { signal });
}
export function listPersonalLedgerMovements(filters: LedgerMovementFilters = {}, signal?: AbortSignal) {
  return apiClient.get<LedgerMovementList>(ledgerQuery("movements", filters), { signal });
}
export function getPersonalLedgerMovement(id: string, signal?: AbortSignal) {
  return apiClient.get<LedgerMovement>(`/personal-ledger/movements/${id}`, { signal });
}
export function createPersonalLedgerMovement(input: LedgerMovementInput) {
  return apiClient.post<LedgerMovement>("/personal-ledger/movements", input);
}
export function updatePersonalLedgerMovement(id: string, input: Partial<LedgerMovementInput>) {
  return apiClient.patch<LedgerMovement>(`/personal-ledger/movements/${id}`, input);
}
export function deletePersonalLedgerMovement(id: string) {
  return apiClient.delete<{ id: string }>(`/personal-ledger/movements/${id}`);
}