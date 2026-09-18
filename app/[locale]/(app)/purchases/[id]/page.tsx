import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { PurchaseDetailPage } from "@/app/modules/purchases/pages/purchase-detail-page";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PurchaseDetailRoutePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <PurchaseDetailPage purchaseId={id} />
    </AuthGuard>
  );
}
