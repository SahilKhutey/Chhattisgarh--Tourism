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

export function TextField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.key}
        name={field.key}
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={typeof field.config?.placeholder === "string" ? field.config.placeholder : ""}
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </FieldWrapper>
  );
}
