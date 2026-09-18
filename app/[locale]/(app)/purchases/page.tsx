import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { PurchasesPage } from "@/app/modules/purchases/pages/purchases-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PurchasesRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <PurchasesPage />
    </AuthGuard>
  );
}
