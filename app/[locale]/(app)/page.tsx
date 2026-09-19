import { setRequestLocale } from "next-intl/server";
import { DashboardPage } from "@/app/modules/dashboard/pages/dashboard-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardPage />;
}
