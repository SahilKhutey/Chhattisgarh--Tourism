import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ContentHeader } from "@/components/public-content/ContentHeader";
import { ContentRenderer } from "@/components/public-content/ContentRenderer";
import { getPublicContent } from "@/lib/api/public-content";
import { buildContentMetadata } from "@/lib/content/seo";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const content = await getPublicContent(slug, locale, "content");
    return buildContentMetadata(content);
  } catch {
    return {
      title: "Content | CG Tourism",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function GenericContentPage({ params }: Props) {
  const { locale, slug } = await params;

  let content;
  try {
    content = await getPublicContent(slug, locale, "content");
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <ContentHeader content={content} />
      <ContentRenderer content={content} />
    </main>
  );
}
