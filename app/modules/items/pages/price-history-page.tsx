"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
    <AppShell title={title} subtitle={t("historySubtitle")}>
      <div className="flex w-full flex-col gap-6">
        <Link
          href="/items"
          className="ds-focus-ring inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          <BackIcon />
          {t("backToItems")}
        </Link>

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
          <PriceHistoryTable history={history} />
        )}
      </div>
    </AppShell>
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3 5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
