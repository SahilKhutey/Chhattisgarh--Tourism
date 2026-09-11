"use client";

import React, { useState } from "react";
import { RuntimeField } from "../../../types/content-entry";
import { FieldWrapper } from "./FieldWrapper";

interface FieldProps {
  field: RuntimeField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function RelationField({ field, value, onChange, error, disabled }: FieldProps) {
  const [idInput, setIdInput] = useState("");
  const ids: string[] = Array.isArray(value) ? (value as string[]) : [];

  const addId = () => {
    if (idInput.trim() && !ids.includes(idInput.trim())) {
      onChange([...ids, idInput.trim()]);
      setIdInput("");
    }
  };

  const removeId = (targetId: string) => {
    onChange(ids.filter((id) => id !== targetId));
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-2 p-3 border rounded-md border-gray-300 bg-gray-50/50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Referenced Entry UUID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            disabled={disabled}
            className="flex-1 px-3 py-1.5 border rounded-md border-gray-300 text-sm bg-white"
          />
          <button
            type="button"
            onClick={addId}
            disabled={disabled || !idInput.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Add Relation
          </button>
        </div>
        {ids.length > 0 && (
          <ul className="space-y-1">
            {ids.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between px-2 py-1 bg-white border border-gray-200 rounded text-xs"
              >
                <span className="font-mono">{id}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeId(id)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </FieldWrapper>
  );
}

export function VideoField({ field, value, onChange, error, disabled }: FieldProps) {
  const url = typeof value === "object" && value !== null
    ? ((value as { url?: string }).url ?? "")
    : typeof value === "string" ? value : "";

  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.key}
        name={field.key}
        type="text"
        placeholder="Video URL or Embed link"
        value={url}
        onChange={(e) => onChange({ url: e.target.value })}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </FieldWrapper>
  );
}

export function AudioField({ field, value, onChange, error, disabled }: FieldProps) {
  const url = typeof value === "object" && value !== null
    ? ((value as { url?: string }).url ?? "")
    : typeof value === "string" ? value : "";

  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.key}
        name={field.key}
        type="text"
        placeholder="Audio clip URL"
        value={url}
        onChange={(e) => onChange({ url: e.target.value })}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </FieldWrapper>
  );
}
