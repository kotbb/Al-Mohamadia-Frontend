import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { SupplierDetailPage } from "@/app/modules/suppliers/pages/supplier-detail-page";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SupplierDetailRoutePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <SupplierDetailPage supplierId={id} />
    </AuthGuard>
  );
}
