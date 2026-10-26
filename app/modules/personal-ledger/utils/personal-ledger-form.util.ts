import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { getPeriodRangeInfo } from "@/app/modules/invoices/utils/period-range.util";
import type { LedgerForm, LedgerFormError, LedgerMethod, LedgerMovement, LedgerMovementInput, LedgerPeriod } from "../types/personal-ledger.types";

export const ledgerMethods: LedgerMethod[] = ["cash", "instapay", "vodafone_cash", "bank_transfer", "check"];

export function makeLedgerForm(movement?: LedgerMovement, today = todayIsoDate()): LedgerForm {
  return {
    person: movement ? { id: `contact:${movement.contactId}`, referenceId: movement.contactId, source: "contact", name: movement.contactName, isActive: true } : null,
    type: movement?.type ?? "withdrawal", amount: movement ? String(movement.amount) : "",
    movementDate: movement?.movementDate ?? today, method: movement?.method ?? "", notes: movement?.notes ?? "",
  };
}

export function validateLedgerForm(form: LedgerForm, today = todayIsoDate()): LedgerFormError | null {
  if (!form.person) return "personRequired";
  if (form.type !== "deposit" && form.type !== "withdrawal") return "invalidType";
  const amount = Number(form.amount);
  if (!form.amount.trim() || !Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) / 100 !== amount) return "invalidAmount";
  const date = new Date(`${form.movementDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.movementDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== form.movementDate || form.movementDate > today) return "invalidDate";
  if (form.method && !ledgerMethods.includes(form.method)) return "invalidMethod";
  if (form.notes.length > 500) return "notesTooLong";
  return null;
}

export function ledgerMovementInput(form: LedgerForm, contactId: string): LedgerMovementInput {
  return { contactId, type: form.type, amount: Number(form.amount), movementDate: form.movementDate,
    method: form.method || null, notes: form.notes.trim() || null };
}

export function ledgerDateBounds(period: LedgerPeriod, date: string, custom: { from: string; to: string }): { from?: string; to?: string } {
  if (period === "all") return {};
  if (period === "custom") return custom;
  const range = getPeriodRangeInfo(period, date, "en");
  return { from: range.fromIso, to: range.toIso };
}

export function ledgerMethodLabel(method: LedgerMethod | null, labels: Record<LedgerMethod, string>): string {
  return method ? labels[method] : "";
}

export function formatLedgerDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : locale, {
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
