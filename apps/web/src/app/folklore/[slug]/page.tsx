import { redirect, RedirectType } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LegacyFolkloreRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/content/folklore/${encodeURIComponent(slug)}`, RedirectType.replace);
}
