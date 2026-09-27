"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-provider";
import { Input } from "@/app/modules/shared/components/input";
import {
  actionsForViewer,
  entityTypesForRole,
} from "@/app/modules/audit/utils/audit-catalog";

interface AuditLogFiltersProps {
  userId: string;
  onUserIdChange: (value: string) => void;
  action: string;
  onActionChange: (value: string) => void;
  entityType: string;
  onEntityTypeChange: (value: string) => void;
  entityTypeLocked: boolean;
  from: string;
  onFromChange: (value: string) => void;
  to: string;
  onToChange: (value: string) => void;
  dateOrderInvalid: boolean;
}

export function AuditLogFilters({
  userId,
  onUserIdChange,
  action,
  onActionChange,
  entityType,
  onEntityTypeChange,
  entityTypeLocked,
  from,
  onFromChange,
  to,
  onToChange,
  dateOrderInvalid,
}: AuditLogFiltersProps) {
  const t = useTranslations("audit");
  const { user, isSuperAdmin } = useAuth();
  const entityOptions = entityTypesForRole(isSuperAdmin);
  const actionOptions = actionsForViewer(entityType, isSuperAdmin);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
      <FilterSelect
        id="auditUserFilter"
        label={t("filterUser")}
        value={userId}
        onChange={onUserIdChange}
      >
        <option value="">{t("filterAll")}</option>
        {user ? (
          <option value={user.id}>
            {t("filterMe", { username: user.username })}
          </option>
        ) : null}
      </FilterSelect>

      <FilterSelect
        id="auditEntityFilter"
        label={t("filterEntity")}
        value={entityType}
        onChange={onEntityTypeChange}
        disabled={entityTypeLocked}
      >
        {entityTypeLocked ? null : <option value="">{t("filterAll")}</option>}
        {entityOptions.map((type) => (
          <option key={type} value={type}>
            {t(`entities.${type}`)}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        id="auditActionFilter"
        label={t("filterAction")}
        value={action}
        onChange={onActionChange}
      >
        <option value="">{t("filterAll")}</option>
        {actionOptions.map((code) => (
          <option key={code} value={code}>
            {t(`actions.${code}`)}
          </option>
        ))}
      </FilterSelect>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
        <div className="w-full sm:w-44">
          <Input
            name="auditFrom"
            type="date"
            label={t("filterFrom")}
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <Input
            name="auditTo"
            type="date"
            label={t("filterTo")}
            value={to}
            error={dateOrderInvalid ? t("dateOrderError") : null}
            onChange={(event) => onToChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5 lg:w-48">
      <label htmlFor={id} className="text-base font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="ds-focus-ring min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-surface px-3.5 pe-9 text-sm font-medium text-text-primary transition-colors hover:border-text-secondary focus:border-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-text-muted">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
