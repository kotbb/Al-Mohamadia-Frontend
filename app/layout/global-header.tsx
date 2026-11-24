"use client";

import { useTranslations } from "next-intl";
import { UserMenu } from "./user-menu";
import { BrandMark } from "@/app/modules/shared/components/brand-mark";

interface GlobalHeaderProps {
  onOpenNav?: () => void;
}

export function GlobalHeader({ onOpenNav }: GlobalHeaderProps) {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");

  return (
    <header className="flex items-center justify-between gap-3">
      {onOpenNav ? (
        <button
          type="button"
          className="ds-focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-surface text-text-primary lg:hidden"
          aria-label={t("openMenu")}
          onClick={onOpenNav}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
      {onOpenNav ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
          <BrandMark size={40} alt="" />
          <span className="truncate text-sm font-semibold text-text-primary">{tApp("name")}</span>
        </div>
      ) : null}
      <div className="ms-auto">
        <UserMenu />
      </div>
    </header>
  );
}
