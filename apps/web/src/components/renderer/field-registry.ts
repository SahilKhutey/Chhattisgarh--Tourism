import React from 'react';

export interface RendererContext {
  locale?: string;
  onNavigate?: (href: string) => void;
  mediaBaseUrl?: string;
}

export interface TemplateFieldModel {
  id?: string;
  key: string;
  label: string;
  fieldType: string;
  required?: boolean;
  order?: number;
  helpText?: string | null;
  options?: any;
  translatable?: boolean;
}

export interface FieldRendererProps<T = any> {
  field: TemplateFieldModel;
  value: T;
  context?: RendererContext;
}

export type FieldRenderer<T = any> = React.ComponentType<FieldRendererProps<T>>;

const registry = new Map<string, FieldRenderer<any>>();

export function registerFieldRenderer<T = any>(
  fieldType: string,
  renderer: FieldRenderer<T>,
): void {
  registry.set(fieldType.toUpperCase(), renderer);
}

export function getFieldRenderer(fieldType: string): FieldRenderer<any> | undefined {
  return registry.get(fieldType.toUpperCase());
}

export function getAllRegisteredFieldTypes(): string[] {
  return Array.from(registry.keys());
}
