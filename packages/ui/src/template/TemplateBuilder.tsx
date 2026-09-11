"use client";

import React, { useMemo, useState } from "react";

import type {
  Template,
  TemplateField,
} from "@cg-tourism/template-contract";

type Props = {
  template: Template;
  onChange: (template: Template) => void;
};

export function TemplateBuilder({
  template,
  onChange,
}: Props) {
  const [selectedFieldId, setSelectedFieldId] =
    useState<string | null>(null);

  const selectedField = useMemo<TemplateField | null>(
    () =>
      template.fields.find(
        (field) => field.id === selectedFieldId
      ) ?? null,
    [template.fields, selectedFieldId]
  );

  function addTextField() {
    const field: TemplateField = {
      id: crypto.randomUUID(),
      key: `field-${template.fields.length + 1}`,
      type: "TEXT",
      label: "New Text Field",
      required: false,
      translatable: true,
      order: template.fields.length,
      config: {},
    };

    onChange({
      ...template,
      fields: [
        ...template.fields,
        field,
      ],
    });

    setSelectedFieldId(field.id);
  }

  return (
    <div className="grid min-h-[600px] grid-cols-[240px_1fr_320px]">
      <aside className="border-r p-4">
        <h2 className="mb-4 font-semibold">
          Fields
        </h2>

        <button
          type="button"
          onClick={addTextField}
          className="w-full rounded border px-3 py-2 text-left"
        >
          + Text
        </button>
      </aside>

      <main className="p-6">
        <h1 className="mb-6 text-xl font-semibold">
          {template.metadata.name}
        </h1>

        <div className="space-y-3">
          {template.fields
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <button
                key={field.id}
                type="button"
                onClick={() =>
                  setSelectedFieldId(field.id)
                }
                className="block w-full rounded border p-4 text-left"
              >
                <div className="font-medium">
                  {field.label}
                </div>

                <div className="text-sm text-gray-500">
                  {field.type}
                </div>
              </button>
            ))}
        </div>
      </main>

      <aside className="border-l p-4">
        <h2 className="mb-4 font-semibold">
          Field Settings
        </h2>

        {selectedField ? (
          <div>
            <p className="font-medium">
              {selectedField.label}
            </p>

            <p className="text-sm text-gray-500">
              {selectedField.key}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Select a field.
          </p>
        )}
      </aside>
    </div>
  );
}
