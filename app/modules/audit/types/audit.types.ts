export interface AuditActor {
  id: string;
  username: string | null;
}

export interface AuditChangeValue {
  old: unknown;
  new: unknown;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  user: AuditActor;
  action: string;
  entityType: string;
  entityId: string;
  summary: string | null;
  changes: Record<string, AuditChangeValue> | null;
  refCollection: string | null;
  refId: string | null;
}

export interface AuditLogListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  meta: AuditLogListMeta;
}

export interface ListAuditLogsFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
