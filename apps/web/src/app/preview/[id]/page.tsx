import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ContentHeader } from "@/components/public-content/ContentHeader";
import { ContentRenderer } from "@/components/public-content/ContentRenderer";
import { getPreviewContent } from "@/lib/api/public-content";

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    locale?: string;
  }>;
}

export const metadata: Metadata = {
  title: "[Draft Preview] CG Tourism",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PreviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const locale = sp.locale ?? "en";

  let content;
  try {
    content = await getPreviewContent(id, locale);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold uppercase tracking-wider text-xs bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
            Draft Preview
          </span>
          <span>You are viewing an unpublished revision bound to template v{content.template_version}.</span>
        </div>
        <span className="text-xs text-amber-400 font-mono">Not indexable</span>
      </div>

      <ContentHeader content={content} />
      <ContentRenderer content={content} />
    </main>
  );
}
