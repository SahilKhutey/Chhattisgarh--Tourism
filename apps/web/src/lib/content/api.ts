import { fetchApi } from '../api';
import {
  ContentEntry,
  CreateEntryInput,
  UpdateEntryInput,
  ReviewEntryPayload,
  BoundingBoxQuery,
} from './types';

export async function createEntry(
  input: CreateEntryInput,
): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>('/entries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateEntry(
  id: string,
  input: UpdateEntryInput,
): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>(`/entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function submitEntry(id: string): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>(`/entries/${id}/submit`, {
    method: 'POST',
  });
}

export async function reviewEntry(
  id: string,
  payload: ReviewEntryPayload,
): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>(`/entries/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchEntries(
  templateId?: string,
  status?: string,
  region?: string,
  district?: string,
): Promise<ContentEntry[]> {
  const params = new URLSearchParams();
  if (templateId) params.append('templateId', templateId);
  if (status && status !== 'all') params.append('status', status);
  if (region) params.append('region', region);
  if (district) params.append('district', district);
  const query = params.toString() ? `?${params.toString()}` : '';

  return await fetchApi<ContentEntry[]>(`/entries${query}`);
}

export async function fetchPublicEntries(
  templateId?: string,
  region?: string,
  district?: string,
): Promise<ContentEntry[]> {
  return fetchEntries(templateId, 'PUBLISHED', region, district);
}

export async function fetchMapEntries(
  bbox?: Partial<BoundingBoxQuery>,
): Promise<ContentEntry[]> {
  const params = new URLSearchParams();
  if (bbox?.north !== undefined) params.append('north', String(bbox.north));
  if (bbox?.south !== undefined) params.append('south', String(bbox.south));
  if (bbox?.east !== undefined) params.append('east', String(bbox.east));
  if (bbox?.west !== undefined) params.append('west', String(bbox.west));
  const query = params.toString() ? `?${params.toString()}` : '';

  return await fetchApi<ContentEntry[]>(`/entries/map${query}`);
}

export async function fetchPublicEntryBySlug(
  templateSlug: string,
  entrySlug: string,
): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>(`/content/${templateSlug}/${entrySlug}`);
}

export async function fetchEntryById(id: string): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>(`/entries/${id}`);
}
