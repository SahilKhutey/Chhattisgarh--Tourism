/**
 * @cg-tourism/template-engine - Validation Error & Result Contracts
 */

export interface ValidationError {
  fieldKey: string;
  code: string;
  message: string;
  path?: string;
  context?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function createValidResult(): ValidationResult {
  return {
    valid: true,
    errors: [],
  };
}

export function createInvalidResult(errors: ValidationError[]): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const combinedErrors: ValidationError[] = [];
  for (const r of results) {
    if (r && Array.isArray(r.errors)) {
      combinedErrors.push(...r.errors);
    }
  }
  return {
    valid: combinedErrors.length === 0,
    errors: combinedErrors,
  };
}
