export type ListStatus = "idle" | "loading" | "success" | "error";

export type DebtFilter = "all" | "hasDebt";

export type CustomersToastKind =
  "created" | "updated" | "activated" | "deactivated" | "deleted" | "merged";

export interface CustomersToastState {
  kind: CustomersToastKind;
  variant: "success" | "danger";
}

export type CustomersConfirmKind = "deactivate" | "activate" | "delete" | null;
