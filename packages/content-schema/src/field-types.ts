export const FIELD_TYPES = [
  'TEXT',
  'TEXTAREA',
  'RICHTEXT',
  'IMAGE',
  'GALLERY',
  'GEO_POINT',
  'MAP_REGION',
  'DROPDOWN',
  'TAGS',
  'VIDEO',
  'AUDIO',
  'DATE',
  'NUMBER',
  'BOOLEAN',
  'RELATION',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];
