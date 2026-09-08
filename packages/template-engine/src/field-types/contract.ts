/**
 * @cg-tourism/template-engine - Field Type Contract
 */

import { FieldType } from '../schema/types';
import { ValidationResult } from '../validation/errors';

export interface ValidationContext {
  mode: 'DRAFT' | 'STRICT';
  locale?: string;
  entityId?: string;
  templateSlug?: string;
}

export interface EditorRendererMetadata {
  component: string;
  icon?: string;
  category?: 'basic' | 'media' | 'geography' | 'advanced';
  defaultProps?: Record<string, unknown>;
}

export interface DisplayRendererMetadata {
  component: string;
  layoutSpan?: number; // Grid column span (1-12)
  isMedia?: boolean;
}

export interface FieldTypeDefinition<TOptions = unknown, TValue = unknown> {
  readonly type: FieldType;

  /**
   * Validates options configured in the Template Builder for this field.
   */
  validateOptions(options: TOptions): ValidationResult;

  /**
   * Validates a value entered by a creator against the field options and context.
   */
  validateValue(
    value: unknown,
    options: TOptions,
    context?: ValidationContext,
  ): ValidationResult;

  /**
   * Serializes a runtime typed value into a JSON-compatible payload for storage.
   */
  serialize(value: TValue): unknown;

  /**
   * Deserializes raw JSON storage into a strongly-typed runtime value.
   */
  deserialize(raw: unknown): TValue;

  /**
   * Returns default value when field is initialized in a form.
   */
  getDefaultValue(options?: TOptions): TValue | null;

  /**
   * UI metadata for rendering this field in the Admin/Creator Form Builder.
   */
  getEditorMetadata(): EditorRendererMetadata;

  /**
   * UI metadata for rendering this field in public tourism pages.
   */
  getDisplayMetadata(): DisplayRendererMetadata;
}
