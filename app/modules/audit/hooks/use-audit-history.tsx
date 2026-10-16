"use client";

import type { AuditHistoryRequest } from "../types/use-audit-history.types";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { AuditHistoryModal } from "@/app/modules/audit/components/audit-history-modal";
import type { AuditEntityType } from "@/app/modules/audit/utils/audit-catalog";
import { Button } from "@/app/modules/shared/components/button";

export function useAuditHistory(options: {
  entityType: AuditEntityType;
  defaultAction?: string;
}) {
  const t = useTranslations("audit");
  const [request, setRequest] = useState<AuditHistoryRequest | null>(null);

  const openType = useCallback(() => {
    setRequest({});
  }, []);

  const openRecord = useCallback((entityId: string, recordLabel: string) => {
    setRequest({ entityId, recordLabel });
  }, []);

  const close = useCallback(() => {
    setRequest(null);
  }, []);

  const button = (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="min-h-10 rounded-lg px-3.5 text-sm"
      onClick={openType}
    >
      {t("viewHistory")}
    </Button>
  );

  const modal = (
    <AuditHistoryModal
      open={request !== null}
      onClose={close}
      entityType={options.entityType}
      entityId={request?.entityId}
      recordLabel={request?.recordLabel}
      defaultAction={options.defaultAction}
    />
  );

  return { button, modal, openType, openRecord };
}
