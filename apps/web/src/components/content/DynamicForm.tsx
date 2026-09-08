'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';
import {
  ContentEntry,
  ContentTemplate,
  CreateEntryInput,
  EntryStatus,
  UpdateEntryInput,
} from '../../types/content';
import { DynamicField } from './DynamicField';
import { validateEntry } from '../../lib/validation';
import { createEntry, updateEntry } from '../../lib/template';

interface DynamicFormProps {
  template: ContentTemplate;
  initialEntry?: ContentEntry;
  onSuccess?: (entry: ContentEntry) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  template,
  initialEntry,
  onSuccess,
}) => {
  const router = useRouter();
  const isEditing = Boolean(initialEntry?.id);

  const [title, setTitle] = useState(initialEntry?.title || '');
  const [slug, setSlug] = useState(initialEntry?.slug || '');
  const [status, setStatus] = useState<EntryStatus>(
    initialEntry?.status || 'DRAFT',
  );

  // Initialize form data with defaults
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData = { ...(initialEntry?.data || {}) };
    for (const field of template.fields) {
      if (initialData[field.key] === undefined && field.defaultValue !== undefined) {
        initialData[field.key] = field.defaultValue;
      }
    }
    return initialData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      );
    }
  };

  const handleFieldChange = (key: string, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const extractCoordinates = (): { lat?: number; lng?: number } => {
    // Look for GEO_POINT field to extract top-level coordinates for PostGIS
    const geoField = template.fields.find((f) => f.type === 'GEO_POINT');
    if (geoField && formData[geoField.key]) {
      const geo = formData[geoField.key];
      const lat = Number(geo.lat);
      const lng = Number(geo.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return {};
  };

  const handleSubmit = async (targetStatus: EntryStatus) => {
    setGlobalError(null);
    setGlobalSuccess(null);

    // Validate title
    if (!title.trim()) {
      setGlobalError('Entry title is required');
      return;
    }

    // Validate fields according to template schema
    const validationErrors = validateEntry(template.fields, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGlobalError('Please resolve field validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const coords = extractCoordinates();
      let savedEntry: ContentEntry;

      if (isEditing && initialEntry) {
        const payload: UpdateEntryInput = {
          title,
          slug,
          status: targetStatus,
          data: formData,
          ...coords,
        };
        savedEntry = await updateEntry(initialEntry.id, payload);
      } else {
        const payload: CreateEntryInput = {
          templateId: template.id,
          title,
          slug,
          status: targetStatus,
          data: formData,
          ...coords,
        };
        savedEntry = await createEntry(payload);
      }

      setGlobalSuccess(
        targetStatus === 'PENDING_REVIEW'
          ? 'Entry submitted successfully for moderation review!'
          : 'Entry saved as draft!',
      );

      if (onSuccess) {
        onSuccess(savedEntry);
      } else {
        setTimeout(() => {
          router.push('/creator/entries');
        }, 900);
      }
    } catch (err: any) {
      setGlobalError(
        err.message || 'Failed to submit entry. Please verify the network connection.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(status);
      }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
              Template: {template.name}
            </span>
            <span className="text-stone-400 text-xs font-mono">v{template.version}</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900">
            {isEditing ? `Edit Entry: ${initialEntry?.title}` : `Create New ${template.name}`}
          </h1>
          {template.description && (
            <p className="text-xs text-stone-500 mt-0.5">{template.description}</p>
          )}
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-stone-500" />
            {submitting ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('PENDING_REVIEW')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {globalError && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {globalSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{globalSuccess}</span>
        </div>
      )}

      {/* Core Entry Identity */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
          General Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Bastar Dussehra Grand Celebration"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. bastar-dussehra-grand-celebration"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Form Fields */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
          Template Attributes ({sortedFields.length})
        </h3>

        {sortedFields.map((field) => (
          <div key={field.key} className="pt-3 first:pt-0 border-t first:border-0 border-stone-100">
            <DynamicField
              field={field}
              value={formData[field.key]}
              onChange={(val) => handleFieldChange(field.key, val)}
              error={errors[field.key]}
            />
          </div>
        ))}
      </div>
    </form>
  );
};
