import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/lib/auth/auth-guard";
import { PersonalLedgerPage } from "@/app/modules/personal-ledger/pages/personal-ledger-page";

export default async function PersonalLedgerRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthGuard roles={["super_admin"]}><PersonalLedgerPage /></AuthGuard>;
}
