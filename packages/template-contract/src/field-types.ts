export const FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "RICHTEXT",
  "IMAGE",
  "GALLERY",
  "GEO_POINT",
  "MAP_REGION",
  "DROPDOWN",
  "MULTI_SELECT",
  "TAGS",
  "VIDEO",
  "AUDIO",
  "DATE",
  "DATETIME",
  "TIME",
  "NUMBER",
  "BOOLEAN",
  "RELATION"
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type TemplateStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export type FieldGroup = {
  id: string;
  label: string;
  order: number;
};
