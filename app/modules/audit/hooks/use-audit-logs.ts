"use client";

import type {
  ListStatus,
  UseAuditLogsOptions,
} from "../types/use-audit-logs.types";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import { listAuditLogs } from "@/app/modules/audit/services/audit.service";
import type { AuditLog } from "@/app/modules/audit/types/audit.types";
import { actionsForViewer } from "@/app/modules/audit/utils/audit-catalog";

const PAGE_SIZE = 10;

export function useAuditLogs({
  lockedEntityType,
  entityId,
  initialAction = "",
}: UseAuditLogsOptions = {}) {
  const describeError = useApiErrorMessage();
  const { isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [userId, setUserIdState] = useState("");
  const [action, setActionState] = useState(initialAction);
  const [entityType, setEntityTypeState] = useState(lockedEntityType ?? "");
  const [from, setFromState] = useState("");
  const [to, setToState] = useState("");

  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const dateOrderInvalid = Boolean(from && to && from > to);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetPage = useCallback(() => {
    setListStatus("loading");
    setListError(null);
    setPage(1);
  }, []);

  const goToPage = useCallback((next: number) => {
    setListStatus("loading");
    setListError(null);
    setPage(next);
  }, []);

  const setUserId = useCallback(
    (value: string) => {
      setUserIdState(value);
      resetPage();
    },
    [resetPage],
  );

  const setAction = useCallback(
    (value: string) => {
      setActionState(value);
      resetPage();
    },
    [resetPage],
  );

  const setEntityType = useCallback(
    (value: string) => {
      if (lockedEntityType) return;
      setEntityTypeState(value);
      setActionState((current) => {
        if (!current || !value) return current;
        return actionsForViewer(value, isSuperAdmin).includes(current)
          ? current
          : "";
      });
      resetPage();
    },
    [isSuperAdmin, lockedEntityType, resetPage],
  );

  const setFrom = useCallback(
    (value: string) => {
      setFromState(value);
      if (value && to && value > to) return;
      resetPage();
    },
    [resetPage, to],
  );

  const setTo = useCallback(
    (value: string) => {
      setToState(value);
      if (from && value && from > value) return;
      resetPage();
    },
    [from, resetPage],
  );

  const refresh = useCallback(() => {
    setListStatus("loading");
    setListError(null);
    setTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (dateOrderInvalid) return;

    const controller = new AbortController();

    listAuditLogs(
      {
        userId: userId || undefined,
        action: action || undefined,
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        setLogs(result.items);
        setTotal(result.meta.total);
        setListStatus("success");
        setListError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = describeError(err, "Failed to load audit logs");
        setListStatus("error");
        setListError(message);
      });

    return () => controller.abort();
  }, [
    userId,
    action,
    entityType,
    entityId,
    from,
    to,
    page,
    tick,
    dateOrderInvalid,
  ]);

  const hasActiveFilters = Boolean(
    userId ||
    action ||
    entityId ||
    (!lockedEntityType && entityType) ||
    from ||
    to,
  );

  return {
    logs,
    page,
    setPage: goToPage,
    totalPages,
    userId,
    setUserId,
    action,
    setAction,
    entityType,
    setEntityType,
    entityTypeLocked: Boolean(lockedEntityType),
    from,
    setFrom,
    to,
    setTo,
    dateOrderInvalid,
    listStatus,
    listError,
    refresh,
    hasActiveFilters,
  };
}
