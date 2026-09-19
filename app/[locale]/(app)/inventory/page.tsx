import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { InventoryPage } from "@/app/modules/inventory/pages/inventory-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function InventoryRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <InventoryPage />
    </AuthGuard>
  );
}
