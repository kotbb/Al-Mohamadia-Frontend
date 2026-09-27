"use client";

import { useTranslations } from "next-intl";
import { AuditLogPanel } from "@/app/modules/audit/components/audit-log-panel";
import type { AuditEntityType } from "@/app/modules/audit/utils/audit-catalog";
import { Modal } from "@/app/modules/shared/components/modal";

interface AuditHistoryModalProps {
  open: boolean;
  onClose: () => void;
  entityType: AuditEntityType;
  entityId?: string;
  recordLabel?: string;
  defaultAction?: string;
}

export function AuditHistoryModal({
  open,
  onClose,
  entityType,
  entityId,
  recordLabel,
  defaultAction,
}: AuditHistoryModalProps) {
  const t = useTranslations("audit");
  const title = recordLabel
    ? t("historyTitleRecord", { name: recordLabel })
    : t("historyTitle", { entity: t(`entities.${entityType}`) });

  return (
    <Modal open={open} onClose={onClose} title={title} size="wide">
      {open ? (
        <AuditLogPanel
          lockedEntityType={entityType}
          entityId={entityId}
          initialAction={defaultAction}
        />
      ) : null}
    </Modal>
  );
}
