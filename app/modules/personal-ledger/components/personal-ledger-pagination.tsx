import { useTranslations } from "next-intl";
import { Button } from "@/app/modules/shared/components/button";
import type { LedgerMeta } from "../types/personal-ledger.types";

export function PersonalLedgerPagination({ meta, onChange }: { meta: LedgerMeta; onChange: (page: number) => void }) {
  const t = useTranslations("personalLedger");
  const pages = Math.max(1, Math.ceil(meta.total / meta.limit));
  if (pages === 1 && meta.page === 1) return null;
  return <nav aria-label={t("pagination")} className="flex flex-wrap items-center justify-center gap-3 py-3">
    <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>{t("previous")}</Button>
    <span className="text-sm text-text-secondary">{t("pageCount", { page: meta.page, pages })}</span>
    <Button variant="secondary" size="sm" disabled={meta.page >= pages} onClick={() => onChange(meta.page + 1)}>{t("next")}</Button>
  </nav>;
}
