import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ContentRenderer } from '@/components/content/GenericRenderer';
import { RendererErrorBoundary } from '@/components/content/GenericRenderer';
import { buildMetadata } from '@/lib/rendering/metadata';

interface Props {
  params: Promise<{
    templateSlug: string;
    entrySlug: string;
  }>;
}

const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:4000/api/v1';

async function fetchContentEntry(templateSlug: string, entrySlug: string) {
  const apiUrl = getApiUrl();
  // Attempt public content endpoint first
  try {
    const res = await fetch(`${apiUrl}/public/content/${templateSlug}/${entrySlug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // continue to fallback
  }

  // Attempt canonical /entries/:idOrSlug
  try {
    const res = await fetch(`${apiUrl}/entries/${entrySlug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    // continue to fallback
  }

  // Fallback to general content endpoint
  try {
    const res = await fetch(`${apiUrl}/content/${templateSlug}/${entrySlug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch content for ${templateSlug}/${entrySlug}`, err);
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateSlug, entrySlug } = await params;
  const entry = await fetchContentEntry(templateSlug, entrySlug);

  if (!entry) {
    return {
      title: 'Content Not Found | Chhattisgarh Tourism',
      description: 'The requested tourism content could not be located.',
    };
  }

  return buildMetadata(entry);
}

export default async function ContentPage({ params }: Props) {
  const { templateSlug, entrySlug } = await params;
  const entry = await fetchContentEntry(templateSlug, entrySlug);

  if (!entry) {
    return (
      <main className="min-h-screen bg-stone-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold text-stone-900">Content Not Found</h1>
          <p className="text-xs text-stone-500">
            No published tourism content found for &quot;{entrySlug}&quot; under &quot;{templateSlug}&quot;.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Explore Chhattisgarh
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href={`/content/${templateSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {entry.template?.name || templateSlug}
        </Link>

        <RendererErrorBoundary fallbackTitle="Tourism Content Display">
          <ContentRenderer entry={entry} />
        </RendererErrorBoundary>
      </div>
    </main>
  );
}
