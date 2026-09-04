import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { CategoriesPage } from "@/app/modules/items/pages/categories-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CategoriesRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["admin", "super_admin"]}>
      <CategoriesPage />
    </AuthGuard>
  );
}
