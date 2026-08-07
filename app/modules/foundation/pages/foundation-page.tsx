"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useHealth } from "@/app/modules/foundation/hooks/use-health";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

export function FoundationPage() {
  const t = useTranslations("foundation");
  const { status, data, errorMessage, refresh } = useHealth();

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {t("healthTitle")}
          </h2>

          {status === "loading" || status === "idle" ? (
            <LoadingState message={t("healthChecking")} />
          ) : null}

          {status === "success" && data ? (
            <div className="rounded-lg border border-success/30 bg-surface-muted px-4 py-5">
              <p className="text-base font-medium text-success">
                {t("healthOk")}
              </p>
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
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">
            {t("demoEmpty")}
          </h2>
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        </section>
      </div>
    </AppShell>
  );
}
