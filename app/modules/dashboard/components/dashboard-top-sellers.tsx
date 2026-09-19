"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DashboardTopSellingItem } from "@/app/modules/dashboard/types/dashboard.types";
import { formatMoney } from "@/app/modules/items/utils/format-money";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface DashboardTopSellersProps {
  items: DashboardTopSellingItem[];
}

export function DashboardTopSellers({ items }: DashboardTopSellersProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <SurfaceCard padding="md" className="flex h-full flex-col">
      <h3 className="text-base font-semibold text-text-primary">
        {t("topSellersTitle")}
      </h3>
      <p className="mt-0.5 text-sm text-text-muted">{t("topSellersSubtitle")}</p>

      {items.length === 0 ? (
        <div className="mt-4 flex-1">
          <EmptyState
            title={t("topSellersEmptyTitle")}
            description={t("topSellersEmptyDescription")}
          />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-1">
          {items.map((item, index) => (
            <li key={item.itemId}>
              <Link
                href="/items"
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-focus-ring-offset"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold tabular-nums text-primary">
                  {index + 1}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                  {item.name ?? t("unknownItem")}
                </p>
                <div className="shrink-0 text-end">
                  <p className="text-sm font-semibold tabular-nums text-text-primary">
                    {formatMoney(item.revenue, locale)}
                  </p>
                  <p className="text-[11px] text-text-muted">{t("currency")}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
