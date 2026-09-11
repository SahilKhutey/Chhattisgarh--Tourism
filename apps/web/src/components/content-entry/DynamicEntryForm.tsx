"use client";

import React, { useMemo } from "react";
import { RuntimeField, RuntimeSchema } from "../../types/content-entry";
import { DynamicEntryField } from "./DynamicEntryField";

interface DynamicEntryFormProps {
  schema: RuntimeSchema;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function DynamicEntryForm({
  schema,
  values,
  onChange,
  errors = {},
  disabled = false,
}: DynamicEntryFormProps) {
  const groups = useMemo(() => {
    const map = new Map<string, RuntimeField[]>();

    const sortedFields = [...schema.fields].sort((a, b) => a.order - b.order);

    for (const field of sortedFields) {
      const groupName = field.group?.trim() || "General Information";
      const existing = map.get(groupName) || [];
      existing.push(field);
      map.set(groupName, existing);
    }

    return Array.from(map.entries());
  }, [schema.fields]);

  const handleFieldChange = (key: string, val: unknown) => {
    onChange({
      ...values,
      [key]: val,
    });
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {groups.map(([groupName, fields]) => (
        <fieldset
          key={groupName}
          className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
        >
          <legend className="text-base font-semibold text-gray-900 px-2">
            {groupName}
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
            {fields.map((field) => {
              const isFullWidth = [
                "TEXTAREA",
                "RICHTEXT",
                "GALLERY",
                "MAP_REGION",
                "RELATION",
              ].includes(field.type);

              return (
                <div
                  key={field.key}
                  className={isFullWidth ? "md:col-span-2" : "col-span-1"}
                >
                  <DynamicEntryField
                    field={field}
                    value={values[field.key]}
                    onChange={(val) => handleFieldChange(field.key, val)}
                    error={errors[field.key]}
                    disabled={disabled}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </form>
  );
}
