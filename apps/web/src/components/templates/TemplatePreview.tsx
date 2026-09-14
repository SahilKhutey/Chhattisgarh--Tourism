'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { TemplateField as ContentTemplateField } from '../../types/content';
import { TemplatePreview as CanonicalTemplatePreview } from '../template-builder/TemplatePreview';
import type { TemplateField } from '@/types/template';

interface TemplatePreviewProps {
  name: string;
  slug: string;
  description?: string;
  fields: ContentTemplateField[];
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  name,
  slug,
  description,
  fields,
}) => {
  const canonicalFields: TemplateField[] = (fields || []).map((f, idx) => ({
    key: f.key,
    label: f.label,
    type: ((f as any).fieldType || f.type || 'TEXT') as any,
    required: Boolean(f.required),
    translatable: Boolean(f.translatable),
    order: f.order ?? idx,
    group: f.group ?? 'General',
    helpText: f.helpText ?? null,
    config: (f as any).config || (f.options ? { options: typeof f.options === 'string' ? JSON.parse(f.options as any) : f.options } : {}),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
            Live Form Preview
          </h3>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
          Creator Experience
        </span>
      </div>

      <div className="mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-stone-900">
            {name || 'Untitled Template'}
          </h2>
          {slug && (
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-xs font-mono">
              /{slug}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-stone-500 mt-1">{description}</p>
        )}
      </div>

      <CanonicalTemplatePreview fields={canonicalFields} />
    </div>
  );
};

export default TemplatePreview;
