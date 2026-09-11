"use client";

import type {
  TemplateFieldType,
} from "@/types/template";

import {
  TEMPLATE_FIELD_TYPES,
} from "@/types/template";

interface Props {
  onAdd: (
    type: TemplateFieldType,
  ) => void;
}

const labels: Record<
  TemplateFieldType,
  string
> = {
  TEXT: "Text",
  TEXTAREA: "Textarea",
  RICHTEXT: "Rich Text",
  IMAGE: "Image",
  GALLERY: "Gallery",
  GEO_POINT: "Geo Point",
  MAP_REGION: "Map Region",
  DROPDOWN: "Dropdown",
  MULTI_SELECT: "Multi Select",
  TAGS: "Tags",
  VIDEO: "Video",
  AUDIO: "Audio",
  DATE: "Date",
  DATETIME: "Date & Time",
  TIME: "Time",
  NUMBER: "Number",
  BOOLEAN: "Boolean",
  RELATION: "Relation",
};

export function FieldPalette({
  onAdd,
}: Props) {
  return (
    <aside
      className="rounded-xl border p-4 bg-background shadow-xs"
      aria-label="Template field palette"
    >
      <h2 className="font-semibold text-sm tracking-tight">
        Fields
      </h2>

      <p className="mt-1 text-xs text-muted-foreground">
        Add fields to your template.
      </p>

      <div className="mt-4 grid gap-1.5">
        {TEMPLATE_FIELD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="rounded-md border px-3 py-2 text-left text-xs font-medium transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            + {labels[type]}
          </button>
        ))}
      </div>
    </aside>
  );
}
