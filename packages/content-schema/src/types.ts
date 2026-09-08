import { FieldType } from './field-types';

export interface TemplateFieldDefinition {
  id: string;
  key: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  options?: Record<string, unknown> | null;
  translatable: boolean;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ContentEntryData {
  [key: string]: unknown;
}

export interface ContentEntry {
  id: string;
  templateId: string;
  templateVersion: number;
  slug: string;
  data: ContentEntryData;
  status: string;
  authorId: string;
  region?: string | null;
  district?: string | null;
  division?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'DELETED';
