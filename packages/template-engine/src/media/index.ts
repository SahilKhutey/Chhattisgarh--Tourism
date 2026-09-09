import { TemplateField } from "../schema/types.js";

export function isMediaField(field: TemplateField): boolean {
  return ['IMAGE', 'GALLERY', 'VIDEO', 'AUDIO'].includes(field.fieldType);
}
