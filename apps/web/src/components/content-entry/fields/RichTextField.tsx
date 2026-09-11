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

export function RichTextField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <textarea
        id={field.key}
        name={field.key}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter HTML or formatted text..."
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        rows={6}
        className="w-full font-mono text-sm px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500"
      />
    </FieldWrapper>
  );
}
