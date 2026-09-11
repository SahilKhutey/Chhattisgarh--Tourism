export type PublicFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "RICHTEXT"
  | "IMAGE"
  | "GALLERY"
  | "GEO_POINT"
  | "MAP_REGION"
  | "DROPDOWN"
  | "MULTI_SELECT"
  | "TAGS"
  | "VIDEO"
  | "AUDIO"
  | "DATE"
  | "DATETIME"
  | "TIME"
  | "NUMBER"
  | "BOOLEAN"
  | "RELATION";

export interface PublicField {
  key: string;
  label: string;
  type: PublicFieldType;
  value: unknown;
  group: string | null;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface PublicContent {
  id: string;
  slug: string;
  template_id: string;
  template_version: number;
  locale: string;
  name?: string | null;
  description?: string | null;
  fields: PublicField[];
  canonical_url: string;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  breadcrumbs: BreadcrumbItem[];
}
