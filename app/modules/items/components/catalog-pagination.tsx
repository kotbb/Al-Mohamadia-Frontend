"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/modules/shared/components/button";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  const t = useTranslations("shared");

  if (totalPages <= 1) return null;

  return (
    <nav aria-label={t("pagination")} className="flex items-center justify-center gap-3">
      <Button type="button" variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {t("prevPage")}
      </Button>
      <span className="text-sm text-text-secondary" aria-live="polite">
        {t("pageOf", { page, totalPages })}
      </span>
      <Button type="button" variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        {t("nextPage")}
      </Button>
    </nav>
  );
}
