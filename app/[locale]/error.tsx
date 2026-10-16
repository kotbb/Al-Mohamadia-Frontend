"use client";

import { useLocale, useTranslations } from "next-intl";
import { FallbackPage } from "@/app/modules/shared/components/fallback-page";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("shared");
  const locale = useLocale();

  return (
    <FallbackPage code="!" title={t("errorTitle")} description={t("errorDescription")} homeHref={`/${locale}`} homeLabel={t("backHome")} retryLabel={t("retry")} onRetry={reset} />
  );
}
