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

export type TemplateFieldType =
  (typeof TEMPLATE_FIELD_TYPES)[number];

export type TemplateStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export interface TemplateField {
  id: string;
  key: string;
  label: string;
  field_type: TemplateFieldType;
  required: boolean;
  translatable: boolean;
  order: number;
  group: string | null;
  help_text: string | null;
  config: Record<string, unknown>;
}

export interface ContentTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  status: TemplateStatus;
  fields: TemplateField[];
}
