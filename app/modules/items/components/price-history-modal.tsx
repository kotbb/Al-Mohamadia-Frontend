"use client";

import { useTranslations } from "next-intl";
import { PriceHistoryTable } from "@/app/modules/items/components/price-history-table";
import { usePriceHistory } from "@/app/modules/items/hooks/use-price-history";
import { Button } from "@/app/modules/shared/components/button";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { Modal } from "@/app/modules/shared/components/modal";

interface PriceHistoryModalProps {
  open: boolean;
  itemId: string | null;
  onClose: () => void;
}

export function PriceHistoryModal({
  open,
  itemId,
  onClose,
}: PriceHistoryModalProps) {
  const t = useTranslations("items");
  const tShared = useTranslations("shared");
  const { item, history, status, error } = usePriceHistory(
    open ? itemId : null,
  );

  const title = item
    ? t("historyTitle", { name: item.name })
    : t("historyTitleFallback");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-text-muted">{t("historySubtitle")}</p>

      {status === "loading" || status === "idle" ? (
        <LoadingState message={tShared("loading")} />
      ) : status === "error" ? (
        <ErrorState title={t("historyLoadError")} message={error ?? undefined} />
      ) : history.length === 0 ? (
        <EmptyState
          title={t("historyEmptyTitle")}
          description={t("historyEmptyDescription")}
        />
      ) : (
        <PriceHistoryTable history={history} compact />
      )}
    </Modal>
  );
}
