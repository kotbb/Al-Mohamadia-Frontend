"use client";

import { useTranslations } from "next-intl";
import { AuditLogFilters } from "@/app/modules/audit/components/audit-log-filters";
import { AuditLogTable } from "@/app/modules/audit/components/audit-log-table";
import { useAuditLogs } from "@/app/modules/audit/hooks/use-audit-logs";
import { Button } from "@/app/modules/shared/components/button";

interface AuditLogPanelProps {
  lockedEntityType?: string;
  entityId?: string;
  initialAction?: string;
}

export function AuditLogPanel({
  lockedEntityType,
  entityId,
  initialAction,
}: AuditLogPanelProps) {
  const t = useTranslations("audit");
  const {
    logs,
    page,
    setPage,
    totalPages,
    userId,
    setUserId,
    action,
    setAction,
    entityType,
    setEntityType,
    entityTypeLocked,
    from,
    setFrom,
    to,
    setTo,
    dateOrderInvalid,
    listStatus,
    listError,
    refresh,
    hasActiveFilters,
  } = useAuditLogs({ lockedEntityType, entityId, initialAction });

  return (
    <div className="flex flex-col gap-5">
      <AuditLogFilters
        userId={userId}
        onUserIdChange={setUserId}
        action={action}
        onActionChange={setAction}
        entityType={entityType}
        onEntityTypeChange={setEntityType}
        entityTypeLocked={entityTypeLocked}
        from={from}
        onFromChange={setFrom}
        to={to}
        onToChange={setTo}
        dateOrderInvalid={dateOrderInvalid}
      />

      <AuditLogTable
        logs={dateOrderInvalid ? [] : logs}
        status={dateOrderInvalid ? "success" : listStatus}
        error={listError}
        hasActiveFilters={hasActiveFilters || dateOrderInvalid}
        onRetry={refresh}
      />

      {!dateOrderInvalid && listStatus === "success" && totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t("prevPage")}
          </Button>
          <span className="text-sm text-text-secondary">
            {t("pageOf", { page, totalPages })}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t("nextPage")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
