"use client";

import React from "react";
import { RuntimeField } from "../../../types/content-entry";
import { FieldWrapper } from "./FieldWrapper";

interface FieldProps {
  field: RuntimeField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

interface OptionItem {
  label: string;
  value: string;
}

export function DropdownField({ field, value, onChange, error, disabled }: FieldProps) {
  const options: OptionItem[] = Array.isArray(field.config?.options)
    ? (field.config.options as OptionItem[])
    : [];

  return (
    <FieldWrapper field={field} error={error}>
      <select
        id={field.key}
        name={field.key}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white"
      >
        <option value="">Select an option...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label || opt.value}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function MultiSelectField({ field, value, onChange, error, disabled }: FieldProps) {
  const options: OptionItem[] = Array.isArray(field.config?.options)
    ? (field.config.options as OptionItem[])
    : [];
  const selectedValues: string[] = Array.isArray(value)
    ? (value as string[])
    : [];

  const handleToggle = (optValue: string) => {
    if (selectedValues.includes(optValue)) {
      onChange(selectedValues.filter((v) => v !== optValue));
    } else {
      onChange([...selectedValues, optValue]);
    }
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-1.5 p-2.5 border rounded-md border-gray-300 bg-white max-h-48 overflow-y-auto">
        {options.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No options configured.</p>
        ) : (
          options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(opt.value)}
                onChange={() => handleToggle(opt.value)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span>{opt.label || opt.value}</span>
            </label>
          ))
        )}
      </div>
    </FieldWrapper>
  );
}
