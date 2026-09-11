import React from "react";
import { RuntimeField } from "../../types/content-entry";
import { BooleanField } from "./fields/BooleanField";
import { DateField, DateTimeField, TimeField } from "./fields/DateField";
import { DropdownField, MultiSelectField } from "./fields/DropdownField";
import { GeoPointField, MapRegionField } from "./fields/GeoPointField";
import { GalleryField, ImageField } from "./fields/ImageField";
import { NumberField } from "./fields/NumberField";
import { AudioField, RelationField, VideoField } from "./fields/RelationField";
import { RichTextField } from "./fields/RichTextField";
import { TagsField } from "./fields/TagsField";
import { TextareaField } from "./fields/TextareaField";
import { TextField } from "./fields/TextField";

export interface FieldComponentProps {
  field: RuntimeField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export type FieldComponent = React.ComponentType<FieldComponentProps>;

export const ENTRY_FIELD_REGISTRY: Record<string, FieldComponent> = {
  TEXT: TextField,
  TEXTAREA: TextareaField,
  RICHTEXT: RichTextField,
  NUMBER: NumberField,
  BOOLEAN: BooleanField,
  DATE: DateField,
  DATETIME: DateTimeField,
  TIME: TimeField,
  DROPDOWN: DropdownField,
  MULTI_SELECT: MultiSelectField,
  TAGS: TagsField,
  IMAGE: ImageField,
  GALLERY: GalleryField,
  GEO_POINT: GeoPointField,
  MAP_REGION: MapRegionField,
  RELATION: RelationField,
  VIDEO: VideoField,
  AUDIO: AudioField,
};
