export interface TemplateVersionField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  translatable: boolean;
  order: number;
  group?: string | null;
  helpText?: string | null;
  config: Record<string, unknown>;
}

export interface TemplateVersionListItem {
  id: string;
  version_number: number;
  schema_hash: string;
  breaking_change: boolean;
  risk_summary: {
    risk_level?: string;
    added?: number;
    removed?: number;
    changed?: number;
    reordered?: number;
    actions?: Array<{
      type: string;
      reason: string;
    }>;
  };
  created_by: string;
  created_at: string;
  is_published: boolean;
}

export interface TemplateVersionResponse {
  id: string;
  template_id: string;
  version_number: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  category?: string | null;
  schema_hash: string;
  breaking_change: boolean;
  risk_summary: Record<string, unknown>;
  created_by: string;
  created_at: string;
  status: string;
  fields: TemplateVersionField[];
}

export interface FieldChange {
  key: string;
  change: string;
  breaking: boolean;
  before?: unknown;
  after?: unknown;
}

export interface VersionDiffResponse {
  version: number;
  against: number | null;
  breaking: boolean;
  added: FieldChange[];
  removed: FieldChange[];
  changed: FieldChange[];
  reordered: FieldChange[];
  metadata_changes: Array<{
    field: string;
    before: unknown;
    after: unknown;
  }>;
  risk: {
    breaking: boolean;
    added: number;
    removed: number;
    changed: number;
    reordered: number;
    risk_level: string;
    actions: Array<{
      type: string;
      reason: string;
    }>;
  };
  diff: boolean | null;
}
