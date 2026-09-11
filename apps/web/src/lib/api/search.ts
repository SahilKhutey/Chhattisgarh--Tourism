export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_type: string;
  district: string | null;
  categories: string[];
  tags: string[];
  distance_km: number | null;
  score: number;
}

export interface SearchFacet {
  value: string;
  count: number;
}

export interface SearchResponse {
  query: string;
  locale: string;
  page: number;
  page_size: number;
  total: number;
  results: SearchResult[];
  content_types: SearchFacet[];
  districts: SearchFacet[];
  categories: SearchFacet[];
}

export interface SuggestionItem {
  text: string;
  type: string;
  slug: string | null;
}

export interface SearchSuggestionsResponse {
  suggestions: SuggestionItem[];
}

export interface DiscoveryLandingResponse {
  featured_destinations: SearchResult[];
  popular_categories: SearchFacet[];
  popular_districts: SearchFacet[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function searchContent(
  params: URLSearchParams | Record<string, string | number | undefined>,
): Promise<SearchResponse> {
  const searchParams =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== "")
            .map(([k, v]) => [k, String(v)]),
        );

  const response = await fetch(`${API_BASE}/search?${searchParams.toString()}`, {
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchSearchSuggestions(
  query: string,
  locale = "en",
  limit = 8,
): Promise<SuggestionItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const qs = new URLSearchParams({
    q: trimmed,
    locale,
    limit: String(limit),
  });

  try {
    const response = await fetch(`${API_BASE}/search/suggestions?${qs.toString()}`);
    if (!response.ok) return [];
    const data: SearchSuggestionsResponse = await response.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}

export async function fetchDiscoveryLanding(
  locale = "en",
): Promise<DiscoveryLandingResponse> {
  const qs = new URLSearchParams({ locale });
  const response = await fetch(`${API_BASE}/search/discovery?${qs.toString()}`, {
    next: {
      revalidate: 120,
    },
  });

  if (!response.ok) {
    return {
      featured_destinations: [],
      popular_categories: [],
      popular_districts: [],
    };
  }

  return response.json();
}
