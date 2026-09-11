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

interface ImageValue {
  url?: string;
  alt?: string;
  asset_id?: string;
}

export function ImageField({ field, value, onChange, error, disabled }: FieldProps) {
  const imgValue: ImageValue = typeof value === "object" && value !== null
    ? (value as ImageValue)
    : { url: typeof value === "string" ? value : "", alt: "" };

  const handleUrlChange = (url: string) => {
    onChange({ ...imgValue, url });
  };

  const handleAltChange = (alt: string) => {
    onChange({ ...imgValue, alt });
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-2 p-3 border rounded-md border-gray-300 bg-gray-50/50">
        <div>
          <label htmlFor={`${field.key}-url`} className="block text-xs font-medium text-gray-700 mb-1">
            Image URL / Asset Reference
          </label>
          <input
            id={`${field.key}-url`}
            type="text"
            value={imgValue.url ?? ""}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://..."
            disabled={disabled}
            className="w-full px-3 py-1.5 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white"
          />
        </div>
        <div>
          <label htmlFor={`${field.key}-alt`} className="block text-xs font-medium text-gray-700 mb-1">
            Alt Text (Accessibility) <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            id={`${field.key}-alt`}
            type="text"
            value={imgValue.alt ?? ""}
            onChange={(e) => handleAltChange(e.target.value)}
            placeholder="Descriptive alt text for screen readers"
            disabled={disabled}
            className="w-full px-3 py-1.5 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white"
          />
        </div>
      </div>
    </FieldWrapper>
  );
}

export function GalleryField({ field, value, onChange, error, disabled }: FieldProps) {
  const items: ImageValue[] = Array.isArray(value) ? (value as ImageValue[]) : [];

  const addItem = () => {
    onChange([...items, { url: "", alt: "" }]);
  };

  const updateItem = (index: number, updated: Partial<ImageValue>) => {
    const next = items.map((item, idx) => (idx === index ? { ...item, ...updated } : item));
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-3 p-3 border rounded-md border-gray-300 bg-gray-50/50">
        {items.map((item, idx) => (
          <div key={idx} className="p-2 border rounded border-gray-200 bg-white space-y-2 relative">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Image #{idx + 1}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Image URL"
                value={item.url ?? ""}
                onChange={(e) => updateItem(idx, { url: e.target.value })}
                disabled={disabled}
                className="w-full px-2 py-1 text-xs border rounded border-gray-300"
              />
              <input
                type="text"
                placeholder="Alt text (required)"
                value={item.alt ?? ""}
                onChange={(e) => updateItem(idx, { alt: e.target.value })}
                disabled={disabled}
                className="w-full px-2 py-1 text-xs border rounded border-gray-300"
              />
            </div>
          </div>
        ))}
        {!disabled && (
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            + Add Gallery Image
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}
