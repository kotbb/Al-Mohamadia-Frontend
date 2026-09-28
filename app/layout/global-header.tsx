"use client";

import { useTranslations } from "next-intl";
import { UserMenu } from "./user-menu";

interface GlobalHeaderProps {
  onOpenNav?: () => void;
}

export function GlobalHeader({ onOpenNav }: GlobalHeaderProps) {
  const t = useTranslations("nav");

  return (
    <header className="flex items-center justify-between gap-3">
      {onOpenNav ? (
        <button
          type="button"
          className="ds-focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface text-text-primary lg:hidden"
          aria-label={t("openMenu")}
          onClick={onOpenNav}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
      <div className="ms-auto">
        <UserMenu />
      </div>
    </header>
  );
}
