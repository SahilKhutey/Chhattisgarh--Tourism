'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Hash,
  X,
  Link2,
} from 'lucide-react';
import { TemplateField } from '../../types/content';

// Dynamic import of Leaflet map to prevent SSR window errors
const GenericMap = dynamic(() => import('./GenericMap'), {
  ssr: false,
  loading: () => (
    <div className="h-44 bg-stone-100 rounded-lg flex items-center justify-center text-xs text-stone-400">
      Loading interactive map...
    </div>
  ),
});

interface DynamicFieldProps {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error,
}) => {
  const [tagInput, setTagInput] = useState('');

  const renderWidget = () => {
    switch (field.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label}...`}
            className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                : 'border-stone-300 focus:ring-emerald-500'
            }`}
          />
        );

      case 'RICHTEXT':
        return (
          <textarea
            rows={5}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || `Write detailed markdown content...`}
            className={`w-full px-3 py-2 border rounded-lg text-xs font-sans transition-colors focus:outline-none focus:ring-2 resize-y ${
              error
                ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                : 'border-stone-300 focus:ring-emerald-500'
            }`}
          />
        );

      case 'NUMBER':
        return (
          <div className="relative">
            <input
              type="number"
              value={value ?? ''}
              min={field.validation?.min}
              max={field.validation?.max}
              onChange={(e) =>
                onChange(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder={field.placeholder || '0'}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg text-xs transition-colors focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-stone-300 focus:ring-emerald-500'
              }`}
            />
            <Hash className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        );

      case 'DATE':
        return (
          <div className="relative">
            <input
              type="date"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg text-xs transition-colors focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-stone-300 focus:ring-emerald-500'
              }`}
            />
            <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        );

      case 'DROPDOWN':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-xs transition-colors focus:outline-none focus:ring-2 bg-white ${
              error
                ? 'border-red-300 focus:ring-red-400'
                : 'border-stone-300 focus:ring-emerald-500'
            }`}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}...`}
            </option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'BOOLEAN':
        return (
          <label className="flex items-center gap-2.5 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs text-stone-700 font-medium">
              {value ? 'Yes / Enabled' : 'No / Disabled'}
            </span>
          </label>
        );

      case 'IMAGE':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste image URL (https://...)"
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {value && (
              <div className="relative w-full h-36 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt={field.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'GALLERY': {
        const list: string[] = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="space-y-1.5">
              {list.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const copy = [...list];
                      copy[i] = e.target.value;
                      onChange(copy);
                    }}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-1.5 border border-stone-300 rounded-md text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onChange(list.filter((_, idx) => idx !== i));
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChange([...list, ''])}
              className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium py-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Image URL
            </button>
          </div>
        );
      }

      case 'GEO_POINT': {
        const geoVal =
          typeof value === 'object' && value !== null ? value : { lat: '', lng: '' };

        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  value={geoVal.lat ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...geoVal,
                      lat: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 21.2514"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  value={geoVal.lng ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...geoVal,
                      lng: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 81.6296"
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-md text-xs font-mono"
                />
              </div>
            </div>

            {/* Interactive Map Picker */}
            <GenericMap
              lat={typeof geoVal.lat === 'number' ? geoVal.lat : 21.2514}
              lng={typeof geoVal.lng === 'number' ? geoVal.lng : 81.6296}
              title={field.label}
              height="200px"
              interactive={true}
              onLocationSelect={(lat, lng) => onChange({ lat, lng })}
            />
          </div>
        );
      }

      case 'TAGS': {
        const tags: string[] = Array.isArray(value) ? value : [];
        const handleAddTag = () => {
          const trimmed = tagInput.trim();
          if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setTagInput('');
          }
        };

        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Enter or click Add"
                className="flex-1 px-3 py-1.5 border border-stone-300 rounded-md text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => onChange(tags.filter((t) => t !== tag))}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'VIDEO':
      case 'AUDIO':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.type.toLowerCase()} stream or file URL...`}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
          />
        );

      case 'MAP_REGION':
        return (
          <textarea
            rows={3}
            value={typeof value === 'object' ? JSON.stringify(value) : value ?? ''}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            placeholder="GeoJSON polygon or feature string..."
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
          />
        );

      case 'RELATION':
        return (
          <div className="relative">
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Referenced entry ID or slug..."
              className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-xs"
            />
            <Link2 className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
          />
        );
    }
  };

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-stone-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-[10px] font-mono text-stone-400">{field.type}</span>
      </div>

      {renderWidget()}

      {field.helpText && (
        <p className="text-[10px] text-stone-500 mt-0.5">{field.helpText}</p>
      )}

      {error && (
        <p className="text-[11px] text-red-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
};
