import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { SupplierPaymentsPage } from "@/app/modules/supplier-payments/pages/supplier-payments-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SupplierPaymentsRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <SupplierPaymentsPage />
    </AuthGuard>
  );
}
