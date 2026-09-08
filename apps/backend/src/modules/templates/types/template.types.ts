export type TemplateFieldType =
  | 'TEXT'
  | 'TEXTAREA'
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
  | 'DATETIME'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'RELATION';

export interface TemplateFieldDefinition {
  id: string;
  key: string;
  label: string;
  fieldType: TemplateFieldType;
  required: boolean;
  order: number;
  options?: Record<string, unknown> | null;
  helpText?: string | null;
  translatable: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  fields: TemplateFieldDefinition[];
}
