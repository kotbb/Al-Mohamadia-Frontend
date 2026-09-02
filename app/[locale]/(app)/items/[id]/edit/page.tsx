import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

/** Edit item is a modal on `/items` — keep route for bookmarks. */
export default async function EditItemRoutePage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/items`);
}
