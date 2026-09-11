import type { TemplateField } from "./field.js";

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  fields: TemplateField[];
  publishedBy: string;
  publishedAt: string;
  checksum: string;
}
