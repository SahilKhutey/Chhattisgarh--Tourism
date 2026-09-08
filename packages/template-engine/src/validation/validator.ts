/**
 * @cg-tourism/template-engine - Entry Validator
 * Validates ContentEntry data against a published TemplateSchema snapshot.
 */

import { fieldTypeRegistry, FieldTypeRegistry } from '../field-types/registry';
import { TemplateSchema } from '../schema/types';
import {
  createInvalidResult,
  createValidResult,
  ValidationError,
  ValidationResult,
} from './errors';

export interface ValidateEntryOptions {
  mode?: 'DRAFT' | 'STRICT';
  registry?: FieldTypeRegistry;
  locale?: string;
}

export function validateTemplateEntry(
  data: Record<string, unknown> | null | undefined,
  schema: TemplateSchema,
  options?: ValidateEntryOptions,
): ValidationResult {
  const mode = options?.mode ?? 'STRICT';
  const registry = options?.registry ?? fieldTypeRegistry;
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return createInvalidResult([
      {
        fieldKey: '_root',
        code: 'INVALID_ENTRY_DATA',
        message: 'ContentEntry data must be an object payload.',
      },
    ]);
  }

  for (const field of schema.fields) {
    const value = data[field.key];
    const isMissing = value === undefined || value === null || value === '';

    // In STRICT mode, required fields must have non-empty values
    if (mode === 'STRICT' && field.required && isMissing) {
      errors.push({
        fieldKey: field.key,
        code: 'REQUIRED_FIELD_MISSING',
        message: `Field "${field.label}" (${field.key}) is required.`,
        path: field.key,
      });
      continue;
    }

    // If value is provided, validate through registered field type definition
    if (!isMissing && registry.has(field.fieldType)) {
      const handler = registry.get(field.fieldType);
      if (handler) {
        const fieldResult = handler.validateValue(value, field.options, {
          mode,
          locale: options?.locale,
          templateSlug: schema.templateSlug,
        });

        if (!fieldResult.valid) {
          for (const err of fieldResult.errors) {
            errors.push({
              ...err,
              fieldKey: field.key,
              path: err.path ? `${field.key}.${err.path}` : field.key,
            });
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    return createInvalidResult(errors);
  }

  return createValidResult();
}
