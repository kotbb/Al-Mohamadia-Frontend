import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { SuppliersPage } from "@/app/modules/suppliers/pages/suppliers-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SuppliersRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <SuppliersPage />
    </AuthGuard>
  );
}
