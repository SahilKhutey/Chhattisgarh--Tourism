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

export function TagsField({ field, value, onChange, error, disabled }: FieldProps) {
  const [tagInput, setTagInput] = useState("");
  const tags: string[] = Array.isArray(value) ? (value as string[]) : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^,|,$/g, "");
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (idxToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded-md border-gray-300 bg-white">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="hover:text-amber-900 font-bold"
                  aria-label={`Remove tag ${tag}`}
                >
                  &times;
                </button>
              )}
            </span>
          ))}
          <input
            id={field.key}
            name={field.key}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Type tag and press Enter..." : ""}
            disabled={disabled}
            className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          />
        </div>
      </div>
    </FieldWrapper>
  );
}
