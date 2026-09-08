'use client';

import React from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  TemplateFieldModel,
  RendererContext,
  getFieldRenderer,
} from './field-registry';
import { DefaultField } from './renderers';
import { RendererErrorBoundary } from './RendererErrorBoundary';
import { GeoField } from './GeoField';

// Ensure renderers are registered
import './renderers';

export interface ContentRendererEntry {
  id?: string;
  title?: string;
  slug?: string;
  data: Record<string, unknown>;
  region?: string | null;
  division?: string | null;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
  publishedAt?: string | Date | null;
  template?: {
    id?: string;
    name: string;
    slug: string;
    version?: number;
    fields: TemplateFieldModel[];
  };
}

export interface ContentRendererProps {
  entry: ContentRendererEntry;
  context?: RendererContext;
  className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  entry,
  context,
  className = '',
}) => {
  const data = entry.data || {};
  const fields = [...(entry.template?.fields || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  // Derive title
  const title =
    entry.title ||
    (typeof data.title === 'string' ? data.title : null) ||
    (typeof data.name === 'string' ? data.name : null) ||
    'Tourism Experience';

  // Identify hero image (first IMAGE field or data.heroImage or data.image)
  const heroField = fields.find(
    (f) =>
      (f.fieldType === 'IMAGE' || f.key === 'heroImage' || f.key === 'image') &&
      typeof data[f.key] === 'string' &&
      Boolean(data[f.key]),
  );
  const heroUrl = heroField
    ? (data[heroField.key] as string)
    : (data.heroImage as string) || (data.image as string) || null;

  // Format published date
  const publishedDate = entry.publishedAt ? new Date(entry.publishedAt) : null;
  const formattedDate =
    publishedDate && !isNaN(publishedDate.getTime())
      ? publishedDate.toLocaleDateString(context?.locale || undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

  // Handle share
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Check if coordinates were already rendered by a GEO_POINT field
  const hasGeoPointField = fields.some(
    (f) =>
      (f.fieldType === 'GEO_POINT' || f.fieldType === 'MAP_REGION') &&
      Boolean(data[f.key]),
  );

  const lat = entry.lat ?? (data.location as any)?.lat ?? null;
  const lng = entry.lng ?? (data.location as any)?.lng ?? null;
  const showTrailingMap =
    !hasGeoPointField &&
    lat !== null &&
    lng !== null &&
    typeof lat === 'number' &&
    typeof lng === 'number';

  return (
    <article className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {/* Hero Header */}
      {heroUrl && (
        <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {entry.template && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {entry.template.name}
                </span>
              )}
              {entry.district && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/40 text-stone-200 backdrop-blur-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {entry.district}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
              {title}
            </h1>
          </div>
        </div>
      )}

      {/* Non-hero header fallback */}
      {!heroUrl && (
        <header className="border-b border-stone-200 pb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {entry.template && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {entry.template.name}
              </span>
            )}
            {entry.district && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {entry.district}
              </span>
            )}
            {formattedDate && (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-stone-900">
              {title}
            </h1>
            <button
              type="button"
              onClick={handleShare}
              title="Share link"
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      {/* Dynamic Fields Body */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {fields.map((field) => {
          // If this field was used as heroUrl, skip repeating it as the first item unless it's a gallery
          if (heroField && field.key === heroField.key && field.fieldType === 'IMAGE') {
            return null;
          }

          const val = data[field.key];
          // Omit empty/undefined values
          if (val === undefined || val === null || val === '') {
            return null;
          }
          if (Array.isArray(val) && val.length === 0) {
            return null;
          }

          const Renderer = getFieldRenderer(field.fieldType) || DefaultField;

          return (
            <RendererErrorBoundary
              key={field.key}
              fieldKey={field.key}
              fallbackTitle={field.label}
            >
              <div className="border-b border-stone-100 last:border-0 pb-6 last:pb-0">
                <Renderer field={field} value={val} context={context} />
              </div>
            </RendererErrorBoundary>
          );
        })}

        {/* Trailing Map Section if entry has coordinates not rendered by a field */}
        {showTrailingMap && (
          <div className="border-t border-stone-100 pt-6">
            <GeoField
              field={{
                key: 'location',
                label: 'Geographic Location',
                fieldType: 'GEO_POINT',
              }}
              value={{ lat, lng }}
              context={context}
            />
          </div>
        )}
      </div>
    </article>
  );
};
