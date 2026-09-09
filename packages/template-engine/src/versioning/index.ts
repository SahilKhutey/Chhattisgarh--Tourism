import { TemplateSchema } from "../schema/types.js";

export interface TemplateSnapshot {
  id: string;
  name: string;
  slug: string;
  version: number;
  fields: Array<{
    key: string;
    label: string;
    fieldType: string;
    required: boolean;
    order: number;
    translatable: boolean;
    helpText?: string | null;
    options?: unknown;
  }>;
}

export function createTemplateSnapshot(template: TemplateSchema): TemplateSnapshot {
  return {
    id: template.id || template.metadata?.slug || 'template',
    name: template.metadata?.name ?? '',
    slug: template.metadata?.slug ?? '',
    version: template.version,
    fields: template.fields.map((f) => ({
      key: f.key,
      label: f.label,
      fieldType: f.fieldType,
      required: Boolean(f.required),
      order: f.order,
      translatable: f.translatable ?? true,
      helpText: f.helpText ?? null,
      options: f.options,
    })),
  };
}
