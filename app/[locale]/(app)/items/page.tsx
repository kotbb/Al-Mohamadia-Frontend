import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { ItemsPage } from "@/app/modules/items/pages/items-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ItemsRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <ItemsPage />
    </AuthGuard>
  );
}
