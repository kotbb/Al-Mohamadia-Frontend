"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTheme } from "@/lib/theme/theme-provider";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/app/modules/shared/components/button";
import { useAuth } from "@/lib/auth/auth-provider";

interface HeaderControlsProps {
  showAuthActions?: boolean;
}

function segmentClass(active: boolean): string {
  return [
    "min-h-9 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors duration-150",
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-text-muted hover:bg-surface-muted hover:text-text-primary",
  ].join(" ");
}

export function HeaderControls({ showAuthActions = true }: HeaderControlsProps) {
  const t = useTranslations("controls");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, status, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function switchLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          <span className="sr-only">{t("theme")}</span>
          <button
            type="button"
            className={segmentClass(theme === "light")}
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
          >
            {t("themeLight")}
          </button>
          <button
            type="button"
            className={segmentClass(theme === "dark")}
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            {t("themeDark")}
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          <span className="sr-only">{t("language")}</span>
          <button
            type="button"
            className={segmentClass(locale === "ar")}
            onClick={() => switchLocale("ar")}
            aria-pressed={locale === "ar"}
          >
            {t("arabic")}
          </button>
          <button
            type="button"
            className={segmentClass(locale === "en")}
            onClick={() => switchLocale("en")}
            aria-pressed={locale === "en"}
          >
            {t("english")}
          </button>
        </div>
      </div>

      {showAuthActions && status === "authenticated" && user ? (
        <div className="flex items-center border-s border-border ps-3">
          <Button
            variant="ghost"
            className="min-h-9 border border-border px-3 text-sm text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            {t("logout")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
