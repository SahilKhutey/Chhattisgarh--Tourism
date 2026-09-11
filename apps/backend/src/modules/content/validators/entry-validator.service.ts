import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { FieldType } from '@prisma/client';

export interface TemplateField {
  key: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  options?: any;
}

@Injectable()
export class EntryValidatorService {
  validate(
    fields: TemplateField[],
    data: Record<string, unknown>,
  ): void {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Entry data must be an object');
    }

    for (const field of fields) {
      const value = data[field.key];

      if (field.required && this.isEmpty(value)) {
        throw new BadRequestException(`${field.label} is required`);
      }

      if (value === undefined || value === null) {
        continue;
      }

      this.validateField(field, value);
    }
  }

  private validateField(
    field: TemplateField,
    value: unknown,
  ): void {
    switch (field.fieldType) {
      case 'TEXT':
      case 'TEXTAREA':
      case 'RICHTEXT':
        this.validateString(field, value);
        break;

      case 'NUMBER':
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new BadRequestException(`${field.label} must be a valid number`);
        }
        break;

      case 'BOOLEAN':
        if (typeof value !== 'boolean') {
          throw new BadRequestException(`${field.label} must be boolean`);
        }
        break;

      case 'TAGS':
        if (
          !Array.isArray(value) ||
          value.some((item) => typeof item !== 'string')
        ) {
          throw new BadRequestException(`${field.label} must be an array of strings`);
        }
        break;

      case 'GEO_POINT':
        this.validateGeoPoint(field, value);
        break;

      case 'DROPDOWN':
        this.validateDropdown(field, value);
        break;

      case 'DATE':
        this.validateDate(field, value);
        break;

      default:
        break;
    }
  }

  private validateString(
    field: TemplateField,
    value: unknown,
  ): void {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${field.label} must be text`);
    }

    const options = field.options ?? {};

    if (
      typeof options.minLength === 'number' &&
      value.length < options.minLength
    ) {
      throw new BadRequestException(`${field.label} is too short`);
    }

    if (
      typeof options.maxLength === 'number' &&
      value.length > options.maxLength
    ) {
      throw new BadRequestException(`${field.label} is too long`);
    }
  }

  private validateGeoPoint(
    field: TemplateField,
    value: unknown,
  ): void {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new BadRequestException(
        `${field.label} must contain latitude and longitude`,
      );
    }

    const point = value as Record<string, unknown>;

    // Accept both lat/lng (legacy GEO_POINT field data) and latitude/longitude
    const lat = point.lat ?? point.latitude;
    const lng = point.lng ?? point.longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new BadRequestException(`${field.label} requires numeric lat/lng`);
    }

    if (lat < -90 || lat > 90) {
      throw new BadRequestException(`${field.label} latitude is invalid`);
    }

    if (lng < -180 || lng > 180) {
      throw new BadRequestException(`${field.label} longitude is invalid`);
    }
  }

  private validateDropdown(
    field: TemplateField,
    value: unknown,
  ): void {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${field.label} must be a string`);
    }

    const options = field.options?.values;

    if (Array.isArray(options) && !options.includes(value)) {
      throw new BadRequestException(`${field.label} contains an invalid option`);
    }
  }

  private validateDate(
    field: TemplateField,
    value: unknown,
  ): void {
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw new BadRequestException(`${field.label} must be a valid date`);
    }
  }

  private isEmpty(value: unknown): boolean {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    );
  }
}
