import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

/** Price history is a modal on `/items` — keep route for bookmarks. */
export default async function PriceHistoryRoutePage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/items`);
}
