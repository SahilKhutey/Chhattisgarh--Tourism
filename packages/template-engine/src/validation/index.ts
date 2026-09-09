import { TemplateSchema, TemplateField } from "../schema/types.js";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEntryData(
  template: TemplateSchema | { fields: TemplateField[] },
  data: Record<string, unknown>,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const fields = template.fields;

  for (const field of fields) {
    const value = data[field.key];
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: field.key,
        message: `${field.label} is required.`,
      });
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (field.fieldType === 'TEXT' && typeof value !== 'string') {
      errors.push({
        field: field.key,
        message: `${field.label} must be text.`,
      });
    } else if (field.fieldType === 'NUMBER' && typeof value !== 'number') {
      errors.push({
        field: field.key,
        message: `${field.label} must be a number.`,
      });
    } else if (field.fieldType === 'BOOLEAN' && typeof value !== 'boolean') {
      errors.push({
        field: field.key,
        message: `${field.label} must be a boolean.`,
      });
    }
  }

  return errors;
}
