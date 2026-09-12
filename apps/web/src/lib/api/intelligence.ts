import {
  DiscoveryResponse,
  HybridSearchResponse,
  IntelligenceHealthResponse,
  PublicContextResponse,
  RecommendationResponse,
  HybridSearchItem,
} from "@/types/intelligence";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function fetchDiscovery(params: {
  q?: string;
  locale?: string;
  district?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<DiscoveryResponse> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set("q", params.q);
  if (params.locale) queryParams.set("locale", params.locale);
  if (params.district) queryParams.set("district", params.district);
  if (params.category) queryParams.set("category", params.category);
  if (params.page) queryParams.set("page", String(params.page));
  if (params.pageSize) queryParams.set("page_size", String(params.pageSize));

  const url = `${API_BASE}/discover?${queryParams.toString()}`;
  const response = await fetch(url, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Discovery failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchHybridSearch(params: {
  query: string;
  locale?: string;
  mode?: "hybrid" | "lexical";
  district?: string;
  category?: string;
  tag?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}): Promise<HybridSearchResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set("q", params.query);
  if (params.locale) queryParams.set("locale", params.locale);
  if (params.mode) queryParams.set("mode", params.mode);
  if (params.district) queryParams.set("district", params.district);
  if (params.category) queryParams.set("category", params.category);
  if (params.tag) queryParams.set("tag", params.tag);
  if (params.latitude !== undefined) queryParams.set("latitude", String(params.latitude));
  if (params.longitude !== undefined) queryParams.set("longitude", String(params.longitude));
  if (params.radiusKm !== undefined) queryParams.set("radius_km", String(params.radiusKm));
  if (params.page) queryParams.set("page", String(params.page));
  if (params.pageSize) queryParams.set("page_size", String(params.pageSize));

  const url = `${API_BASE}/search?${queryParams.toString()}`;
  const response = await fetch(url, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRecommendations(
  slug: string,
  locale = "en",
  limit = 8,
): Promise<RecommendationResponse> {
  const url = `${API_BASE}/content/${encodeURIComponent(slug)}/recommendations?locale=${encodeURIComponent(locale)}&limit=${limit}`;
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { source_content_id: "", recommendations: [] };
    }
    throw new Error(`Recommendations failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchSimilarContent(
  slug: string,
  locale = "en",
  limit = 6,
): Promise<HybridSearchItem[]> {
  const url = `${API_BASE}/content/${encodeURIComponent(slug)}/similar?locale=${encodeURIComponent(locale)}&limit=${limit}`;
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Similar content failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchContentContext(
  slug: string,
  locale = "en",
): Promise<PublicContextResponse | null> {
  const url = `${API_BASE}/content/${encodeURIComponent(slug)}/context?locale=${encodeURIComponent(locale)}`;
  const response = await fetch(url, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Context failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchIntelligenceHealth(): Promise<IntelligenceHealthResponse> {
  const url = `${API_BASE}/admin/intelligence/health`;
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health fetch failed: ${response.status}`);
  }

  return response.json();
}

export async function triggerIntelligenceRebuild(
  target: "all" | "embeddings" | "knowledge_graph" = "all",
  locale?: string,
): Promise<{ status: string; published_entries_processed: number }> {
  const queryParams = new URLSearchParams({ target });
  if (locale) queryParams.set("locale", locale);

  const url = `${API_BASE}/admin/intelligence/rebuild?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Rebuild failed: ${response.status}`);
  }

  return response.json();
}
