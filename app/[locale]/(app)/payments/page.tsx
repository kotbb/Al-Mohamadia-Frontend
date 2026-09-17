import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { PaymentsPage } from "@/app/modules/payments/pages/payments-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PaymentsRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <PaymentsPage />
    </AuthGuard>
  );
}
