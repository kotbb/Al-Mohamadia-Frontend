"use client";

import { useLocale, useTranslations } from "next-intl";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface CatalogSummaryCardProps {
  label: string;
  count: number | null;
  isLoading: boolean;
}

export function CatalogSummaryCard({ label, count, isLoading }: CatalogSummaryCardProps) {
  const shared = useTranslations("shared");
  const locale = useLocale();

  return (
    <SurfaceCard padding="sm" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-1">
        <div>
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary" aria-busy={isLoading}>
            {isLoading ? (
              <>
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-surface-muted motion-reduce:animate-none" aria-hidden="true" />
                <span className="sr-only">{shared("loading")}</span>
              </>
            ) : count === null ? "—" : count.toLocaleString(locale)}
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
