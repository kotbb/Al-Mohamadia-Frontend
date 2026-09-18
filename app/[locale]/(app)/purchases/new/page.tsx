import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ supplierId?: string }>;
}

export default async function NewPurchaseRoutePage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { supplierId } = await searchParams;
  setRequestLocale(locale);
  const query = supplierId ? `?new=1&supplierId=${supplierId}` : "?new=1";
  redirect(`/${locale}/purchases${query}`);
}
