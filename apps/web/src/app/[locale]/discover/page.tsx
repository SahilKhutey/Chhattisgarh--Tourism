import { Metadata } from "next";
import { DiscoveryPage } from "@/components/discovery/DiscoveryPage";
import { fetchDiscovery } from "@/lib/api/intelligence";
import { DiscoveryResponse } from "@/types/intelligence";

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    district?: string;
    category?: string;
    mode?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;

  const title = q
    ? `Discover: "${q}" | CG Tourism Intelligence`
    : "Discover Chhattisgarh — Semantic Tourism & Knowledge Explorer";

  const description =
    "Explore Chhattisgarh with AI-assisted concept discovery, theme matching, and knowledge graph recommendations.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/discover${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    },
    robots: {
      index: !q,
      follow: true,
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;

  let initialData: DiscoveryResponse;
  try {
    initialData = await fetchDiscovery({
      q: query.q,
      locale,
      district: query.district,
      category: query.category,
    });
  } catch (err) {
    console.error("Failed to fetch discovery data:", err);
    // Safe offline / degraded fallback
    initialData = {
      query: query.q || null,
      intent: null,
      results: [],
      suggested_queries: ["waterfalls in Bastar", "peaceful nature places", "historical temples"],
      related_categories: ["Waterfalls", "Temples", "Wildlife", "Heritage", "Forests"],
      recommendations: [],
    };
  }

  return <DiscoveryPage initialData={initialData} locale={locale} />;
}
