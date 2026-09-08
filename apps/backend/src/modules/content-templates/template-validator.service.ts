import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  FieldType,
  TemplateField,
} from '@prisma/client';

@Injectable()
export class TemplateValidatorService {
  validate(
    fields: TemplateField[],
    data: Record<string, unknown>,
  ): void {
    const errors: string[] = [];

    const fieldKeys = new Set(fields.map((field) => field.key));

    for (const key of Object.keys(data)) {
      if (!fieldKeys.has(key)) {
        errors.push(`Unknown field: ${key}`);
      }
    }

    for (const field of fields) {
      const value = data[field.key];

      if (field.required && this.isEmpty(value)) {
        errors.push(`${field.label} is required`);
        continue;
      }

      if (this.isEmpty(value)) {
        continue;
      }

      switch (field.fieldType) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA:
        case FieldType.RICHTEXT:
          this.validateText(field, value, errors);
          break;

        case FieldType.NUMBER:
          this.validateNumber(field, value, errors);
          break;

        case FieldType.BOOLEAN:
          if (typeof value !== 'boolean') {
            errors.push(`${field.label} must be boolean`);
          }
          break;

        case FieldType.GEO_POINT:
          this.validateGeoPoint(field, value, errors);
          break;

        case FieldType.DROPDOWN:
          this.validateDropdown(field, value, errors);
          break;

        case FieldType.TAGS:
        case FieldType.MULTISELECT:
          if (!Array.isArray(value)) {
            errors.push(`${field.label} must be an array`);
          }
          break;
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Content validation failed',
        errors,
      });
    }
  }

  private isEmpty(value: unknown): boolean {
    return (
      value === undefined ||
      value === null ||
      value === ''
    );
  }

  private validateText(
    field: TemplateField,
    value: unknown,
    errors: string[],
  ): void {
    if (typeof value !== 'string') {
      errors.push(`${field.label} must be text`);
      return;
    }

    const options = (field.options ?? {}) as Record<string, unknown>;

    if (
      typeof options.minLength === 'number' &&
      value.length < options.minLength
    ) {
      errors.push(
        `${field.label} must contain at least ${options.minLength} characters`,
      );
    }

    if (
      typeof options.maxLength === 'number' &&
      value.length > options.maxLength
    ) {
      errors.push(
        `${field.label} must contain at most ${options.maxLength} characters`,
      );
    }

    if (typeof options.pattern === 'string') {
      const regex = new RegExp(options.pattern);

      if (!regex.test(value)) {
        errors.push(`${field.label} has invalid format`);
      }
    }
  }

  private validateNumber(
    field: TemplateField,
    value: unknown,
    errors: string[],
  ): void {
    if (typeof value !== 'number') {
      errors.push(`${field.label} must be a number`);
      return;
    }

    const options = (field.options ?? {}) as Record<string, unknown>;

    if (
      typeof options.min === 'number' &&
      value < options.min
    ) {
      errors.push(`${field.label} is below minimum`);
    }

    if (
      typeof options.max === 'number' &&
      value > options.max
    ) {
      errors.push(`${field.label} exceeds maximum`);
    }
  }

  private validateGeoPoint(
    field: TemplateField,
    value: unknown,
    errors: string[],
  ): void {
    if (
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value)
    ) {
      errors.push(`${field.label} must contain latitude and longitude`);
      return;
    }

    const point = value as Record<string, unknown>;

    if (
      typeof point.lat !== 'number' ||
      typeof point.lng !== 'number'
    ) {
      errors.push(`${field.label} must contain valid lat/lng`);
      return;
    }

    if (point.lat < -90 || point.lat > 90) {
      errors.push(`${field.label} latitude is invalid`);
    }

    if (point.lng < -180 || point.lng > 180) {
      errors.push(`${field.label} longitude is invalid`);
    }
  }

  private validateDropdown(
    field: TemplateField,
    value: unknown,
    errors: string[],
  ): void {
    const options = (field.options ?? {}) as {
      options?: Array<{ value: string }>;
    };

    const validValues =
      options.options?.map((option) => option.value) ?? [];

    if (!validValues.includes(String(value))) {
      errors.push(`${field.label} contains an invalid option`);
    }
  }
}
