import { apiClient } from "@/lib/api/client";
import type { AuditActor } from "@/app/modules/audit/types/audit.types";
import type {
  AuditLogListResponse,
  ListAuditLogsFilters,
} from "@/app/modules/audit/types/audit.types";

function buildAuditLogsQuery(filters?: ListAuditLogsFilters): string {
  if (!filters) return "/audit-logs";
  const params = new URLSearchParams();
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.action) params.set("action", filters.action);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.entityId) params.set("entityId", filters.entityId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `/audit-logs?${query}` : "/audit-logs";
}

export async function listAuditLogs(
  filters?: ListAuditLogsFilters,
  signal?: AbortSignal,
): Promise<AuditLogListResponse> {
  return apiClient.get<AuditLogListResponse>(buildAuditLogsQuery(filters), {
    signal,
  });
}

export async function listAuditActors(
  signal?: AbortSignal,
): Promise<AuditActor[]> {
  return apiClient.get<AuditActor[]>("/audit-logs/actors", { signal });
}
