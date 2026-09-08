/**
 * @cg-tourism/template-engine - Schema Snapshot Serializer
 * Creates and normalizes canonical, immutable schema snapshots for TemplateVersion.
 */

import { TemplateFieldDefinition, TemplateSchema } from './types';

export interface CreateSchemaSnapshotParams {
  templateSlug: string;
  templateName: string;
  version: number;
  description?: string | null;
  icon?: string | null;
  fields: TemplateFieldDefinition[];
  createdAt?: string;
}

/**
 * Creates a normalized, immutable TemplateSchema snapshot.
 */
export function createTemplateSchemaSnapshot(
  params: CreateSchemaSnapshotParams,
): TemplateSchema {
  if (!params.templateSlug || typeof params.templateSlug !== 'string') {
    throw new Error('TemplateSchema requires a valid string templateSlug.');
  }

  if (!params.templateName || typeof params.templateName !== 'string') {
    throw new Error('TemplateSchema requires a valid string templateName.');
  }

  if (typeof params.version !== 'number' || params.version < 1) {
    throw new Error('TemplateSchema requires a positive integer version number.');
  }

  if (!Array.isArray(params.fields)) {
    throw new Error('TemplateSchema requires an array of fields.');
  }

  // Validate duplicate field keys
  const seenKeys = new Set<string>();
  for (const field of params.fields) {
    if (!field.key || typeof field.key !== 'string') {
      throw new Error('Every TemplateFieldDefinition must possess a valid string key.');
    }
    const normalizedKey = field.key.trim().toLowerCase();
    if (seenKeys.has(normalizedKey)) {
      throw new Error(`Duplicate field key "${field.key}" detected in template schema.`);
    }
    seenKeys.add(normalizedKey);
  }

  // Sort fields deterministically by order, then by key
  const sortedFields = [...params.fields].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.key.localeCompare(b.key);
  });

  const snapshot: TemplateSchema = {
    templateSlug: params.templateSlug.trim(),
    templateName: params.templateName.trim(),
    version: Math.floor(params.version),
    description: params.description ?? null,
    icon: params.icon ?? null,
    fields: sortedFields.map((f) => ({
      key: f.key.trim(),
      label: f.label.trim(),
      fieldType: f.fieldType,
      required: Boolean(f.required),
      order: f.order,
      options: f.options ? JSON.parse(JSON.stringify(f.options)) : null,
      translatable: f.translatable !== false,
      helpText: f.helpText ?? null,
      defaultValue: f.defaultValue !== undefined ? f.defaultValue : null,
    })),
    createdAt: params.createdAt || new Date().toISOString(),
  };

  // Deep freeze to guarantee immutability
  return Object.freeze(JSON.parse(JSON.stringify(snapshot)));
}

/**
 * Serializes a TemplateSchema snapshot into a string representation.
 */
export function serializeTemplateSchema(schema: TemplateSchema): string {
  return JSON.stringify(schema);
}

/**
 * Deserializes an arbitrary JSON or object into a verified TemplateSchema.
 */
export function deserializeTemplateSchema(raw: unknown): TemplateSchema {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid schema: payload must be an object or valid JSON string.');
  }

  const p = parsed as Partial<TemplateSchema>;

  return createTemplateSchemaSnapshot({
    templateSlug: p.templateSlug ?? '',
    templateName: p.templateName ?? '',
    version: p.version ?? 1,
    description: p.description,
    icon: p.icon,
    fields: Array.isArray(p.fields) ? (p.fields as TemplateFieldDefinition[]) : [],
    createdAt: p.createdAt,
  });
}
