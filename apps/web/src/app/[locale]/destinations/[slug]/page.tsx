import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ContentHeader } from "@/components/public-content/ContentHeader";
import { ContentRenderer } from "@/components/public-content/ContentRenderer";
import { StructuredData } from "@/components/public-content/StructuredData";
import { PublicContextPanel } from "@/components/discovery/PublicContextPanel";
import { SimilarContent } from "@/components/discovery/SimilarContent";
import { RecommendationSection } from "@/components/discovery/RecommendationSection";
import { getPublicContent } from "@/lib/api/public-content";
import {
  fetchContentContext,
  fetchRecommendations,
  fetchSimilarContent,
} from "@/lib/api/intelligence";
import { buildContentMetadata } from "@/lib/content/seo";
import { PublicContextResponse, Recommendation, HybridSearchItem } from "@/types/intelligence";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const content = await getPublicContent(slug, locale, "destinations");
    return buildContentMetadata(content);
  } catch {
    return {
      title: "CG Tourism",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function DestinationPage({ params }: Props) {
  const { locale, slug } = await params;

  let content;
  try {
    content = await getPublicContent(slug, locale, "destinations");
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const heroImage = content.fields.find(
    (f) => f.key === "hero_image" && f.type === "IMAGE",
  )?.value as { url?: string } | undefined;

  let kgContext: PublicContextResponse | null = null;
  let recommendations: Recommendation[] = [];
  let similarItems: HybridSearchItem[] = [];

  try {
    const [ctxRes, recRes, simRes] = await Promise.allSettled([
      fetchContentContext(slug, locale),
      fetchRecommendations(slug, locale, 4),
      fetchSimilarContent(slug, locale, 3),
    ]);

    if (ctxRes.status === "fulfilled") kgContext = ctxRes.value;
    if (recRes.status === "fulfilled") recommendations = recRes.value.recommendations;
    if (simRes.status === "fulfilled") similarItems = simRes.value;
  } catch {
    // Non-blocking degradation
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <ContentHeader content={content} />
      <ContentRenderer content={content} />
      <PublicContextPanel context={kgContext} locale={locale} />
      <SimilarContent items={similarItems} currentTitle={content.name ?? undefined} locale={locale} />
      <RecommendationSection
        title="Explore Nearby & Related Destinations"
        subtitle="Recommended based on geographic proximity and shared regional themes"
        recommendations={recommendations}
        locale={locale}
      />
      <StructuredData
        name={content.name ?? content.slug}
        description={content.description}
        url={content.canonical_url}
        image={heroImage?.url}
      />
    </main>
  );
}
