import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { ExportsPage } from "@/app/modules/exports/pages/exports-page";

export default async function ExportsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthGuard roles={["super_admin"]}>
      <ExportsPage />
    </AuthGuard>
  );
}
