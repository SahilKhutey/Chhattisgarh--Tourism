'use client';

import React, { useState } from 'react';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';

export type Template = {
  id: string;
  name: string;
  slug: string;
  fields: Array<{
    key: string;
    label: string;
    fieldType: string;
    required: boolean;
    helpText?: string | null;
    options?: string | null;
  }>;
};

export function DynamicEntryForm({
  template,
  onSubmit,
}: {
  template: Template;
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void;
}) {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: unknown) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-bold text-stone-900">
            {template.name} Entry Form
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Provide content details for this {template.name.toLowerCase()} entry.
          </p>
        </div>

        {template.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label htmlFor={`field-${field.key}`} className="block font-medium text-stone-800 text-sm">
              {field.label}
              {field.required && <span className="ml-1 text-rose-500">*</span>}
            </label>
            <DynamicFieldRenderer
              field={field}
              value={data[field.key]}
              onChange={(value) => update(field.key, value)}
            />
            {field.helpText && (
              <p className="text-xs text-stone-400">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-3 transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
}
