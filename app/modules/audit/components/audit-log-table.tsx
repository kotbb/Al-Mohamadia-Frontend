"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AuditLog } from "@/app/modules/audit/types/audit.types";
import {
  AUDIT_FIELD_KEYS,
  AUDIT_LABEL_ACTIONS,
  AUDIT_LABEL_ENTITIES,
  auditActionTone,
} from "@/app/modules/audit/utils/audit-catalog";
import {
  formatAuditChangeValue,
  formatAuditTimestamp,
} from "@/app/modules/audit/utils/format-audit-value";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

interface AuditLogTableProps {
  logs: AuditLog[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  hasActiveFilters: boolean;
  onRetry: () => void;
}

function isChangePair(value: unknown): value is { old: unknown; new: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "old" in value &&
    "new" in value
  );
}

export function AuditLogTable({
  logs,
  status,
  error,
  hasActiveFilters,
  onRetry,
}: AuditLogTableProps) {
  const t = useTranslations("audit");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  if (status === "loading" || status === "idle") {
    return <LoadingState message={tShared("loading")} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        title={t("listError")}
        message={error ?? undefined}
        retryLabel={t("retry")}
        onRetry={onRetry}
      />
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
        description={
          hasActiveFilters ? t("emptyFilteredDescription") : t("emptyDescription")
        }
      />
    );
  }

  function actionLabel(action: string): string {
    return (AUDIT_LABEL_ACTIONS as readonly string[]).includes(action)
      ? t(`actions.${action}`)
      : action;
  }

  function entityLabel(entityType: string): string {
    return (AUDIT_LABEL_ENTITIES as readonly string[]).includes(entityType)
      ? t(`entities.${entityType}`)
      : entityType;
  }

  function fieldLabel(field: string): string {
    return (AUDIT_FIELD_KEYS as readonly string[]).includes(field)
      ? t(`fields.${field}`)
      : field;
  }

  return (
    <div className="overflow-x-auto rounded-shell border border-border bg-surface">
      <table className="w-full min-w-[48rem] border-collapse text-sm lg:text-base">
        <thead className="bg-surface-muted">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colTime")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colUser")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colAction")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colEntity")}
            </th>
            <th className="px-4 py-3 text-start font-medium text-text-secondary">
              {t("colDetails")}
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const changeEntries = Object.entries(log.changes ?? {}).filter(
              (entry): entry is [string, { old: unknown; new: unknown }] =>
                isChangePair(entry[1]),
            );
            const hasChanges = changeEntries.length > 0;
            const isOpen = openId === log.id;
            const summary = log.summary?.trim() ? log.summary : t("emptyValue");

            return (
              <LogRows
                key={log.id}
                log={log}
                summary={summary}
                hasChanges={hasChanges}
                isOpen={isOpen}
                changeEntries={changeEntries}
                locale={locale}
                emptyLabel={t("emptyValue")}
                actionText={actionLabel(log.action)}
                entityText={entityLabel(log.entityType)}
                userText={log.user.username ?? t("unknownUser")}
                timeText={formatAuditTimestamp(log.createdAt, locale)}
                changesLabel={t("showChanges")}
                hideChangesLabel={t("hideChanges")}
                fieldLabel={fieldLabel}
                onToggle={() =>
                  setOpenId((current) => (current === log.id ? null : log.id))
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LogRows({
  log,
  summary,
  hasChanges,
  isOpen,
  changeEntries,
  locale,
  emptyLabel,
  actionText,
  entityText,
  userText,
  timeText,
  changesLabel,
  hideChangesLabel,
  fieldLabel,
  onToggle,
}: {
  log: AuditLog;
  summary: string;
  hasChanges: boolean;
  isOpen: boolean;
  changeEntries: [string, { old: unknown; new: unknown }][];
  locale: string;
  emptyLabel: string;
  actionText: string;
  entityText: string;
  userText: string;
  timeText: string;
  changesLabel: string;
  hideChangesLabel: string;
  fieldLabel: (field: string) => string;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-muted/50">
        <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
          {timeText}
        </td>
        <td className="px-4 py-3 text-text-primary">{userText}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <Badge variant={auditActionTone(log.action)}>{actionText}</Badge>
        </td>
        <td className="px-4 py-3 text-text-primary">{entityText}</td>
        <td className="max-w-[22rem] px-4 py-3 text-text-secondary">
          <div className="flex flex-col items-start gap-1">
            <span className="break-words">{summary}</span>
            {hasChanges ? (
              <button
                type="button"
                className="ds-focus-ring rounded text-sm font-medium text-primary hover:underline"
                aria-expanded={isOpen}
                onClick={onToggle}
              >
                {isOpen ? hideChangesLabel : changesLabel}
              </button>
            ) : null}
          </div>
        </td>
      </tr>
      {isOpen && hasChanges ? (
        <tr className="border-b border-border bg-surface-muted/40">
          <td colSpan={5} className="px-4 py-3">
            <dl className="flex flex-col gap-2">
              {changeEntries.map(([field, change]) => (
                <div
                  key={`${log.id}-${field}`}
                  className="flex flex-wrap items-baseline gap-x-2 text-sm"
                >
                  <dt className="font-medium text-text-primary">
                    {fieldLabel(field)}
                  </dt>
                  <dd className="text-text-secondary">
                    <bdi>
                      {formatAuditChangeValue(field, change.old, locale, emptyLabel)}
                    </bdi>
                    <span
                      dir="ltr"
                      className="inline-block px-1.5 text-text-muted"
                      aria-hidden
                    >
                      {locale === "ar" ? "←" : "→"}
                    </span>
                    <bdi>
                      {formatAuditChangeValue(field, change.new, locale, emptyLabel)}
                    </bdi>
                  </dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      ) : null}
    </>
  );
}
