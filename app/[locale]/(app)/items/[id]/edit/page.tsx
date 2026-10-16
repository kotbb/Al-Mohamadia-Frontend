import { setRequestLocale } from "next-intl/server";
import { ItemFormPage } from "@/app/modules/items/pages/item-form-page";
interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}
export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ItemFormPage itemId={id} />;
}
