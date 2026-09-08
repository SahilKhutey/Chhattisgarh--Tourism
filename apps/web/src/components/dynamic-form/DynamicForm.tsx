'use client';

import React, { useState } from 'react';
import { Send, Save, AlertCircle, Sparkles } from 'lucide-react';
import { ContentTemplate } from '../template-builder/types';
import { DynamicField } from './DynamicField';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface DynamicFormProps {
  template: ContentTemplate;
  initialData?: Record<string, any>;
  onSubmit: (formData: Record<string, any>, status: 'DRAFT' | 'PENDING_REVIEW') => Promise<void>;
  isLoading?: boolean;
}

export function DynamicForm({
  template,
  initialData = {},
  onSubmit,
  isLoading = false,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = { ...initialData };
    // Set field defaults if specified
    for (const f of template.fields) {
      if (initial[f.key] === undefined && f.options?.default !== undefined) {
        initial[f.key] = f.options.default;
      }
    }
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const val = formData[field.key];

      // Required check
      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0) ||
          (field.fieldType === 'GEO_POINT' && (!val.lat || !val.lng))
        ) {
          newErrors[field.key] = `${field.label} is required`;
          continue;
        }
      }

      // Geo Point check
      if (field.fieldType === 'GEO_POINT' && val && typeof val === 'object') {
        if (val.lat !== undefined && (val.lat < -90 || val.lat > 90)) {
          newErrors[field.key] = 'Latitude must be between -90 and 90';
        }
        if (val.lng !== undefined && (val.lng < -180 || val.lng > 180)) {
          newErrors[field.key] = 'Longitude must be between -180 and 180';
        }
      }

      // Number range check
      if (field.fieldType === 'NUMBER' && typeof val === 'number') {
        if (field.options?.min !== undefined && val < field.options.min) {
          newErrors[field.key] = `Value cannot be less than ${field.options.min}`;
        }
        if (field.options?.max !== undefined && val > field.options.max) {
          newErrors[field.key] = `Value cannot be greater than ${field.options.max}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (targetStatus: 'DRAFT' | 'PENDING_REVIEW') => {
    if (targetStatus === 'PENDING_REVIEW' && !validate()) {
      toast.error('Please resolve the required validation errors before submitting.');
      return;
    }

    try {
      await onSubmit(formData, targetStatus);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit entry');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-charcoal-stone/15 p-6 md:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Template Header */}
      <div className="border-b border-charcoal-stone/10 pb-5">
        <div className="flex items-center gap-2 text-forest-emerald text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Content Template: {template.name} (v{template.version})
        </div>
        <h2 className="text-xl font-bold text-charcoal-stone">
          {initialData?.title ? `Edit: ${initialData.title}` : `New ${template.name} Entry`}
        </h2>
        {template.description && (
          <p className="text-sm text-charcoal-stone/60 mt-1">{template.description}</p>
        )}
      </div>

      {/* Dynamic Fields List */}
      <div className="space-y-5">
        {template.fields.map((field) => (
          <DynamicField
            key={field.key}
            field={field}
            value={formData[field.key]}
            onChange={(val) => handleFieldChange(field.key, val)}
            error={errors[field.key]}
          />
        ))}
      </div>

      {/* Validation Summary if any */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-1">Please fix the following errors:</span>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.values(errors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t border-charcoal-stone/10 flex flex-col sm:flex-row items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          isLoading={isLoading}
          onClick={() => handleSubmit('DRAFT')}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save as Draft
        </Button>

        <Button
          type="button"
          variant="primary"
          size="md"
          isLoading={isLoading}
          onClick={() => handleSubmit('PENDING_REVIEW')}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
