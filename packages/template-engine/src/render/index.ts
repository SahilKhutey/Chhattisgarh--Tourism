import { TemplateField } from "../schema/types.js";

export interface RenderContext {
  locale?: string;
  mediaBaseUrl?: string;
}

export interface RenderedFieldOutput {
  key: string;
  label: string;
  type: string;
  formattedValue: string | number | boolean | unknown[];
}

export function formatFieldValue(
  field: TemplateField,
  value: unknown,
  _context?: RenderContext,
): RenderedFieldOutput {
  return {
    key: field.key,
    label: field.label,
    type: field.fieldType,
    formattedValue: value as any,
  };
}
