import { redirect, RedirectType } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LegacyPlaceRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/content/destination/${encodeURIComponent(slug)}`, RedirectType.replace);
}
