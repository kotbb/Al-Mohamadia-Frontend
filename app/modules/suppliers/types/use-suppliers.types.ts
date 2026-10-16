export type ListStatus = "idle" | "loading" | "success" | "error";

export type DebtFilter = "all" | "hasDebt";

export type SuppliersToastKind =
  "created" | "updated" | "activated" | "deactivated" | "deleted" | "merged";

export interface SuppliersToastState {
  kind: SuppliersToastKind;
  variant: "success" | "danger";
}

export type SuppliersConfirmKind = "deactivate" | "activate" | "delete" | null;
