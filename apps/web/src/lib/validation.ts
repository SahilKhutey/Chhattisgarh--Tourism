import { TemplateField } from '../types/content';

export function validateField(
  field: TemplateField,
  value: any,
): string | null {
  const isPresent =
    value !== undefined &&
    value !== null &&
    (typeof value !== 'string' || value.trim() !== '') &&
    (!Array.isArray(value) || value.length > 0);

  // 1. Required Check
  if (field.required) {
    if (!isPresent) {
      return `${field.label} is required`;
    }

    if (field.type === 'GEO_POINT') {
      if (
        typeof value !== 'object' ||
        value.lat === undefined ||
        value.lat === null ||
        value.lat === '' ||
        value.lng === undefined ||
        value.lng === null ||
        value.lng === ''
      ) {
        return `${field.label} requires latitude and longitude`;
      }
    }
  }

  // If empty and not required, skip further checks
  if (!isPresent) {
    return null;
  }

  const rules = field.validation;

  // 2. Type-Specific Validation
  switch (field.type) {
    case 'TEXT':
    case 'RICHTEXT': {
      const strVal = String(value);
      if (rules?.minLength !== undefined && strVal.length < rules.minLength) {
        return `${field.label} must be at least ${rules.minLength} characters`;
      }
      if (rules?.maxLength !== undefined && strVal.length > rules.maxLength) {
        return `${field.label} cannot exceed ${rules.maxLength} characters`;
      }
      if (rules?.pattern) {
        try {
          const regex = new RegExp(rules.pattern);
          if (!regex.test(strVal)) {
            return (
              rules.patternMessage ||
              `${field.label} does not match the required pattern`
            );
          }
        } catch {
          // Ignore invalid regex in config
        }
      }
      break;
    }

    case 'NUMBER': {
      const num = Number(value);
      if (isNaN(num)) {
        return `${field.label} must be a valid number`;
      }
      if (rules?.min !== undefined && num < rules.min) {
        return `${field.label} must be at least ${rules.min}`;
      }
      if (rules?.max !== undefined && num > rules.max) {
        return `${field.label} cannot exceed ${rules.max}`;
      }
      break;
    }

    case 'GEO_POINT': {
      if (typeof value === 'object' && value !== null) {
        const lat = Number(value.lat);
        const lng = Number(value.lng);

        if (isNaN(lat) || lat < -90 || lat > 90) {
          return `${field.label} latitude must be between -90 and 90`;
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          return `${field.label} longitude must be between -180 and 180`;
        }
      }
      break;
    }

    case 'DROPDOWN': {
      if (field.options && field.options.length > 0) {
        const validValues = field.options.map((o) => o.value);
        if (!validValues.includes(String(value))) {
          return `${field.label} has an invalid selection`;
        }
      }
      break;
    }

    case 'DATE': {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `${field.label} must be a valid date`;
      }
      break;
    }

    case 'IMAGE':
    case 'VIDEO':
    case 'AUDIO': {
      if (typeof value === 'string' && value.trim()) {
        const urlPattern = /^(https?:\/\/|\/)/;
        if (!urlPattern.test(value.trim())) {
          return `${field.label} must be a valid URL or path`;
        }
      }
      break;
    }

    case 'GALLERY': {
      if (Array.isArray(value)) {
        const urlPattern = /^(https?:\/\/|\/)/;
        for (const item of value) {
          if (typeof item === 'string' && item.trim() && !urlPattern.test(item.trim())) {
            return `${field.label} contains an invalid image URL`;
          }
        }
      }
      break;
    }

    default:
      break;
  }

  return null;
}

export function validateEntry(
  fields: TemplateField[],
  data: Record<string, any>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const error = validateField(field, data[field.key]);
    if (error) {
      errors[field.key] = error;
    }
  }

  return errors;
}
