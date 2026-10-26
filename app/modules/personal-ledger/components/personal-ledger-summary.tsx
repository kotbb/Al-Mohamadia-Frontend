import { useLocale, useTranslations } from "next-intl";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { LedgerSummary } from "../types/personal-ledger.types";

export function PersonalLedgerSummary({ summary, loading = false, lifetime = false }: { summary?: LedgerSummary; loading?: boolean; lifetime?: boolean }) {
  const t = useTranslations("personalLedger");
  const locale = useLocale();
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy={loading}>
    {(["deposits", "withdrawals", "net"] as const).map((key) => {
      const value = summary?.[key];
      const color = key === "deposits" ? "text-success" : key === "withdrawals" ? "text-danger" : value !== undefined && value < 0 ? "text-danger" : "text-text-primary";
      return <SurfaceCard key={key} padding="sm">
        <div className="flex items-center justify-between gap-3"><p className="text-sm text-text-secondary">{t(lifetime ? `lifetime.${key}` : key)}</p><span aria-hidden="true" className={`flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted font-semibold ${color}`}>{key === "deposits" ? "+" : key === "withdrawals" ? "−" : "="}</span></div>
        <p className={`mt-3 text-2xl font-bold tabular-nums ${color}`}><bdi>{loading ? "…" : value === undefined ? "—" : formatMoney(value, locale === "ar" ? "ar-EG-u-nu-latn" : locale)}</bdi> <span className="text-sm font-normal text-text-muted">{t("currency")}</span></p>
      </SurfaceCard>;
    })}
  </div>;
}
