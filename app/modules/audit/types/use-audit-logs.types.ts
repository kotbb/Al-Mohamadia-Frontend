export type ListStatus = "idle" | "loading" | "success" | "error";

export interface UseAuditLogsOptions {
  lockedEntityType?: string;
  entityId?: string;
  initialAction?: string;
}
