import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { NewInvoicePage } from "@/app/modules/invoices/pages/new-invoice-page";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditInvoiceRoutePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <NewInvoicePage invoiceId={id} />
    </AuthGuard>
  );
}
