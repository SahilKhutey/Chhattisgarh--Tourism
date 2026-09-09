'use client';

import React from 'react';

export type Field = {
  key: string;
  label: string;
  fieldType: string;
  required: boolean;
  helpText?: string | null;
  options?: string | null;
};

type Props = {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function DynamicFieldRenderer({ field, value, onChange }: Props) {
  switch (field.fieldType) {
    case 'TEXT':
      return (
        <input
          id={`field-${field.key}`}
          className="w-full rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={String(value ?? '')}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'TEXTAREA':
      return (
        <textarea
          id={`field-${field.key}`}
          className="w-full rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          rows={5}
          value={String(value ?? '')}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'RICHTEXT':
      return (
        <textarea
          id={`field-${field.key}`}
          className="w-full rounded-lg border border-stone-300 p-3 text-sm font-normal focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          rows={8}
          value={String(value ?? '')}
          placeholder={`Enter ${field.label.toLowerCase()} (supports rich text & HTML)`}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'NUMBER':
      return (
        <input
          id={`field-${field.key}`}
          type="number"
          className="w-full max-w-xs rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={value === undefined || value === null ? '' : Number(value)}
          onChange={(event) =>
            onChange(event.target.value === '' ? null : Number(event.target.value))
          }
        />
      );

    case 'BOOLEAN':
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            id={`field-${field.key}`}
            type="checkbox"
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="text-sm font-medium text-stone-700">
            Enable {field.label}
          </span>
        </label>
      );

    case 'TAGS':
      return (
        <input
          id={`field-${field.key}`}
          className="w-full rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="tag1, tag2, tag3"
          value={Array.isArray(value) ? value.join(', ') : String(value ?? '')}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
            )
          }
        />
      );

    case 'DATE':
      return (
        <input
          id={`field-${field.key}`}
          type="date"
          className="w-full max-w-xs rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'DROPDOWN': {
      let choices: Array<{ value: string; label: string }> = [];
      try {
        const options = field.options ? JSON.parse(field.options) : {};
        choices = options.choices ?? [];
      } catch {
        choices = [];
      }

      return (
        <select
          id={`field-${field.key}`}
          className="w-full max-w-md rounded-lg border border-stone-300 p-3 text-sm bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select an option...</option>
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      );
    }

    default:
      return (
        <input
          id={`field-${field.key}`}
          className="w-full rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}
