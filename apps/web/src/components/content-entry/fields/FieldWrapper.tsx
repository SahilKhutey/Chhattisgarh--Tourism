"use client";

import React from "react";
import { RuntimeField } from "../../../types/content-entry";

interface FieldWrapperProps {
  field: RuntimeField;
  children: React.ReactNode;
  error?: string;
}

export function FieldWrapper({ field, children, error }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5" data-testid={`field-wrapper-${field.key}`}>
      {field.type !== "BOOLEAN" && (
        <label
          htmlFor={field.key}
          className="block text-sm font-medium text-gray-900"
        >
          {field.label}
          {field.required && (
            <span aria-hidden="true" className="ml-1 text-red-500 font-bold">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
