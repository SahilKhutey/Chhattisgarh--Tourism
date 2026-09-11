export const TEMPLATE_FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "RICHTEXT",
  "IMAGE",
  "GALLERY",
  "GEO_POINT",
  "MAP_REGION",
  "DROPDOWN",
  "MULTI_SELECT",
  "TAGS",
  "VIDEO",
  "AUDIO",
  "DATE",
  "DATETIME",
  "TIME",
  "NUMBER",
  "BOOLEAN",
  "RELATION",
] as const;

export type TemplateFieldType = typeof TEMPLATE_FIELD_TYPES[number];

export interface SelectOption {
  value: string;
  label: string;
}

export interface GeoBounds {
  min_latitude: number;
  max_latitude: number;
  min_longitude: number;
  max_longitude: number;
}

export interface TemplateFieldConfig {
  options?: SelectOption[];
  relation_template_slug?: string;
  min?: number;
  max?: number;
  step?: number;
  max_items?: number;
  accept?: string[];
  bounds?: GeoBounds;
  require_alt_text?: boolean;
}

export interface TemplateField {
  key: string;
  label: string;
  type: TemplateFieldType;
  required: boolean;
  translatable: boolean;
  order: number;
  group: string | null;
  helpText: string | null;
  config: TemplateFieldConfig;
}

export interface ContentTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  published_version_id?: string | null;
  published_version_number?: number | null;
  fields: TemplateField[];
  updated_at: string;
}

