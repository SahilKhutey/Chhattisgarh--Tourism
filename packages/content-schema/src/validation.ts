import { TemplateFieldDefinition } from './types';

export interface FieldValidationError {
  fieldKey: string;
  message: string;
}

export function validateFieldValue(
  field: TemplateFieldDefinition,
  value: unknown,
): string | null {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    return `${field.label} is required`;
  }

  if (isEmpty) {
    return null;
  }

  switch (field.fieldType) {
    case 'TEXT':
    case 'TEXTAREA':
    case 'RICHTEXT': {
      if (typeof value !== 'string') {
        return `${field.label} must be text`;
      }
      const options = (field.options || {}) as Record<string, any>;
      if (typeof options.minLength === 'number' && value.length < options.minLength) {
        return `${field.label} is too short`;
      }
      if (typeof options.maxLength === 'number' && value.length > options.maxLength) {
        return `${field.label} is too long`;
      }
      break;
    }

    case 'NUMBER': {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return `${field.label} must be a valid number`;
      }
      break;
    }

    case 'BOOLEAN': {
      if (typeof value !== 'boolean') {
        return `${field.label} must be boolean`;
      }
      break;
    }

    case 'TAGS': {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        return `${field.label} must be an array of strings`;
      }
      break;
    }

    case 'GEO_POINT': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return `${field.label} must contain latitude and longitude`;
      }
      const point = value as Record<string, unknown>;
      if (typeof point.lat !== 'number' || typeof point.lng !== 'number') {
        return `${field.label} requires numeric lat/lng`;
      }
      if (point.lat < -90 || point.lat > 90) {
        return `${field.label} latitude is invalid`;
      }
      if (point.lng < -180 || point.lng > 180) {
        return `${field.label} longitude is invalid`;
      }
      break;
    }

    case 'DROPDOWN': {
      if (typeof value !== 'string') {
        return `${field.label} must be a string`;
      }
      const options = (field.options as any)?.values;
      if (Array.isArray(options) && !options.includes(value)) {
        return `${field.label} contains an invalid option`;
      }
      break;
    }

    case 'DATE': {
      if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        return `${field.label} must be a valid date`;
      }
      break;
    }

    default:
      break;
  }

  return null;
}

export function validateContentEntryData(
  fields: TemplateFieldDefinition[],
  data: Record<string, unknown>,
): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  for (const field of fields) {
    const error = validateFieldValue(field, data[field.key]);
    if (error) {
      errors.push({ fieldKey: field.key, message: error });
    }
  }

  return errors;
}
