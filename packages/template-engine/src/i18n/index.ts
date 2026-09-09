import { TemplateField } from "../schema/types.js";

export function getTranslatableFields(fields: TemplateField[]): TemplateField[] {
  return fields.filter(
    (f) =>
      f.translatable !== false &&
      ['TEXT', 'TEXTAREA', 'RICHTEXT', 'TAGS'].includes(f.fieldType),
  );
}

export function buildTranslationKey(
  templateId: string,
  entryId: string,
  fieldKey: string,
  language: string,
): string {
  return `${templateId}:${entryId}:${fieldKey}:${language}`;
}
