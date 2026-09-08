export const TEMPLATE_SCHEMA_VERSION = 1 as const;

export type TemplateStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export type FieldType =
  | "TEXT"
  | "RICHTEXT"
  | "IMAGE"
  | "GALLERY"
  | "GEO_POINT"
  | "MAP_REGION"
  | "DROPDOWN"
  | "TAGS"
  | "VIDEO"
  | "AUDIO"
  | "DATE"
  | "NUMBER"
  | "BOOLEAN"
  | "RELATION";

export type SupportedLocale =
  | "en"
  | "hi"
  | "chg";

export interface LocalizedString {
  en?: string;
  hi?: string;
  chg?: string;
}

export interface TemplateMetadata {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface FieldValidationOptions {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface TextFieldOptions {
  multiline?: boolean;
  placeholder?: string;
  validation?: FieldValidationOptions;
}

export interface RichTextFieldOptions {
  allowedFormats?: Array<
    | "bold"
    | "italic"
    | "underline"
    | "heading"
    | "link"
    | "list"
    | "quote"
  >;
}

export interface ImageFieldOptions {
  maxSizeBytes?: number;
  acceptedMimeTypes?: string[];
  requireAltText?: boolean;
}

export interface GalleryFieldOptions {
  minItems?: number;
  maxItems?: number;
  image?: ImageFieldOptions;
}

export interface GeoPointFieldOptions {
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  requiredAccuracyMeters?: number;
}

export interface MapRegionFieldOptions {
  allowedGeometryTypes?: Array<
    "Polygon" | "MultiPolygon"
  >;
}

export interface DropdownOption {
  value: string;
  label: LocalizedString | string;
}

export interface DropdownFieldOptions {
  options: DropdownOption[];
  allowMultiple?: boolean;
}

export interface TagsFieldOptions {
  minItems?: number;
  maxItems?: number;
  allowCustom?: boolean;
}

export interface VideoFieldOptions {
  acceptedMimeTypes?: string[];
  maxSizeBytes?: number;
  maxDurationSeconds?: number;
}

export interface AudioFieldOptions {
  acceptedMimeTypes?: string[];
  maxSizeBytes?: number;
  maxDurationSeconds?: number;
}

export interface DateFieldOptions {
  includeTime?: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface NumberFieldOptions {
  min?: number;
  max?: number;
  integerOnly?: boolean;
  unit?: string;
}

export interface BooleanFieldOptions {
  trueLabel?: LocalizedString | string;
  falseLabel?: LocalizedString | string;
}

export interface RelationFieldOptions {
  targetTemplateSlug: string;
  multiple?: boolean;
  allowSelf?: boolean;
}

export type FieldOptions =
  | TextFieldOptions
  | RichTextFieldOptions
  | ImageFieldOptions
  | GalleryFieldOptions
  | GeoPointFieldOptions
  | MapRegionFieldOptions
  | DropdownFieldOptions
  | TagsFieldOptions
  | VideoFieldOptions
  | AudioFieldOptions
  | DateFieldOptions
  | NumberFieldOptions
  | BooleanFieldOptions
  | RelationFieldOptions
  | Record<string, unknown>
  | undefined;

export interface TemplateField {
  key: string;
  label: string;
  fieldType: FieldType;

  required?: boolean;

  order: number;

  options?: FieldOptions;

  translatable?: boolean;

  helpText?: string;

  defaultValue?: unknown;
}

export interface TemplateSection {
  key: string;
  label: string;
  order: number;
  fieldKeys: string[];
}

export interface TemplateSchema {
  schemaVersion: typeof TEMPLATE_SCHEMA_VERSION;

  id: string;

  metadata: TemplateMetadata;

  version: number;

  status: TemplateStatus;

  fields: TemplateField[];

  sections?: TemplateSection[];
}

export interface SchemaValidationError {
  path: string;
  code:
    | "INVALID_SCHEMA"
    | "INVALID_TEMPLATE_ID"
    | "INVALID_TEMPLATE_VERSION"
    | "INVALID_METADATA"
    | "INVALID_SLUG"
    | "DUPLICATE_FIELD_KEY"
    | "INVALID_FIELD_KEY"
    | "INVALID_FIELD_LABEL"
    | "INVALID_FIELD_ORDER"
    | "INVALID_FIELD_TYPE"
    | "INVALID_FIELD_OPTIONS"
    | "INVALID_REQUIRED_CONFIGURATION"
    | "INVALID_TRANSLATION_CONFIGURATION"
    | "INVALID_SECTION"
    | "UNKNOWN_FIELD_REFERENCE"
    | "DUPLICATE_SECTION_KEY"
    | "CIRCULAR_RELATION"
    | "SELF_RELATION"
    | "INVALID_DEFAULT_VALUE";
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

export interface TemplateSerializationResult {
  schema: TemplateSchema;
  json: string;
}
