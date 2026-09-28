"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("shared");
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
      <ErrorState
        title={t("errorTitle")}
        message={t("errorDescription")}
        retryLabel={t("retry")}
        onRetry={reset}
      />
      <Button type="button" variant="secondary" onClick={() => router.push("/")}>
        {t("backHome")}
      </Button>
    </div>
  );
}
