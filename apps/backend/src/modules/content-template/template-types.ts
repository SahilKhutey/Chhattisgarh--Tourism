import {
  EntryStatus as ContentEntryStatus,
  TemplateStatus as ContentTemplateStatus,
  FieldType as TemplateFieldType,
} from '@prisma/client';

export { ContentEntryStatus, ContentTemplateStatus, TemplateFieldType };

export interface TemplateFieldOptions {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  choices?: Array<{
    value: string;
    label: string;
  }>;
  allowedMimeTypes?: string[];
  relationTemplateSlug?: string;
  geo?: {
    minLatitude?: number;
    maxLatitude?: number;
    minLongitude?: number;
    maxLongitude?: number;
  };
}

export interface ContentEntryData {
  [key: string]: unknown;
}

export interface TemplateSnapshot {
  id: string;
  name: string;
  slug: string;
  version: number;
  fields: Array<{
    key: string;
    label: string;
    fieldType: TemplateFieldType;
    required: boolean;
    order: number;
    translatable: boolean;
    helpText?: string | null;
    options?: TemplateFieldOptions;
  }>;
}
