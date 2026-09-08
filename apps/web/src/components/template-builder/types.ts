export type FieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'RICHTEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'DATETIME'
  | 'IMAGE'
  | 'GALLERY'
  | 'VIDEO'
  | 'AUDIO'
  | 'GEO_POINT'
  | 'MAP_REGION'
  | 'DROPDOWN'
  | 'MULTISELECT'
  | 'TAGS'
  | 'RELATION';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
  allowedTypes?: string[];
  maxFiles?: number;
  default?: unknown;
  helpText?: string;
  placeholder?: string;
  relationTarget?: string;
}

export interface TemplateFieldConfig {
  id?: string;
  key: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  translatable?: boolean;
  options?: FieldOptions | null;
}

export interface ContentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  version: number;
  fields: TemplateFieldConfig[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentEntry {
  id: string;
  templateId: string;
  template?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    fields?: TemplateFieldConfig[];
  };
  data: Record<string, any>;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
  authorId: string;
  reviewedBy?: string | null;
  reviewNote?: string | null;
  region?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
  updatedAt: string;
}
