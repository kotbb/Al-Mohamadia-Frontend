import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { UsersPage } from "@/app/modules/auth/pages/users-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function UsersRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard roles={["super_admin"]}>
      <UsersPage />
    </AuthGuard>
  );
}
