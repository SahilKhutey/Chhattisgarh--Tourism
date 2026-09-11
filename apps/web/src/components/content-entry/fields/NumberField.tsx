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

export function NumberField({ field, value, onChange, error, disabled }: FieldProps) {
  const min = typeof field.config?.min === "number" ? field.config.min : undefined;
  const max = typeof field.config?.max === "number" ? field.config.max : undefined;
  const step = typeof field.config?.step === "number" ? field.config.step : "any";

  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.key}
        name={field.key}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value !== null && value !== undefined ? String(value) : ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? null : Number(val));
        }}
        disabled={disabled}
        aria-required={field.required}
        aria-invalid={Boolean(error)}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </FieldWrapper>
  );
}
