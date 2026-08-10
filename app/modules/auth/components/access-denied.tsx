"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { Link } from "@/i18n/navigation";

export function AccessDenied() {
  const t = useTranslations("users");

  return (
    <AppShell title={t("accessDeniedTitle")} subtitle={t("accessDeniedSubtitle")}>
      <div className="mx-auto flex max-w-lg flex-col items-start gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-base text-text-muted">{t("accessDeniedBody")}</p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-base font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("backHome")}
        </Link>
      </div>
    </AppShell>
  );
}
