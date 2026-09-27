import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { AuditPage } from "@/app/modules/audit/pages/audit-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AuditRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <AuditPage />
    </AuthGuard>
  );
}
