"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AuditLog } from "@/app/modules/audit/types/audit.types";
import {
  AUDIT_FIELD_KEYS,
  AUDIT_LABEL_ACTIONS,
  AUDIT_LABEL_ENTITIES,
  AUDIT_VALUE_CODES_BY_FIELD,
  auditActionTone,
} from "@/app/modules/audit/utils/audit-catalog";
import {
  describeAuditSummary,
  formatAuditChangeValue,
  formatAuditSummary,
  formatAuditTimestamp,
  isHiddenAuditField,
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

  const valueLabels = {
    value(field: string, code: string): string | null {
      if (code === "true" || code === "false") return t(`values.${code}`);
      return AUDIT_VALUE_CODES_BY_FIELD[field]?.includes(code)
        ? t(`values.${code}`)
        : null;
    },
    dimension: (field: "thickness" | "width" | "length") => fieldLabel(field),
  };

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
            const changeEntries = Object.entries(log.changes ?? {}).flatMap(
              (entry) => {
                if (!isChangePair(entry[1]) || isHiddenAuditField(entry[0])) {
                  return [];
                }
                const oldText = formatAuditChangeValue(
                  entry[0],
                  entry[1].old,
                  locale,
                  "",
                  valueLabels,
                );
                const newText = formatAuditChangeValue(
                  entry[0],
                  entry[1].new,
                  locale,
                  t("emptyValue"),
                  valueLabels,
                );
                const oldShown = oldText ?? "";
                const newShown = newText ?? t("emptyValue");
                if (oldShown === "" && newShown === t("emptyValue")) {
                  return [];
                }
                return [[entry[0], oldShown, newShown] as const];
              },
            );
            const hasChanges = changeEntries.length > 0;
            const isOpen = openId === log.id;
            const description = describeAuditSummary(log, actionLabel(log.action), fieldLabel);
            const summary = description
              ? t(description.key, description.values)
              : log.summary?.trim()
                ? formatAuditSummary(log.summary)
                : t("emptyValue");

            return (
              <LogRows
                key={log.id}
                log={log}
                summary={summary}
                hasChanges={hasChanges}
                isOpen={isOpen}
                changeEntries={changeEntries}
                changeColumnLabels={[t("colField"), t("colBefore"), t("colAfter")]}
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
  changeColumnLabels,
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
  changeEntries: readonly (readonly [string, string, string])[];
  changeColumnLabels: readonly [string, string, string];
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
        <td className="px-4 py-3 font-medium text-text-primary">{userText}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <Badge variant={auditActionTone(log.action)}>{actionText}</Badge>
        </td>
        <td className="px-4 py-3 font-medium text-text-primary">{entityText}</td>
        <td className="max-w-[22rem] px-4 py-3 text-text-secondary">
          <div className="flex flex-col items-start gap-1">
            <span className="break-words">{summary}</span>
            {hasChanges ? (
              <button
                type="button"
                className="ds-focus-ring mt-1 inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-sm text-primary hover:bg-primary/15"
                aria-expanded={isOpen}
                aria-controls={`audit-changes-${log.id}`}
                onClick={onToggle}
              >
                <span className="font-bold">
                  {isOpen ? hideChangesLabel : changesLabel}
                </span>
              </button>
            ) : null}
          </div>
        </td>
      </tr>
      {isOpen && hasChanges ? (
        <tr className="border-b border-border bg-surface-muted/40">
          <td id={`audit-changes-${log.id}`} colSpan={5} className="px-4 py-3">
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[32rem] border-collapse text-sm">
                <thead className="bg-surface-muted">
                  <tr className="border-b border-border">
                    {changeColumnLabels.map((label) => (
                      <th key={label} scope="col" className="px-4 py-3 text-start font-medium text-text-secondary">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {changeEntries.map(([field, oldText, newText]) => (
                    <tr key={`${log.id}-${field}`} className="border-b border-border last:border-b-0">
                      <th scope="row" className="px-4 py-2 text-start font-medium text-text-secondary">
                        {fieldLabel(field)}
                      </th>
                      <td className="max-w-64 whitespace-pre-wrap break-words px-4 py-2 text-text-secondary"><bdi>{oldText}</bdi></td>
                      <td className="max-w-64 whitespace-pre-wrap break-words px-4 py-2 text-text-primary"><bdi>{newText}</bdi></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
