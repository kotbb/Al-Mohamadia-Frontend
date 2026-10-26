import type { PaymentMethod } from "@/app/modules/payments/types/payments.types";
import type { SalesInvoicePeriod } from "@/app/modules/invoices/types/invoices.types";

export type LedgerMovementType = "deposit" | "withdrawal";
export type LedgerPeriod = SalesInvoicePeriod | "all" | "custom";
export interface LedgerSummary { deposits: number; withdrawals: number; net: number; count: number; }
export interface LedgerMeta { page: number; limit: number; total: number; }
export interface LedgerContact {
  id: string; name: string; customerId: string | null; isActive: boolean;
  createdBy: string; updatedBy: string; createdAt: string; updatedAt: string;
}
export interface LedgerContactDetail extends LedgerContact { summary: LedgerSummary; }
export interface LedgerMovement {
  id: string; contactId: string; contactName: string; type: LedgerMovementType; amount: number;
  movementDate: string; method: PaymentMethod | null; notes: string | null;
  createdBy: string; updatedBy: string; createdAt: string; updatedAt: string;
}
export interface LedgerMovementInput {
  contactId: string; type: LedgerMovementType; amount: number; movementDate: string;
  method: PaymentMethod | null; notes: string | null;
}
export interface LedgerMovementList { items: LedgerMovement[]; meta: LedgerMeta; summary: LedgerSummary; }
export interface LedgerContactList { items: LedgerContact[]; meta: LedgerMeta; }
export interface LedgerMovementFilters { from?: string; to?: string; q?: string; contactId?: string; page?: number; limit?: number; }
export interface LedgerContactFilters { q?: string; includeInactive?: boolean; page?: number; limit?: number; }
export interface LedgerPersonOption { id: string; referenceId: string; source: "contact" | "customer"; name: string; isActive: boolean; }
export interface LedgerForm {
  person: LedgerPersonOption | null; type: LedgerMovementType; amount: string;
  movementDate: string; method: PaymentMethod | ""; notes: string;
}
export type LedgerFormError = "personRequired" | "invalidAmount" | "invalidDate" | "invalidType" | "invalidMethod" | "notesTooLong";
export interface LedgerResource<T> { data: T | null; loading: boolean; error: string | null; retry: () => void; }
export type LedgerMethod = PaymentMethod;
