import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { NewPurchasePage } from "@/app/modules/purchases/pages/new-purchase-page";

export default async function NewPurchaseRoutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <NewPurchasePage />
    </AuthGuard>
  );
}
