export type FieldType =
  | 'TEXT'
  | 'RICHTEXT'
  | 'IMAGE'
  | 'GALLERY'
  | 'GEO_POINT'
  | 'MAP_REGION'
  | 'DROPDOWN'
  | 'TAGS'
  | 'VIDEO'
  | 'AUDIO'
  | 'DATE'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'RELATION';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type EntryStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface TemplateField {
  id?: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidationRule;
  isSearchable?: boolean;
  isFilterable?: boolean;
}

export interface ContentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  version: number;
  status: TemplateStatus;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentEntry {
  id: string;
  templateId: string;
  template?: ContentTemplate;
  title: string;
  slug: string;
  status: EntryStatus;
  data: Record<string, any>;
  /** @deprecated Use latitude instead */
  lat?: number | null;
  /** @deprecated Use longitude instead */
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  district?: string | null;
  division?: string | null;
  publishedAt?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  fields: Omit<TemplateField, 'id'>[];
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  icon?: string;
  fields?: TemplateField[];
}

export interface CreateEntryInput {
  templateId: string;
  title: string;
  slug?: string;
  status?: EntryStatus;
  data: Record<string, any>;
  latitude?: number;
  longitude?: number;
  region?: string;
  district?: string;
  division?: string;
}

export interface UpdateEntryInput {
  title?: string;
  slug?: string;
  status?: EntryStatus;
  data?: Record<string, any>;
  latitude?: number;
  longitude?: number;
  region?: string;
  district?: string;
  division?: string;
}
