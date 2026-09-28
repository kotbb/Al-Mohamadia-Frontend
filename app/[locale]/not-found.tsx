"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/app/modules/shared/components/button";
import { EmptyState } from "@/app/modules/shared/components/empty-state";

export default function NotFoundPage() {
  const t = useTranslations("shared");
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <EmptyState
        title={t("notFoundTitle")}
        description={t("notFoundDescription")}
        action={
          <Button type="button" onClick={() => router.push("/")}>
            {t("backHome")}
          </Button>
        }
      />
    </div>
  );
}
