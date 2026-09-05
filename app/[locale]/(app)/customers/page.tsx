import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { CustomersPage } from "@/app/modules/customers/pages/customers-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CustomersRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <CustomersPage />
    </AuthGuard>
  );
}
