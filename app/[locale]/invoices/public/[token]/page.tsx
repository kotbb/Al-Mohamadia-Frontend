import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicInvoicePageClient } from "@/app/modules/invoices/pages/public-invoice-page";

interface PublicInvoicePageProps {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ prices?: string }>;
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
  searchParams,
}: PublicInvoicePageProps) {
  const { locale, token } = await params;
  const { prices } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale: "ar", namespace: "invoices" });

  return <PublicInvoicePageClient token={token} showPrices={prices !== "off"} printGuidanceTitle={t("printGuidanceTitle")} printGuidanceMessage={t("printGuidancePdf")} />;
}
