"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { AuditLogPanel } from "@/app/modules/audit/components/audit-log-panel";

export function AuditPage() {
  const t = useTranslations("audit");

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <AuditLogPanel />
    </AppShell>
  );
}
