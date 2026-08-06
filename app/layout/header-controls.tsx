"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTheme } from "@/lib/theme/theme-provider";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/app/modules/shared/components/button";

export function HeaderControls() {
  const t = useTranslations("controls");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
        <span className="sr-only">{t("theme")}</span>
        <Button
          variant="ghost"
          className={`min-h-9 px-3 text-sm ${theme === "light" ? "bg-surface-muted text-primary" : ""}`}
          onClick={() => setTheme("light")}
          aria-pressed={theme === "light"}
        >
          {t("themeLight")}
        </Button>
        <Button
          variant="ghost"
          className={`min-h-9 px-3 text-sm ${theme === "dark" ? "bg-surface-muted text-primary" : ""}`}
          onClick={() => setTheme("dark")}
          aria-pressed={theme === "dark"}
        >
          {t("themeDark")}
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
        <span className="sr-only">{t("language")}</span>
        <Button
          variant="ghost"
          className={`min-h-9 px-3 text-sm ${locale === "ar" ? "bg-surface-muted text-primary" : ""}`}
          onClick={() => switchLocale("ar")}
          aria-pressed={locale === "ar"}
        >
          {t("arabic")}
        </Button>
        <Button
          variant="ghost"
          className={`min-h-9 px-3 text-sm ${locale === "en" ? "bg-surface-muted text-primary" : ""}`}
          onClick={() => switchLocale("en")}
          aria-pressed={locale === "en"}
        >
          {t("english")}
        </Button>
      </div>
    </div>
  );
}
