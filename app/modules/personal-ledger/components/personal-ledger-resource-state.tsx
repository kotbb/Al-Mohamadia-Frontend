import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";

export function PersonalLedgerResourceState({ resource, children }: { resource: { loading: boolean; error: string | null; retry: () => void }; children: ReactNode }) {
  const t = useTranslations("personalLedger");
  if (resource.loading) return <LoadingState message={t("loading")} />;
  if (resource.error) return <ErrorState title={t("loadError")} message={resource.error} retryLabel={t("retry")} onRetry={resource.retry} />;
  return children;
}
