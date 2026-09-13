import { fetchApi } from '../../../lib/api';

export interface DiscoveryPlace {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters?: number | null;
  heroImage?: string;
  district?: string;
  districtSlug?: string;
  zone?: string;
  zoneSlug?: string;
  category?: string;
  categorySlug?: string;
  distanceMeters?: number;
  score?: number;
}

export interface SearchResultResponse {
  data: DiscoveryPlace[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchSuggestion {
  type: 'place' | 'district' | 'category';
  name: string;
  slug: string;
}

export interface DistrictSummary {
  id: string;
  name: string;
  slug: string;
  code?: string;
  latitude: number;
  longitude: number;
  places?: Array<{ id: string; name: string; slug: string; heroImage?: string }>;
}

export async function searchPlaces(params: {
  q?: string;
  district?: string;
  zone?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  offset?: number;
}): Promise<SearchResultResponse> {
  const query = new URLSearchParams();

  if (params.q?.trim()) query.set('q', params.q.trim());
  if (params.district) query.set('district', params.district);
  if (params.zone) query.set('zone', params.zone);
  if (params.category) query.set('category', params.category);
  if (params.latitude !== undefined) query.set('latitude', String(params.latitude));
  if (params.longitude !== undefined) query.set('longitude', String(params.longitude));
  if (params.radius !== undefined) query.set('radius', String(params.radius));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  const qs = query.toString() ? `?${query.toString()}` : '';
  const response = await fetchApi<any>(`/discovery/search${qs}`);

  if (response.data && Array.isArray(response.data)) {
    return response as SearchResultResponse;
  }

  // Handle fallback mapping if legacy shape
  if (response.items && Array.isArray(response.items)) {
    return {
      data: response.items.map((i: any) => ({
        id: i.id,
        name: i.title || i.name,
        slug: i.slug,
        shortDescription: i.data?.shortDescription || '',
        latitude: i.lat || 0,
        longitude: i.lng || 0,
        heroImage: i.data?.heroImage || '',
        district: i.district,
        score: i.score,
      })),
      total: response.pagination?.total || response.items.length,
      limit: response.pagination?.limit || 20,
      offset: 0,
    };
  }

  return { data: [], total: 0, limit: 20, offset: 0 };
}

export async function fetchNearbyPlaces(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}): Promise<DiscoveryPlace[]> {
  const query = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
  });

  if (params.radius !== undefined) query.set('radius', String(params.radius));
  if (params.limit !== undefined) query.set('limit', String(params.limit));

  return fetchApi<DiscoveryPlace[]>(`/discovery/nearby?${query.toString()}`);
}

export async function fetchMapPlaces(params: {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom?: number;
  category?: string;
  limit?: number;
}): Promise<DiscoveryPlace[]> {
  const query = new URLSearchParams({
    north: String(params.north),
    south: String(params.south),
    east: String(params.east),
    west: String(params.west),
  });

  if (params.zoom !== undefined) query.set('zoom', String(params.zoom));
  if (params.category) query.set('category', params.category);
  if (params.limit !== undefined) query.set('limit', String(params.limit));

  return fetchApi<DiscoveryPlace[]>(`/discovery/map?${query.toString()}`);
}

export async function fetchSearchSuggestions(
  query: string,
  limit = 8,
): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  const qs = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });

  try {
    const response = await fetchApi<{ data: SearchSuggestion[] } | string[]>(
      `/discovery/suggestions?${qs.toString()}`,
    );

    if (response && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response)) {
      return response.map((name) => ({
        type: 'place' as const,
        name: typeof name === 'string' ? name : (name as any).name,
        slug: (name as any).slug || (typeof name === 'string' ? name.toLowerCase().replace(/\s+/g, '-') : ''),
      }));
    }

    return [];
  } catch {
    return [];
  }
}

export async function fetchDistricts(): Promise<DistrictSummary[]> {
  return fetchApi<DistrictSummary[]>('/discovery/districts');
}

export async function fetchDivisions(): Promise<any[]> {
  return fetchApi<any[]>('/discovery/divisions');
}

export async function fetchDistrictDetail(slug: string): Promise<any> {
  return fetchApi<any>(`/discovery/districts/${slug}`);
}

export async function fetchCategoryDetail(slug: string): Promise<any> {
  return fetchApi<any>(`/discovery/categories/${slug}`);
}

export async function fetchRouteDetail(slug: string): Promise<any> {
  return fetchApi<any>(`/discovery/routes/${slug}`);
}
