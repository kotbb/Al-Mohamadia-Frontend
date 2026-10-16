import type { PurchaseInvoiceStatus } from "@/app/modules/purchases/types/purchases.types";

export type ListStatus = "idle" | "loading" | "success" | "error";

export type PurchaseStatusFilterOption = "all" | PurchaseInvoiceStatus;

export type PurchasePeriodFilterOption =
  "off" | "day" | "week" | "month" | "year" | "custom";

export interface PurchasesToastState {
  kind: "cancelled" | "created";
  variant: "success" | "danger";
}

export interface UsePurchasesOptions {
  supplierId?: string;
  pageSize?: number;
}
