import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewInvoiceRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/invoices?new=1`);
}
