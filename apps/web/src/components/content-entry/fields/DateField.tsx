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

export function DateField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.key}
        name={field.key}
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </FieldWrapper>
  );
}

export function DateTimeField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.key}
        name={field.key}
        type="datetime-local"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </FieldWrapper>
  );
}

export function TimeField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.key}
        name={field.key}
        type="time"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </FieldWrapper>
  );
}
