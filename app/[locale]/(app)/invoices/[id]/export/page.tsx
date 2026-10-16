import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { InvoiceExportPage } from "@/app/modules/invoices/pages/invoice-export-page";

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <AuthGuard roles={["admin", "super_admin"]}><InvoiceExportPage invoiceId={id} /></AuthGuard>;
}
