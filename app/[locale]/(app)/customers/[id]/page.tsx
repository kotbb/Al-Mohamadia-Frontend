import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { CustomerDetailPage } from "@/app/modules/customers/pages/customer-detail-page";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function CustomerDetailRoutePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <CustomerDetailPage customerId={id} />
    </AuthGuard>
  );
}
