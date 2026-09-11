import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getPublicContent } from "@/lib/api/content-entries";
import { ContentRenderer } from "@/components/content-renderer/ContentRenderer";

interface PageProps {
  params: Promise<{
    templateSlug: string;
    entrySlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  try {
    const data = await getPublicContent(resolved.templateSlug, resolved.entrySlug);
    return {
      title: `${data.entry.title} | Chhattisgarh Tourism`,
      description: `Explore ${data.entry.title} in Chhattisgarh.`,
    };
  } catch {
    return {
      title: "Content Not Found | Chhattisgarh Tourism",
    };
  }
}

export default async function PublicContentPage({ params }: PageProps) {
  const resolved = await params;

  let content;
  try {
    content = await getPublicContent(resolved.templateSlug, resolved.entrySlug);
  } catch {
    return (
      <main className="min-h-screen bg-stone-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-4 shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Content Not Found</h1>
          <p className="text-xs text-stone-500">
            No published tourism content found for &quot;{resolved.entrySlug}&quot; under &quot;{resolved.templateSlug}&quot;.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
          >
            Explore Chhattisgarh
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          &larr; Back to Explore
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-10">
          <ContentRenderer content={content} />
        </div>
      </div>
    </main>
  );
}
