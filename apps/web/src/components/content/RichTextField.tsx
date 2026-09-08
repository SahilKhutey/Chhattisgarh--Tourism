'use client';

import React, { useState } from 'react';
import { AlignLeft, Eye, Edit3 } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function RichTextField({
  value = '',
  onChange,
  label = 'Rich Content',
  placeholder = 'Write detailed narrative or paste HTML/Markdown...',
  required,
  error,
}: RichTextFieldProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-stone-700">
          <AlignLeft className="w-4 h-4 text-emerald-600" />
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1 text-stone-500 hover:text-stone-800 text-[11px] font-medium"
        >
          {preview ? (
            <>
              <Edit3 className="w-3 h-3" /> Edit
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" /> Preview
            </>
          )}
        </button>
      </div>

      {preview ? (
        <div
          className="p-3.5 border border-stone-200 rounded-lg bg-stone-50 min-h-28 prose prose-xs max-w-none text-stone-800 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(value),
          }}
        />
      ) : (
        <textarea
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-sans resize-y"
        />
      )}

      {error && <p className="text-red-600 font-medium">{error}</p>}
    </div>
  );
}
export default RichTextField;
