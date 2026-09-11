"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import type {
  TemplateField,
} from "@/types/template";

import {
  FieldEditor,
} from "./FieldEditor";

interface Props {
  fields: TemplateField[];
  onReorder: (
    oldIndex: number,
    newIndex: number,
  ) => void;
  onUpdate: (
    key: string,
    patch: Partial<TemplateField>,
  ) => void;
  onRemove: (
    key: string,
  ) => void;
}

export function SortableFieldList({
  fields,
  onReorder,
  onUpdate,
  onRemove,
}: Props) {
  const sensors = useSensors(
    useSensor(
      PointerSensor,
      {
        activationConstraint: {
          distance: 5,
        },
      },
    ),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd({
    active,
    over,
  }: any) {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex(
      (field) => field.key === active.id,
    );
    const newIndex = fields.findIndex(
      (field) => field.key === over.id,
    );

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((field) => field.key)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {fields.map((field) => (
            <SortableField
              key={field.key}
              field={field}
              onUpdate={(patch) =>
                onUpdate(field.key, patch)
              }
              onRemove={() =>
                onRemove(field.key)
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableField({
  field,
  onUpdate,
  onRemove,
}: {
  field: TemplateField;
  onUpdate: (
    patch: Partial<TemplateField>,
  ) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: field.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${field.label}`}
        className="absolute right-24 top-5 z-10 cursor-grab rounded border px-2.5 py-1 text-xs font-semibold bg-background hover:bg-muted text-stone-600 active:cursor-grabbing shadow-xs"
      >
        ↕ Drag
      </button>

      <FieldEditor
        field={field}
        onChange={onUpdate}
        onRemove={onRemove}
      />
    </div>
  );
}
