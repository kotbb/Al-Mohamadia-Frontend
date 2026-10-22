import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { NewPurchasePage } from "@/app/modules/purchases/pages/new-purchase-page";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditPurchaseRoutePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <NewPurchasePage purchaseId={id} />
    </AuthGuard>
  );
}
