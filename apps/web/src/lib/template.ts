import { fetchApi } from './api';
import {
  ContentEntry,
  ContentTemplate,
  CreateEntryInput,
  CreateTemplateInput,
  EntryStatus,
  TemplateStatus,
  UpdateEntryInput,
  UpdateTemplateInput,
} from '../types/content';

export async function fetchTemplates(
  status?: TemplateStatus,
): Promise<ContentTemplate[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  // Fall back between /admin/templates and /content-templates
  try {
    return await fetchApi<ContentTemplate[]>(`/admin/templates${query}`);
  } catch {
    return await fetchApi<ContentTemplate[]>(`/content-templates${query}`);
  }
}

export async function fetchTemplate(idOrSlug: string): Promise<ContentTemplate> {
  try {
    return await fetchApi<ContentTemplate>(`/admin/templates/${idOrSlug}`);
  } catch {
    return await fetchApi<ContentTemplate>(`/content-templates/${idOrSlug}`);
  }
}

export async function createTemplate(
  input: CreateTemplateInput,
): Promise<ContentTemplate> {
  return await fetchApi<ContentTemplate>('/admin/templates', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput,
): Promise<ContentTemplate> {
  return await fetchApi<ContentTemplate>(`/admin/templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function publishTemplate(id: string): Promise<ContentTemplate> {
  return await fetchApi<ContentTemplate>(`/admin/templates/${id}/publish`, {
    method: 'POST',
  });
}

export async function fetchEntries(
  templateId?: string,
  status?: EntryStatus,
): Promise<ContentEntry[]> {
  const params = new URLSearchParams();
  if (templateId) params.append('templateId', templateId);
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';

  return await fetchApi<ContentEntry[]>(`/content-entries${query}`);
}

export async function fetchEntry(idOrSlug: string): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>(`/content-entries/${idOrSlug}`);
}

export async function createEntry(
  input: CreateEntryInput,
): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>('/content-entries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateEntry(
  id: string,
  input: UpdateEntryInput,
): Promise<ContentEntry> {
  return await fetchApi<ContentEntry>(`/content-entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
