"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AuthUser } from "@/lib/auth/types";
import { getDisplayName } from "@/lib/user/get-initials";
import { Badge } from "@/app/modules/shared/components/badge";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import {
  RowActionsMenu,
  type RowActionItem,
} from "@/app/modules/shared/components/row-actions-menu";

interface UsersListProps {
  users: AuthUser[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  onEdit: (user: AuthUser) => void;
  onDeactivate: (user: AuthUser) => void;
  onActivate: (user: AuthUser) => void;
  onDelete: (user: AuthUser) => void;
}

function StatusIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M5.5 8 7 9.5 10.5 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 5.5 10.5 10.5M10.5 5.5 5.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatDate(value: string | undefined, locale: string, atLabel: string): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    const datePart = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(date);
    const timePart = new Intl.DateTimeFormat(locale, {
      timeStyle: "short",
    }).format(date);
    return `${datePart} ${atLabel} ${timePart}`;
  } catch {
    return value;
  }
}

export function UsersList({
  users,
  status,
  error,
  onRetry,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: UsersListProps) {
  const t = useTranslations("users");
  const tShared = useTranslations("shared");
  const locale = useLocale();
  const atLabel = t("dateAt");

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

  if (users.length === 0) {
    return (
      <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  const cell = "px-4 py-3.5";

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-white dark:bg-surface">
      <table className="w-full min-w-[48rem] table-fixed border-collapse text-sm lg:text-[0.9375rem]">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[17%]" />
          <col className="w-[17%]" />
          <col className="w-[9%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className={`${cell} text-start font-medium text-text-secondary`}>
              {t("colName")}
            </th>
            <th className={`${cell} text-start font-medium text-text-secondary`}>
              {t("colUsername")}
            </th>
            <th className={`${cell} text-start font-medium text-text-secondary`}>
              {t("colRole")}
            </th>
            <th className={`${cell} text-start font-medium text-text-secondary`}>
              {t("colStatus")}
            </th>
            <th className={`${cell} text-start font-medium text-text-secondary`}>
              {t("colCreated")}
            </th>
            <th className={`${cell} text-start font-medium text-text-secondary`}>
              {t("colModified")}
            </th>
            <th className={`${cell} text-center font-medium text-text-secondary`}>
              {t("colActions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const actions: RowActionItem[] =
              user.role === "super_admin"
                ? []
                : [
                    {
                      id: "edit",
                      label: t("edit"),
                      onSelect: () => onEdit(user),
                    },
                    user.isActive
                      ? {
                          id: "deactivate",
                          label: t("deactivate"),
                          onSelect: () => onDeactivate(user),
                          tone: "danger",
                        }
                      : {
                          id: "activate",
                          label: t("activate"),
                          onSelect: () => onActivate(user),
                        },
                    {
                      id: "delete",
                      label: t("delete"),
                      onSelect: () => onDelete(user),
                      tone: "danger",
                    },
                  ];

            return (
              <tr
                key={user.id}
                className="border-b border-border last:border-b-0"
              >
                <td className={`${cell} truncate font-medium text-text-primary`}>
                  {getDisplayName(user.firstName, user.lastName, user.username)}
                </td>
                <td className={`${cell} truncate text-text-secondary`}>
                  {user.username}
                </td>
                <td className={`${cell} text-text-secondary`}>
                  {user.role === "super_admin"
                    ? t("roleSuperAdmin")
                    : t("roleAdmin")}
                </td>
                <td className={cell}>
                  <Badge variant={user.isActive ? "success" : "danger"}>
                    {user.isActive ? (
                      <>
                        <StatusIcon active />
                        {t("statusActive")}
                      </>
                    ) : (
                      <>
                        <StatusIcon active={false} />
                        {t("statusInactive")}
                      </>
                    )}
                  </Badge>
                </td>
                <td className={`${cell} whitespace-nowrap text-text-muted`}>
                  {formatDate(user.createdAt, locale, atLabel)}
                </td>
                <td className={`${cell} whitespace-nowrap text-text-muted`}>
                  {formatDate(user.updatedAt, locale, atLabel)}
                </td>
                <td className={`${cell} text-center`}>
                  {actions.length === 0 ? (
                    <span className="text-sm text-text-muted">{t("noAction")}</span>
                  ) : (
                    <RowActionsMenu label={t("colActions")} items={actions} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
