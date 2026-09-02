import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** Add item is a modal on `/items` — keep route for bookmarks. */
export default async function NewItemRoutePage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/items`);
}
