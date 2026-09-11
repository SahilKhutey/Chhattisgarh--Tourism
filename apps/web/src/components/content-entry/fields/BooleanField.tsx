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

export function BooleanField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
        <input
          id={field.key}
          name={field.key}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-sm font-medium text-gray-900">
          {field.label}
          {field.required && (
            <span aria-hidden="true" className="ml-1 text-red-500 font-bold">
              *
            </span>
          )}
        </span>
      </label>
    </FieldWrapper>
  );
}
