import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { InvoiceDetailPage } from "@/app/modules/invoices/pages/invoice-detail-page";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function InvoiceDetailRoutePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <InvoiceDetailPage invoiceId={id} />
    </AuthGuard>
  );
}
