/**
 * @cg-tourism/template-engine - Core Schema Types
 * Production contracts for CG Tourism Content Template Engine.
 */

export enum FieldType {
  // Primitives & Rich Content
  TEXT = 'TEXT',
  RICHTEXT = 'RICHTEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  DROPDOWN = 'DROPDOWN',
  TAGS = 'TAGS',

  // Media
  IMAGE = 'IMAGE',
  GALLERY = 'GALLERY',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',

  // Geographic First-Class Primitives
  GEO_POINT = 'GEO_POINT',
  GEO_REGION = 'GEO_REGION',
  ADMINISTRATIVE_REGION = 'ADMINISTRATIVE_REGION',
  GEO_ROUTE = 'GEO_ROUTE',

  // Graph / Relations
  RELATION = 'RELATION',
}

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum TemplateVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
}

export enum EntryStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Structural definition of a single field within a Template Version.
 */
export interface TemplateFieldDefinition<TOptions = Record<string, unknown>> {
  id?: string;
  key: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  options?: TOptions | null;
  translatable: boolean;
  helpText?: string | null;
  defaultValue?: unknown;
}

/**
 * Immutable schema snapshot stored in TemplateVersion.schema
 */
export interface TemplateSchema {
  templateSlug: string;
  templateName: string;
  version: number;
  description?: string | null;
  icon?: string | null;
  fields: TemplateFieldDefinition[];
  createdAt: string;
}

/**
 * Content Entry Data payload (key-value pair representation)
 */
export type ContentEntryData = Record<string, unknown>;

/**
 * Content Entry instance representation
 */
export interface ContentEntrySnapshot {
  id: string;
  templateId: string;
  templateVersionId: string;
  data: ContentEntryData;
  status: EntryStatus;
  authorId: string;
  reviewedBy?: string | null;
  region?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
  updatedAt: string;
}
