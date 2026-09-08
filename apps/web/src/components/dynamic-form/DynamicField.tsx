'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Image as ImageIcon,
  Plus,
  X,
  Compass,
} from 'lucide-react';
import { TemplateFieldConfig } from '../template-builder/types';

interface DynamicFieldProps {
  field: TemplateFieldConfig;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export function DynamicField({
  field,
  value,
  onChange,
  error,
}: DynamicFieldProps) {
  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');

  // 1. TEXT
  if (field.fieldType === 'TEXT') {
    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-charcoal-stone/20 focus:ring-forest-emerald/40'
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 2. TEXTAREA
  if (field.fieldType === 'TEXTAREA') {
    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          rows={3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-charcoal-stone/20 focus:ring-forest-emerald/40'
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 3. RICHTEXT
  if (field.fieldType === 'RICHTEXT') {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-charcoal-stone">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[11px] text-charcoal-stone/50">Markdown supported</span>
        </div>
        <textarea
          rows={6}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Write detailed narrative for ${field.label.toLowerCase()}...`}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-charcoal-stone/20 focus:ring-forest-emerald/40'
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 4. NUMBER
  if (field.fieldType === 'NUMBER') {
    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="number"
          value={value ?? ''}
          min={field.options?.min}
          max={field.options?.max}
          step={field.options?.step ?? 'any'}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="0"
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-charcoal-stone/20 focus:ring-forest-emerald/40'
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 5. BOOLEAN
  if (field.fieldType === 'BOOLEAN') {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-charcoal-stone/15 bg-sand-beige/10">
        <div>
          <span className="text-sm font-semibold text-charcoal-stone block">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </span>
          <span className="text-xs text-charcoal-stone/60">
            {value ? 'Active / Enabled' : 'Inactive / Disabled'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? 'bg-forest-emerald' : 'bg-charcoal-stone/30'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  }

  // 6. DATE / DATETIME
  if (field.fieldType === 'DATE' || field.fieldType === 'DATETIME') {
    const isDateTime = field.fieldType === 'DATETIME';
    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={isDateTime ? 'datetime-local' : 'date'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-charcoal-stone/20 focus:ring-forest-emerald/40'
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 7. IMAGE
  if (field.fieldType === 'IMAGE') {
    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... or /images/..."
            className={`flex-1 px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-200'
                : 'border-charcoal-stone/20 focus:ring-forest-emerald/40'
            }`}
          />
        </div>
        {value && (
          <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-charcoal-stone/20 bg-sand-beige/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 8. GALLERY
  if (field.fieldType === 'GALLERY') {
    const list: string[] = Array.isArray(value) ? value : [];

    const handleAddImage = () => {
      if (!galleryInput.trim()) return;
      onChange([...list, galleryInput.trim()]);
      setGalleryInput('');
    };

    const handleRemoveImage = (idx: number) => {
      onChange(list.filter((_, i) => i !== idx));
    };

    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={galleryInput}
            onChange={(e) => setGalleryInput(e.target.value)}
            placeholder="Add image URL..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-charcoal-stone/20 text-xs focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImage();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-3 py-2 rounded-xl bg-forest-emerald text-white text-xs font-semibold hover:bg-forest-emerald/90 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {list.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
            {list.map((url, i) => (
              <div
                key={url + i}
                className="relative group rounded-lg overflow-hidden border border-charcoal-stone/20 aspect-video bg-sand-beige/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 9. GEO_POINT
  if (field.fieldType === 'GEO_POINT') {
    const coords = (value && typeof value === 'object') ? value : { lat: '', lng: '' };

    const handleLatChange = (latVal: string) => {
      onChange({ ...coords, lat: latVal === '' ? null : Number(latVal) });
    };

    const handleLngChange = (lngVal: string) => {
      onChange({ ...coords, lng: lngVal === '' ? null : Number(lngVal) });
    };

    const handleQuickLocation = () => {
      // Default to Bastar / Jagdalpur hub if geolocation not granted
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
            // Bastar default
            onChange({ lat: 19.07, lng: 81.96 });
          },
        );
      } else {
        onChange({ lat: 19.07, lng: 81.96 });
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-charcoal-stone">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <button
            type="button"
            onClick={handleQuickLocation}
            className="text-[11px] font-semibold text-forest-emerald hover:underline flex items-center gap-1"
          >
            <Compass className="w-3 h-3" />
            Use Current / Default GPS
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="number"
              step="any"
              value={coords.lat ?? ''}
              onChange={(e) => handleLatChange(e.target.value)}
              placeholder="Latitude (e.g. 19.201)"
              className="w-full px-3.5 py-2.5 pl-8 rounded-xl border border-charcoal-stone/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
            />
            <MapPin className="w-3.5 h-3.5 text-charcoal-stone/40 absolute left-3 top-3.5" />
          </div>

          <div className="relative">
            <input
              type="number"
              step="any"
              value={coords.lng ?? ''}
              onChange={(e) => handleLngChange(e.target.value)}
              placeholder="Longitude (e.g. 81.706)"
              className="w-full px-3.5 py-2.5 pl-8 rounded-xl border border-charcoal-stone/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
            />
            <MapPin className="w-3.5 h-3.5 text-charcoal-stone/40 absolute left-3 top-3.5" />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 10. DROPDOWN
  if (field.fieldType === 'DROPDOWN') {
    const options = field.options?.options || [];
    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-charcoal-stone/20 focus:ring-forest-emerald/40'
          }`}
        >
          <option value="">-- Select {field.label} --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // 11. TAGS
  if (field.fieldType === 'TAGS' || field.fieldType === 'MULTISELECT') {
    const tags: string[] = Array.isArray(value) ? value : [];

    const handleAddTag = () => {
      if (!tagInput.trim()) return;
      const clean = tagInput.trim().toLowerCase();
      if (!tags.includes(clean)) {
        onChange([...tags, clean]);
      }
      setTagInput('');
    };

    const handleRemoveTag = (t: string) => {
      onChange(tags.filter((item) => item !== t));
    };

    return (
      <div>
        <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Type tag and press Enter..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-charcoal-stone/20 text-xs focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 rounded-xl bg-forest-emerald text-white text-xs font-semibold hover:bg-forest-emerald/90 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tag
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest-emerald/10 text-forest-emerald text-xs font-medium"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-500"
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

  // Fallback / default
  return (
    <div>
      <label className="block text-xs font-semibold text-charcoal-stone mb-1.5">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-stone/20 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
      />
    </div>
  );
}
