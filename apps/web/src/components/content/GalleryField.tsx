'use client';

import React from 'react';
import { Plus, Trash2, Images } from 'lucide-react';

interface GalleryFieldProps {
  value?: string[];
  onChange: (value: string[]) => void;
  label?: string;
  error?: string;
}

export function GalleryField({
  value = [],
  onChange,
  label = 'Photo Gallery',
  error,
}: GalleryFieldProps) {
  const images = Array.isArray(value) ? value : [];

  const handleAdd = () => {
    onChange([...images, '']);
  };

  const handleUpdate = (index: number, url: string) => {
    const copy = [...images];
    copy[index] = url;
    onChange(copy);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-stone-700">
          <Images className="w-4 h-4 text-emerald-600" />
          <span>{label} ({images.length})</span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Add Image
        </button>
      </div>

      <div className="space-y-2">
        {images.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => handleUpdate(i, e.target.value)}
              placeholder="https://images.unsplash.com/... or image URL"
              className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
            />
            {url && (
              <div className="w-8 h-8 rounded border border-stone-200 overflow-hidden shrink-0 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 font-medium">{error}</p>}
    </div>
  );
}
export default GalleryField;
