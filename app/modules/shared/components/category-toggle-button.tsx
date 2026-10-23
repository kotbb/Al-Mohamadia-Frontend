"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/app/modules/shared/components/button";

interface CategoryToggleButtonProps {
  allCollapsed: boolean;
  onClick: () => void;
}

export function CategoryToggleButton({ allCollapsed, onClick }: CategoryToggleButtonProps) {
  const t = useTranslations("shared");

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onClick}
      className="min-h-11 shrink-0 rounded-lg bg-surface font-semibold shadow-sm"
    >
      <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {allCollapsed ? (
          <path d="m8 7 4-4 4 4M8 17l4 4 4-4M4 10h16M4 14h16" />
        ) : (
          <path d="m8 3 4 4 4-4M8 21l4-4 4 4M4 10h16M4 14h16" />
        )}
      </svg>
      {allCollapsed ? t("expandAll") : t("collapseAll")}
    </Button>
  );
}
