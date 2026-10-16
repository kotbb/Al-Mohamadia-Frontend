"use client";

import { useLocale, useTranslations } from "next-intl";
import { FallbackPage } from "@/app/modules/shared/components/fallback-page";

export default function NotFoundPage() {
  const t = useTranslations("shared");
  const locale = useLocale();
  return <FallbackPage code="404" title={t("notFoundTitle")} description={t("notFoundDescription")} homeHref={`/${locale}`} homeLabel={t("backHome")} />;
}
