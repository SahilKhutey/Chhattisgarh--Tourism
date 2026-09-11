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

    case 'DATETIME':
      return (
        <input
          id={`field-${field.key}`}
          type="datetime-local"
          className="w-full max-w-xs rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'TIME':
      return (
        <input
          id={`field-${field.key}`}
          type="time"
          className="w-full max-w-xs rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case 'DROPDOWN': {
      let choices: Array<{ value: string; label: string }> = [];
      try {
        const options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options || {};
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

    case 'MULTI_SELECT': {
      let choices: Array<{ value: string; label: string }> = [];
      try {
        const options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options || {};
        choices = options.choices ?? [];
      } catch {
        choices = [];
      }
      const selected = Array.isArray(value) ? value : [];

      return (
        <div className="space-y-1.5 pt-1">
          {choices.map((choice) => {
            const isChecked = selected.includes(choice.value);
            return (
              <label key={choice.value} className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, choice.value]);
                    } else {
                      onChange(selected.filter((v: string) => v !== choice.value));
                    }
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{choice.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'IMAGE': {
      const placeholder = `Enter ${field.label.toLowerCase()}`;
      const imgVal =
        typeof value === 'object' && value !== null
          ? (value as { url?: string; altText?: string })
          : { url: String(value ?? ''), altText: '' };

      return (
        <div className="space-y-2 max-w-md">
          <input
            id={`field-${field.key}`}
            className="w-full rounded-lg border border-stone-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder={placeholder}
            value={imgVal.url || ''}
            onChange={(e) => {
              const url = e.target.value;
              if (!imgVal.altText) {
                onChange(url);
              } else {
                onChange({ ...imgVal, url });
              }
            }}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">Alt Text (Accessibility) <span className="text-rose-500">*</span></span>
              <span className="text-emerald-700 font-medium">Non-negotiable</span>
            </div>
            <input
              className="w-full rounded-lg border border-amber-200 bg-amber-50/30 p-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Descriptive alt text for vision-impaired tourists"
              value={imgVal.altText || ''}
              onChange={(e) => onChange({ url: imgVal.url, altText: e.target.value })}
            />
          </div>
        </div>
      );
    }

    case 'GEO_POINT': {
      const geoVal = typeof value === 'object' && value !== null
        ? (value as { lat?: number; lng?: number })
        : { lat: undefined, lng: undefined };

      return (
        <div className="space-y-1 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-stone-500 mb-0.5">Latitude (17.78° - 24.11° N)</label>
              <input
                type="number"
                step="0.0001"
                value={geoVal.lat ?? ''}
                placeholder="e.g. 19.07"
                className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-emerald-500 focus:outline-none"
                onChange={(e) => onChange({ ...geoVal, lat: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-500 mb-0.5">Longitude (80.24° - 84.40° E)</label>
              <input
                type="number"
                step="0.0001"
                value={geoVal.lng ?? ''}
                placeholder="e.g. 81.95"
                className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-emerald-500 focus:outline-none"
                onChange={(e) => onChange({ ...geoVal, lng: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
          <p className="text-[10px] text-stone-400">Validated against Chhattisgarh state boundaries.</p>
        </div>
      );
    }

    case 'VIDEO':
    case 'AUDIO':
      return (
        <input
          id={`field-${field.key}`}
          type="url"
          className="w-full rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={String(value ?? '')}
          placeholder={`Enter media URL (https://...) for ${field.label.toLowerCase()}`}
          onChange={(event) => onChange(event.target.value)}
        />
      );

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
