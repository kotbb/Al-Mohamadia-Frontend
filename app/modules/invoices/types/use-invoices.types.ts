import type {
  SalesInvoicePeriod,
  SalesInvoiceStatus,
} from "@/app/modules/invoices/types/invoices.types";

export type ListStatus = "idle" | "loading" | "success" | "error";

export type StatusFilter = "all" | SalesInvoiceStatus;

export type PeriodFilter = "off" | "custom" | SalesInvoicePeriod;

export type InvoicesToastKind = "cancelled" | "created" | "updated";

export interface InvoicesToastState {
  kind: InvoicesToastKind;
  variant: "success" | "danger";
}
