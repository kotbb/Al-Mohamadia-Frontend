"use client";

import { useCallback, useDeferredValue, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { deletePersonalLedgerMovement, listPersonalLedgerMovements } from "../services/personal-ledger.service";
import type { LedgerMovement } from "../types/personal-ledger.types";
import type { LedgerFiltersState } from "../types/use-personal-ledger.types";
import { ledgerDateBounds } from "../utils/personal-ledger-form.util";
import { usePersonalLedgerResource } from "./use-personal-ledger-resource";

export function usePersonalLedger() {
  const t = useTranslations("personalLedger");
  const errorMessage = useApiErrorMessage();
  const [filters, setFilters] = useState<LedgerFiltersState>(() => ({ q: "", period: "all", date: todayIsoDate(), custom: ledgerDateBounds("month", todayIsoDate(), { from: "", to: "" }) as { from: string; to: string }, page: 1 }));
  const q = useDeferredValue(filters.q);
  const { from, to } = ledgerDateBounds(filters.period, filters.date, filters.custom);
  const load = useCallback(async (signal: AbortSignal) => {
    const result = await listPersonalLedgerMovements({ from, to, q, page: filters.page }, signal);
    const lastPage = Math.max(1, Math.ceil(result.meta.total / result.meta.limit));
    if (!signal.aborted && filters.page > lastPage) setFilters((previous) => ({ ...previous, page: lastPage }));
    return result;
  }, [from, to, q, filters.page]);
  const resource = usePersonalLedgerResource(load);
  const [deleteTarget, setDeleteTarget] = useState<LedgerMovement | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const deleteLock = useRef(false);

  function changeFilters(next: Partial<LedgerFiltersState>) { setFilters((previous) => ({ ...previous, ...next, page: 1 })); }
  function refresh() { resource.retry(); }
  async function submitDelete() {
    if (!deleteTarget || deleteLock.current) return;
    deleteLock.current = true; setDeleting(true); setDeleteError(null);
    try {
      await deletePersonalLedgerMovement(deleteTarget.id);
      setDeleteTarget(null); setNotice(t("deleted"));
      if (resource.data?.items.length === 1 && filters.page > 1) setFilters((old) => ({ ...old, page: old.page - 1 }));
      else refresh();
    } catch (error) { setDeleteError(errorMessage(error, t("saveError"))); }
    finally { deleteLock.current = false; setDeleting(false); }
  }

  return { filters, changeFilters, setPage: (page: number) => setFilters((previous) => ({ ...previous, page })), resource, refresh,
    deleteTarget, deleting, deleteError, submitDelete,
    requestDelete: (row: LedgerMovement) => { setDeleteError(null); setDeleteTarget(row); },
    closeDelete: () => { if (!deleteLock.current) setDeleteTarget(null); },
    notice, setNotice };
}
