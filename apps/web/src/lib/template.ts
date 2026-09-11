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

export interface QueryTemplatesParams {
  search?: string;
  status?: TemplateStatus | 'ALL';
  category?: string;
  sortBy?: 'name' | 'updatedAt' | 'entryCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedTemplates {
  items: ContentTemplate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TemplateVersionItem {
  id: string;
  templateId: string;
  version: number;
  publishedAt: string;
  createdBy: string;
  createdById?: string;
  fieldCount: number;
  snapshot?: any;
}

export interface VersionDiffItem {
  fromVersion: number;
  toVersion: number;
  changes: Array<{
    key: string;
    type: 'ADDED' | 'REMOVED' | 'MODIFIED';
    changeType: 'BREAKING' | 'SAFE';
    fieldLabel?: string;
    detail: string;
  }>;
  riskLevel: 'SAFE' | 'BREAKING';
  breakingChanges: any[];
  safeChanges: any[];
  summary: string;
}

export async function fetchTemplates(
  params?: TemplateStatus | QueryTemplatesParams,
): Promise<any> {
  const queryParams = new URLSearchParams();
  if (typeof params === 'string') {
    queryParams.set('status', params);
  } else if (params) {
    if (params.search) queryParams.set('search', params.search);
    if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
    if (params.category && params.category !== 'ALL') queryParams.set('category', params.category);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    if (params.page) queryParams.set('page', String(params.page));
    if (params.pageSize) queryParams.set('pageSize', String(params.pageSize));
  }
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  // Fall back between /admin/templates and /content-templates
  try {
    return await fetchApi<any>(`/admin/templates${query}`);
  } catch {
    return await fetchApi<any>(`/content-templates${query}`);
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

export async function duplicateTemplate(id: string): Promise<ContentTemplate> {
  return await fetchApi<ContentTemplate>(`/admin/templates/${id}/duplicate`, {
    method: 'POST',
  });
}

export async function archiveTemplate(id: string): Promise<ContentTemplate> {
  return await fetchApi<ContentTemplate>(`/admin/templates/${id}/archive`, {
    method: 'PATCH',
  });
}

export async function fetchTemplateVersions(
  templateId: string,
): Promise<TemplateVersionItem[]> {
  return await fetchApi<TemplateVersionItem[]>(`/admin/templates/${templateId}/versions`);
}

export async function fetchTemplateVersionDiff(
  templateId: string,
  version: number,
): Promise<VersionDiffItem> {
  return await fetchApi<VersionDiffItem>(
    `/admin/templates/${templateId}/versions/${version}/diff`,
  );
}

export async function rollbackTemplate(
  templateId: string,
  targetVersion: number,
): Promise<ContentTemplate> {
  return await fetchApi<ContentTemplate>(`/admin/templates/${templateId}/rollback`, {
    method: 'POST',
    body: JSON.stringify({ targetVersion }),
  });
}

export async function updateTemplateFields(
  templateId: string,
  fields: any[],
): Promise<ContentTemplate> {
  return await fetchApi<ContentTemplate>(`/admin/templates/${templateId}/fields`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
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
