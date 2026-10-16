import type {
  PaymentMethod,
  PaymentPeriod,
} from "@/app/modules/payments/types/payments.types";

export type ListStatus = "idle" | "loading" | "success" | "error";

export type PaymentStatusFilterOption = "all" | "active" | "reversed";

export type PaymentMethodFilterOption = "all" | PaymentMethod;

export type PaymentPeriodFilterOption = "off" | "custom" | PaymentPeriod;

export interface PaymentsToastState {
  kind: "cancelled";
  variant: "success" | "danger";
}
