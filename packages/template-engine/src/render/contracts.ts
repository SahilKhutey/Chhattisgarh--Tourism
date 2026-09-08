/**
 * @cg-tourism/template-engine - Rendering Contracts
 * Unified interfaces for Form Editor and Public Display rendering.
 */

import { TemplateFieldDefinition, TemplateSchema } from '../schema/types';

export interface FieldRenderContext<TValue = unknown> {
  value: TValue;
  field: TemplateFieldDefinition;
  locale: string;
  disabled?: boolean;
  errors?: string[];
  onChange?: (value: TValue) => void;
}

export interface DisplayRenderContext<TValue = unknown> {
  value: TValue;
  field: TemplateFieldDefinition;
  locale: string;
  theme?: 'sovereign-glass' | 'high-contrast' | 'print';
}

export interface LayoutSection {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
  columns?: number; // 1 to 12
}

export interface TemplateLayoutDefinition {
  sections: LayoutSection[];
}

export interface DynamicFormState {
  template: TemplateSchema;
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  isDirty: boolean;
  isValid: boolean;
  currentLocale: string;
}
