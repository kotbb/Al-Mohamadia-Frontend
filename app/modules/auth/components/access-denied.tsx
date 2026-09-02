"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { Link } from "@/i18n/navigation";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

export function AccessDenied() {
  const t = useTranslations("users");

  return (
    <AppShell title={t("accessDeniedTitle")} subtitle={t("accessDeniedSubtitle")}>
      <div className="mx-auto max-w-lg">
        <SurfaceCard className="flex flex-col items-start gap-6">
          <p className="text-base leading-relaxed text-text-secondary">
            {t("accessDeniedBody")}
          </p>
          <Link
            href="/"
            className="ds-focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2 text-base font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            {t("backHome")}
          </Link>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
