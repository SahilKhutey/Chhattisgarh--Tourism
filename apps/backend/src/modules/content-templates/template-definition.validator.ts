import { BadRequestException } from '@nestjs/common';

export const CANONICAL_FIELD_TYPES = [
  'TEXT',
  'RICHTEXT',
  'IMAGE',
  'GALLERY',
  'GEO_POINT',
  'MAP_REGION',
  'DROPDOWN',
  'TAGS',
  'VIDEO',
  'AUDIO',
  'DATE',
  'NUMBER',
  'BOOLEAN',
  'RELATION',
] as const;

export type CanonicalFieldType = (typeof CANONICAL_FIELD_TYPES)[number];

export interface TemplateDefinitionField {
  key: string;
  label: string;
  fieldType: string;
  required?: boolean;
  order?: number;
  options?: Array<{ label: string; value: string }>;
  validation?: Record<string, any>;
}

export interface TemplateDefinition {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  fields: TemplateDefinitionField[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class TemplateDefinitionValidator {
  static validate(definition: TemplateDefinition): ValidationResult {
    const errors: string[] = [];

    // 1. Template Name Validation
    if (!definition.name || typeof definition.name !== 'string' || !definition.name.trim()) {
      errors.push('Template name is required and must not be empty');
    } else if (definition.name.trim().length < 2 || definition.name.trim().length > 100) {
      errors.push('Template name must be between 2 and 100 characters');
    }

    // 2. Template Slug Validation
    if (!definition.slug || typeof definition.slug !== 'string' || !definition.slug.trim()) {
      errors.push('Template slug is required and must not be empty');
    } else {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(definition.slug.trim())) {
        errors.push(
          'Template slug must contain only lowercase letters, numbers, and single hyphens between words',
        );
      } else if (definition.slug.trim().length < 2 || definition.slug.trim().length > 100) {
        errors.push('Template slug must be between 2 and 100 characters');
      }
    }

    // 3. Fields Array Validation
    if (!Array.isArray(definition.fields) || definition.fields.length === 0) {
      errors.push('Template must have at least one field defined');
      return { valid: false, errors };
    }

    const seenKeys = new Set<string>();
    const keyRegex = /^[a-z0-9_]+$/;

    definition.fields.forEach((field, index) => {
      const prefix = `Field at index ${index}`;

      // Field Key
      if (!field.key || typeof field.key !== 'string' || !field.key.trim()) {
        errors.push(`${prefix}: key is required`);
      } else {
        const trimmedKey = field.key.trim();
        if (!keyRegex.test(trimmedKey)) {
          errors.push(
            `${prefix} ("${trimmedKey}"): key must contain only lowercase letters, numbers, and underscores`,
          );
        }
        if (seenKeys.has(trimmedKey)) {
          errors.push(
            `${prefix}: duplicate field key "${trimmedKey}" detected. Field keys must be unique.`,
          );
        }
        seenKeys.add(trimmedKey);
      }

      // Field Label
      if (!field.label || typeof field.label !== 'string' || !field.label.trim()) {
        errors.push(`${prefix}: label is required`);
      }

      // Field Type
      if (!field.fieldType || !CANONICAL_FIELD_TYPES.includes(field.fieldType as any)) {
        errors.push(
          `${prefix}: invalid fieldType "${field.fieldType}". Must be one of: ${CANONICAL_FIELD_TYPES.join(
            ', ',
          )}`,
        );
      }

      // Dropdown Options Check
      if (field.fieldType === 'DROPDOWN') {
        if (!Array.isArray(field.options) || field.options.length === 0) {
          errors.push(`${prefix}: DROPDOWN field must define at least one option`);
        } else {
          field.options.forEach((opt, optIdx) => {
            if (!opt.label || !opt.value) {
              errors.push(
                `${prefix} option ${optIdx}: each dropdown option must have both a label and a value`,
              );
            }
          });
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateOrThrow(definition: TemplateDefinition): void {
    const result = this.validate(definition);
    if (!result.valid) {
      throw new BadRequestException({
        message: 'Invalid template definition',
        errors: result.errors,
      });
    }
  }
}
