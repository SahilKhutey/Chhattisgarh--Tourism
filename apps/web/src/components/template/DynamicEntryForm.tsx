'use client';

import React, { useState } from 'react';
import {
  Send,
  AlertCircle,
  HelpCircle,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { TemplateFieldModel } from '../renderer/field-registry';

export interface DynamicEntryFormProps {
  template: {
    id: string;
    name: string;
    slug: string;
    fields: TemplateFieldModel[];
  };
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const DynamicEntryForm: React.FC<DynamicEntryFormProps> = ({
  template,
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => ({
    ...initialValues,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedFields = [...template.fields].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of template.fields) {
      if (field.required) {
        const val = formData[field.key];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[field.key] = `${field.label} is required`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const renderFieldInput = (field: TemplateFieldModel) => {
    const value = formData[field.key] ?? '';
    const fieldType = (field.fieldType || 'TEXT').toUpperCase();

    switch (fieldType) {
      case 'TEXT':
        return (
          <input
            id={`field-${field.key}`}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'TEXTAREA':
      case 'RICHTEXT':
        return (
          <textarea
            id={`field-${field.key}`}
            rows={fieldType === 'RICHTEXT' ? 6 : 4}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-normal"
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );

      case 'NUMBER':
        return (
          <input
            id={`field-${field.key}`}
            type="number"
            value={value}
            onChange={(e) =>
              handleFieldChange(
                field.key,
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
            className="w-full max-w-xs px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="0"
          />
        );

      case 'BOOLEAN':
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              id={`field-${field.key}`}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
            />
            <span className="text-sm font-medium text-stone-700">
              Enable {field.label}
            </span>
          </label>
        );

      case 'DATE':
        return (
          <input
            id={`field-${field.key}`}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case 'DATETIME':
        return (
          <input
            id={`field-${field.key}`}
            type="datetime-local"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case 'TIME':
        return (
          <input
            id={`field-${field.key}`}
            type="time"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case 'IMAGE':
        return (
          <div className="space-y-2">
            <div className="relative">
              <input
                id={`field-${field.key}`}
                type="url"
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-3.5 py-2 pl-9 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="https://example.com/image.jpg"
              />
              <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
            {value && typeof value === 'string' && (
              <div className="w-32 h-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        );

      case 'GALLERY':
        const galleryList = Array.isArray(value) ? value.join(', ') : String(value);
        return (
          <div className="space-y-1">
            <input
              id={`field-${field.key}`}
              type="text"
              value={galleryList}
              onChange={(e) => {
                const urls = e.target.value
                  .split(',')
                  .map((u) => u.trim())
                  .filter(Boolean);
                handleFieldChange(field.key, urls);
              }}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Comma-separated image URLs (e.g. https://..., https://...)"
            />
            <p className="text-[11px] text-stone-400">
              Provide comma-separated image URLs.
            </p>
          </div>
        );

      case 'TAGS':
        const tagsList = Array.isArray(value) ? value.join(', ') : String(value);
        return (
          <div className="space-y-1">
            <input
              id={`field-${field.key}`}
              type="text"
              value={tagsList}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean);
                handleFieldChange(field.key, tags);
              }}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="heritage, waterfall, bastar"
            />
            <p className="text-[11px] text-stone-400">Comma-separated tags</p>
          </div>
        );

      case 'DROPDOWN':
        const options: Array<{ label: string; value: string }> =
          field.options?.choices || field.options || [];
        return (
          <select
            id={`field-${field.key}`}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full max-w-md px-3.5 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">-- Select an option --</option>
            {Array.isArray(options) &&
              options.map((opt, i) => (
                <option
                  key={i}
                  value={typeof opt === 'string' ? opt : opt.value}
                >
                  {typeof opt === 'string' ? opt : opt.label || opt.value}
                </option>
              ))}
          </select>
        );

      case 'GEO_POINT':
        const geoVal =
          typeof value === 'object' && value !== null
            ? value
            : { lat: '', lng: '' };
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <div>
              <label
                htmlFor={`field-${field.key}-lat`}
                className="block text-[11px] font-medium text-stone-500 mb-1"
              >
                Latitude
              </label>
              <input
                id={`field-${field.key}-lat`}
                type="number"
                step="any"
                value={geoVal.lat ?? ''}
                onChange={(e) =>
                  handleFieldChange(field.key, {
                    ...geoVal,
                    lat: e.target.value === '' ? '' : parseFloat(e.target.value),
                  })
                }
                placeholder="e.g. 19.201"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label
                htmlFor={`field-${field.key}-lng`}
                className="block text-[11px] font-medium text-stone-500 mb-1"
              >
                Longitude
              </label>
              <input
                id={`field-${field.key}-lng`}
                type="number"
                step="any"
                value={geoVal.lng ?? ''}
                onChange={(e) =>
                  handleFieldChange(field.key, {
                    ...geoVal,
                    lng: e.target.value === '' ? '' : parseFloat(e.target.value),
                  })
                }
                placeholder="e.g. 81.701"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        );

      default:
        return (
          <input
            id={`field-${field.key}`}
            type="text"
            value={typeof value === 'object' ? JSON.stringify(value) : value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-lg font-bold text-stone-900">
            {template.name} Content Entry
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Fill in the required information according to the published {template.name} template schema.
          </p>
        </div>

        {sortedFields.map((field) => {
          const error = errors[field.key];
          return (
            <div key={field.key} className="space-y-1.5">
              <label
                htmlFor={`field-${field.key}`}
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
              >
                {field.label}
                {field.required && (
                  <span className="text-rose-500 ml-1" title="Required">
                    *
                  </span>
                )}
              </label>

              {field.helpText && (
                <p className="text-[11px] text-stone-500 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-stone-400 shrink-0" />
                  {field.helpText}
                </p>
              )}

              {renderFieldInput(field)}

              {error && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? (
            <>Saving Entry...</>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Submit Content
            </>
          )}
        </button>
      </div>
    </form>
  );
};
