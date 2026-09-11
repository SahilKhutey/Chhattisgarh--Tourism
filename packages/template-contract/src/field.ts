import type { FieldType } from "./field-types.js";
import type { GeoBounds } from "./geography.js";

export interface Choice {
  value: string;
  label: string;
}

export interface BaseFieldConfig {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;

  allowedBlocks?: (
    | "paragraph"
    | "heading"
    | "list"
    | "quote"
  )[];

  maxSizeMb?: number;
  aspectRatio?: string;

  minItems?: number;
  maxItems?: number;
  maxSizeMbPerItem?: number;

  bounds?: GeoBounds;
  allowMultiplePolygons?: boolean;

  choices?: Choice[];
  allowCustomValue?: boolean;

  suggestedTags?: string[];
  maxTags?: number;

  allowExternalUrl?: boolean;
  maxDurationSeconds?: number;

  minDate?: string;
  maxDate?: string;
  includeTime?: boolean;

  min?: number;
  max?: number;
  step?: number;

  defaultValue?: boolean;

  targetTemplateSlug?: string;
  allowMultiple?: boolean;
}

export interface TemplateField {
  id: string;
  key: string;
  type: FieldType;
  label: string;
  required: boolean;
  translatable: boolean;
  order: number;
  group?: string;
  helpText?: string;
  config: BaseFieldConfig;
}
