import { setRequestLocale } from "next-intl/server";
import { LoginPage } from "@/app/modules/auth/pages/login-page";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginRoutePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginPage />;
}
