import { setRequestLocale } from "next-intl/server";
import { FoundationPage } from "@/app/modules/foundation/pages/foundation-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FoundationPage />;
}
