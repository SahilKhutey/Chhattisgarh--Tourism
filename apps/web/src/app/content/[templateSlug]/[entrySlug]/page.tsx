import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { GenericEntryRenderer } from '@/components/content/GenericEntryRenderer';

interface Props {
  params: Promise<{
    templateSlug: string;
    entrySlug: string;
  }>;
}

export default async function ContentPage({ params }: Props) {
  const { templateSlug, entrySlug } = await params;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'http://localhost:4000/api/v1';

  let entry = null;
  let notFound = false;

  try {
    const res = await fetch(`${apiUrl}/content/${templateSlug}/${entrySlug}`, {
      next: {
        revalidate: 60,
      },
    });

    if (res.ok) {
      entry = await res.json();
    } else {
      notFound = true;
    }
  } catch (err) {
    console.warn(`Failed to fetch /content/${templateSlug}/${entrySlug}`, err);
    notFound = true;
  }

  if (notFound || !entry) {
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

        <GenericEntryRenderer
          template={entry.template}
          entry={entry}
        />
      </div>
    </main>
  );
}
