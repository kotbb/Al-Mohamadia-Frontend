import { setRequestLocale } from "next-intl/server";
import { PublicInvoicePageClient } from "./public-invoice-page.client";

interface PublicInvoicePageProps {
  params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  await params;
  return {
    title: "فاتورة المحمدية | Al-Mohamadia Invoice",
    description: "عرض وطباعة فاتورة المبيعات",
    robots: "noindex",
  };
}

export default async function PublicInvoicePage({
  params,
}: PublicInvoicePageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  return <PublicInvoicePageClient token={token} />;
}
