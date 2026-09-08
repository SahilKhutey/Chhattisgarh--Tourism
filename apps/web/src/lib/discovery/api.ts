import { fetchApi } from '../api';
import {
  DiscoveryResponse,
  DiscoveryResult,
  NearbyParams,
  SearchParams,
} from './types';

export async function searchContent(
  params: SearchParams = {},
): Promise<DiscoveryResponse> {
  const query = new URLSearchParams();

  if (params.q?.trim()) query.set('q', params.q.trim());
  if (params.templateId) query.set('templateId', params.templateId);
  if (params.region) query.set('region', params.region);
  if (params.division) query.set('division', params.division);
  if (params.district) query.set('district', params.district);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : '';
  return await fetchApi<DiscoveryResponse>(`/discovery/search${qs}`);
}

export async function fetchNearbyContent(
  params: NearbyParams,
): Promise<DiscoveryResult[]> {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
  });

  if (params.radiusKm) query.set('radiusKm', String(params.radiusKm));
  if (params.limit) query.set('limit', String(params.limit));

  return await fetchApi<DiscoveryResult[]>(`/discovery/nearby?${query.toString()}`);
}

export async function fetchSearchSuggestions(
  query: string,
  limit = 8,
): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  const qs = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });

  return await fetchApi<string[]>(`/discovery/suggestions?${qs.toString()}`);
}

export async function fetchBoundsContent(
  north: number,
  south: number,
  east: number,
  west: number,
): Promise<DiscoveryResult[]> {
  const qs = new URLSearchParams({
    north: String(north),
    south: String(south),
    east: String(east),
    west: String(west),
  });

  return await fetchApi<DiscoveryResult[]>(`/discovery/bounds?${qs.toString()}`);
}
