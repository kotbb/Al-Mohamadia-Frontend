import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { InvoicesPage } from "@/app/modules/invoices/pages/invoices-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function InvoicesRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <InvoicesPage />
    </AuthGuard>
  );
}
