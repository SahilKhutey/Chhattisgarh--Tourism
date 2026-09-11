export type ContentEntryStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED";

export interface ContentEntry {
  id: string;
  template_id: string;
  template_version_id: string;
  slug: string;
  title: string;
  status: ContentEntryStatus;
  values: Record<string, unknown>;
  locale_values: Record<string, Record<string, unknown>>;
  revision: number;
  created_by?: string;
  updated_by?: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  schema_state?: "CURRENT" | "STALE";
  template_name?: string | null;
  template_version_number?: number | null;
  live_template_version?: number | null;
}

export interface RuntimeField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  translatable: boolean;
  order: number;
  group: string | null;
  helpText: string | null;
  config: Record<string, unknown>;
}

export interface RuntimeSchema {
  template: {
    id: string;
    slug: string;
    version: number;
  };
  fields: RuntimeField[];
}

export interface PublicContentField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  group: string | null;
  value: unknown;
  config: Record<string, unknown>;
}

export interface PublicContent {
  template: {
    id: string;
    slug: string;
    version: number;
  };
  entry: {
    id: string;
    slug: string;
    title: string;
  };
  fields: PublicContentField[];
}

export interface ContentEntryListResponse {
  items: ContentEntry[];
  total: number;
  page: number;
  page_size: number;
}
