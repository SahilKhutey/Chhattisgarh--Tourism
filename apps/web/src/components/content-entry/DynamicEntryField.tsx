"use client";

import React from "react";
import { RuntimeField } from "../../types/content-entry";
import { ENTRY_FIELD_REGISTRY, FieldComponent } from "./fieldRegistry";
import { TextField } from "./fields/TextField";

interface DynamicEntryFieldProps {
  field: RuntimeField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function DynamicEntryField({
  field,
  value,
  onChange,
  error,
  disabled,
}: DynamicEntryFieldProps) {
  const Component: FieldComponent = ENTRY_FIELD_REGISTRY[field.type] ?? TextField;

  return (
    <Component
      field={field}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
    />
  );
}
