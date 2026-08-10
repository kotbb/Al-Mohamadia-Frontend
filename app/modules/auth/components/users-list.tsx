"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AuthUser } from "@/lib/auth/types";
import { Button } from "@/app/modules/shared/components/button";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

interface UsersListProps {
  users: AuthUser[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  onRetry: () => void;
  togglingId: string | null;
  toggleError: string | null;
  onToggleActive: (user: AuthUser) => Promise<void>;
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
  togglingId,
  toggleError,
  onToggleActive,
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

  return (
    <div className="flex flex-col gap-3">
      {toggleError ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {toggleError}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[56rem] border-collapse text-base">
          <thead className="bg-surface-muted">
            <tr className="border-b border-border">
              <th className="w-[16%] px-4 py-3 text-start align-middle font-semibold text-text-primary">
                {t("colUsername")}
              </th>
              <th className="w-[14%] px-4 py-3 text-start align-middle font-semibold text-text-primary">
                {t("colRole")}
              </th>
              <th className="w-[12%] px-4 py-3 text-start align-middle font-semibold text-text-primary">
                {t("colStatus")}
              </th>
              <th className="w-[20%] px-4 py-3 text-start align-middle font-semibold text-text-primary">
                {t("colCreated")}
              </th>
              <th className="w-[20%] px-4 py-3 text-start align-middle font-semibold text-text-primary">
                {t("colModified")}
              </th>
              <th className="w-[18%] px-4 py-3 text-center align-middle font-semibold text-text-primary">
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-4 py-3 text-start align-middle text-text-primary">
                  {user.username}
                </td>
                <td className="px-4 py-3 text-start align-middle text-text-muted">
                  {user.role === "super_admin"
                    ? t("roleSuperAdmin")
                    : t("roleAdmin")}
                </td>
                <td className="px-4 py-3 text-start align-middle">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-sm font-medium ${
                      user.isActive
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {user.isActive ? t("statusActive") : t("statusInactive")}
                  </span>
                </td>
                <td className="px-4 py-3 text-start align-middle whitespace-nowrap text-text-muted">
                  {formatDate(user.createdAt, locale, atLabel)}
                </td>
                <td className="px-4 py-3 text-start align-middle whitespace-nowrap text-text-muted">
                  {formatDate(user.updatedAt, locale, atLabel)}
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  {user.role === "super_admin" ? (
                    <span className="inline-block text-sm text-text-muted">
                      {t("noAction")}
                    </span>
                  ) : (
                    <Button
                      variant={user.isActive ? "danger" : "success"}
                      className="min-h-9 px-3 text-sm"
                      disabled={togglingId === user.id}
                      onClick={() => void onToggleActive(user)}
                    >
                      {togglingId === user.id
                        ? t("updating")
                        : user.isActive
                          ? t("deactivate")
                          : t("activate")}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
