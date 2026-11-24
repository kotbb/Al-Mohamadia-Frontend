"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/app/modules/shared/components/modal";
import { Button } from "@/app/modules/shared/components/button";
import { useAppNavigation } from "@/app/modules/shared/hooks/use-app-navigation";
import type { LedgerDialogProps } from "../types/ledger-dialog-flow.types";

interface Props extends LedgerDialogProps {
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
}

export function PersonalLedgerDeleteModal({ busy, error, onConfirm, ...modal }: Props) {
  const t = useTranslations("personalLedger");
  const navigation = useAppNavigation();
  return (
    <Modal
      {...modal}
      open={modal.open ?? true}
      busy={busy}
      title={t("deleteMovement")}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={() => navigation.back()}>
            {t("cancel")}
          </Button>
          <Button variant="danger" disabled={busy} onClick={onConfirm}>
            {t(busy ? "deleting" : "delete")}
          </Button>
        </div>
      }
    >
      <p>{t("deleteHint")}</p>
      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
