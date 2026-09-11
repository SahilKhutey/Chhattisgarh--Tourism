import type { TemplateField } from "./field.js";
import type { FieldGroup, TemplateStatus } from "./field-types.js";

export interface TemplateMetadata {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface Template {
  id: string;
  metadata: TemplateMetadata;
  status: TemplateStatus;
  currentVersion: number | null;
  fields: TemplateField[];
  groups: FieldGroup[];
  createdAt: string;
  updatedAt: string;
}
