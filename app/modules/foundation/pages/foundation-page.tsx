"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useHealth } from "@/app/modules/foundation/hooks/use-health";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { PageSection } from "@/app/modules/shared/components/page-section";

export function FoundationPage() {
  const t = useTranslations("foundation");
  const { status, data, errorMessage, refresh } = useHealth();

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <div className="flex w-full flex-col gap-10">
        <PageSection title={t("healthTitle")}>
          {status === "loading" || status === "idle" ? (
            <LoadingState message={t("healthChecking")} />
          ) : null}

          {status === "success" && data ? (
            <div className="rounded-xl border border-success/30 bg-surface-muted px-5 py-6">
              <p className="text-base font-medium text-success">{t("healthOk")}</p>
              <p className="mt-2 text-base text-text-muted">
                {t("healthStatus", { status: data.status })}
              </p>
            </div>
          ) : null}

          {status === "error" ? (
            <ErrorState
              title={t("healthError")}
              message={errorMessage ?? undefined}
              retryLabel={t("retry")}
              onRetry={refresh}
            />
          ) : null}
        </PageSection>

        <PageSection title={t("demoEmpty")} bordered={false}>
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        </PageSection>
      </div>
    </AppShell>
  );
}
