import { FieldType } from '@prisma/client';

export interface TemplateFieldOptions {
  placeholder?: string;
  helpText?: string;

  min?: number;
  max?: number;

  minLength?: number;
  maxLength?: number;

  pattern?: string;

  options?: Array<{
    label: string;
    value: string;
  }>;

  relationTemplateId?: string;

  geo?: {
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
  };

  acceptedMimeTypes?: string[];
  maxFileSizeMb?: number;
}

export interface CreateTemplateFieldInput {
  key: string;
  label: string;
  fieldType: FieldType;
  required?: boolean;
  order: number;
  options?: TemplateFieldOptions;
  translatable?: boolean;
}
