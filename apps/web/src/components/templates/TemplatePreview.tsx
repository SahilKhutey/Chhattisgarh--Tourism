'use client';

import React from 'react';
import { Eye, MapPin, Images, Calendar, Hash, Tags, Link2 } from 'lucide-react';
import { TemplateField } from '../../types/content';

interface TemplatePreviewProps {
  name: string;
  slug: string;
  description?: string;
  fields: TemplateField[];
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  name,
  slug,
  description,
  fields,
}) => {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

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

      {sortedFields.length === 0 ? (
        <div className="py-12 text-center text-stone-400 border border-dashed border-stone-200 rounded-lg text-xs">
          No fields added yet. Add fields from the palette to see the live form.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedFields.map((field) => (
            <div key={field.key || field.order} className="text-xs">
              <label className="block font-semibold text-stone-700 mb-1">
                {field.label || 'Untitled Field'}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Mock field input based on field.type */}
              {field.type === 'TEXT' && (
                <input
                  type="text"
                  disabled
                  placeholder={field.placeholder || `Enter ${field.label}...`}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed"
                />
              )}

              {field.type === 'RICHTEXT' && (
                <textarea
                  disabled
                  rows={3}
                  placeholder={field.placeholder || `Write detailed markdown content...`}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed resize-none"
                />
              )}

              {field.type === 'IMAGE' && (
                <div className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg bg-stone-50 text-stone-500">
                  <div className="w-10 h-10 rounded bg-stone-200 flex items-center justify-center text-stone-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="text-[11px]">
                    <span className="font-semibold text-stone-700">Image Upload / URL</span>
                    <p className="text-stone-400">Preview will render here upon upload</p>
                  </div>
                </div>
              )}

              {field.type === 'GALLERY' && (
                <div className="p-4 border border-dashed border-stone-300 rounded-lg bg-stone-50 text-center text-stone-400">
                  <Images className="w-6 h-6 mx-auto mb-1 text-stone-400" />
                  <span className="text-[11px]">Photo gallery selector (multi-image)</span>
                </div>
              )}

              {field.type === 'GEO_POINT' && (
                <div className="p-3 border border-stone-200 rounded-lg bg-stone-50 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <MapPin className="w-3.5 h-3.5" /> Spatial PostGIS Coordinates
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled
                      placeholder="Latitude (e.g. 21.25)"
                      className="px-2.5 py-1.5 border border-stone-200 rounded bg-white text-stone-500"
                    />
                    <input
                      type="text"
                      disabled
                      placeholder="Longitude (e.g. 81.63)"
                      className="px-2.5 py-1.5 border border-stone-200 rounded bg-white text-stone-500"
                    />
                  </div>
                </div>
              )}

              {field.type === 'DROPDOWN' && (
                <select
                  disabled
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed"
                >
                  <option value="">
                    {field.placeholder || `Select ${field.label}...`}
                  </option>
                  {(field.options || []).map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'TAGS' && (
                <div className="flex items-center gap-1.5 p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-400">
                  <Tags className="w-4 h-4 text-stone-400" />
                  <span className="text-[11px]">Type and press enter to add tags...</span>
                </div>
              )}

              {field.type === 'DATE' && (
                <div className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span>YYYY-MM-DD</span>
                </div>
              )}

              {field.type === 'NUMBER' && (
                <div className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500">
                  <Hash className="w-4 h-4 text-stone-400" />
                  <span>0.00</span>
                </div>
              )}

              {field.type === 'BOOLEAN' && (
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    disabled
                    className="rounded border-stone-300 text-emerald-600 cursor-not-allowed"
                  />
                  <span className="text-stone-600">Enable / Yes</span>
                </div>
              )}

              {field.type === 'RELATION' && (
                <div className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-400">
                  <Link2 className="w-4 h-4 text-stone-400" />
                  <span className="text-[11px]">Select referenced tourism entity...</span>
                </div>
              )}

              {field.helpText && (
                <p className="text-[10px] text-stone-400 mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
