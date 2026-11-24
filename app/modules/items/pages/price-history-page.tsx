"use client";

import { useTranslations } from "next-intl";
import { BackButton } from "@/app/modules/shared/components/back-button";

import { AppShell } from "@/app/layout/app-shell";
import { PriceHistoryTable } from "@/app/modules/items/components/price-history-table";
import { usePriceHistory } from "@/app/modules/items/hooks/use-price-history";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

interface PriceHistoryPageProps {
  itemId: string;
}

export function PriceHistoryPage({ itemId }: PriceHistoryPageProps) {
  const t = useTranslations("items");
  const tShared = useTranslations("shared");
  const { item, history, status, error } = usePriceHistory(itemId);

  const title = item ? t("historyTitle", { name: item.name }) : t("historyTitleFallback");

  return (
    <AppShell title={title} subtitle={t("historySubtitle")} navigation={<BackButton fallback="/items" />}>
      <div className="flex w-full flex-col gap-6">
        {status === "loading" || status === "idle" ? (
          <LoadingState message={tShared("loading")} />
        ) : status === "error" ? (
          <ErrorState title={t("historyLoadError")} message={error ?? undefined} />
        ) : history.length === 0 ? (
          <EmptyState title={t("historyEmptyTitle")} description={t("historyEmptyDescription")} />
        ) : (
          <PriceHistoryTable history={history} />
        )}
      </div>
    </AppShell>
  );
}
