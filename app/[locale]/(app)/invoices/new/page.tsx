import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { NewInvoicePage } from "@/app/modules/invoices/pages/new-invoice-page";

export default async function NewInvoiceRoutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <NewInvoicePage />
    </AuthGuard>
  );
}
