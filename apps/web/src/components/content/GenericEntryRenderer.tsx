'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';
import { MapPin, Calendar, Clock, Tag, ExternalLink } from 'lucide-react';

const GenericMap = dynamic(() => import('./GenericMap'), {
  ssr: false,
  loading: () => (
    <div className="h-56 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400">
      Loading interactive map...
    </div>
  ),
});

export interface Field {
  key: string;
  label: string;
  fieldType: string;
  order: number;
}

export interface GenericEntryRendererProps {
  template: {
    name: string;
    fields: Field[];
  };
  entry: {
    id?: string;
    slug?: string;
    data: Record<string, unknown>;
    lat?: number | null;
    lng?: number | null;
    publishedAt?: string | null;
    createdAt?: string;
  };
}

export function GenericEntryRenderer({
  template,
  entry,
}: GenericEntryRendererProps) {
  const fields = [...template.fields].sort((a, b) => a.order - b.order);

  // Extract hero image if present
  const imageField = fields.find((f) => f.fieldType === 'IMAGE' && Boolean(entry.data?.[f.key]));
  const heroUrl = imageField ? String(entry.data[imageField.key]) : null;

  // Resolved coordinates
  const lat = entry.lat ?? (entry.data?.location as any)?.lat ?? null;
  const lng = entry.lng ?? (entry.data?.location as any)?.lng ?? null;
  const hasCoordinates = lat !== null && lng !== null && typeof lat === 'number' && typeof lng === 'number';

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Hero Banner */}
      {heroUrl && (
        <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroUrl}
            alt={template.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-xs font-semibold uppercase tracking-wider">
              {template.name}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-2">
              {String(entry.data?.title || entry.data?.name || template.name)}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="space-y-6">
        {fields.map((field) => {
          // Skip hero image in the body since it's displayed on top
          if (field.key === imageField?.key && heroUrl) return null;

          const value = entry.data[field.key];
          if (value === null || value === undefined || value === '') {
            return null;
          }

          return (
            <section
              key={field.key}
              data-field={field.key}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm"
            >
              <h2 className="text-base font-bold text-stone-900 mb-3 border-b border-stone-100 pb-2">
                {field.label}
              </h2>
              <RenderedValue field={field} value={value} />
            </section>
          );
        })}

        {/* Geographic Location Map */}
        {hasCoordinates && (
          <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-stone-900">Geographic Location</h2>
              </div>
              <span className="text-xs font-mono text-stone-500">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
            <GenericMap
              lat={lat}
              lng={lng}
              title={String(entry.data?.title || template.name)}
              height="280px"
            />
          </section>
        )}
      </div>
    </article>
  );
}

function RenderedValue({
  field,
  value,
}: {
  field: Field;
  value: unknown;
}) {
  switch (field.fieldType) {
    case 'RICHTEXT':
      return (
        <div
          className="prose prose-sm max-w-none text-stone-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(String(value)),
          }}
        />
      );

    case 'IMAGE':
      return (
        <div className="relative w-full max-w-lg h-64 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={String(value)}
            alt={field.label}
            className="w-full h-full object-cover"
          />
        </div>
      );

    case 'GALLERY':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.isArray(value) &&
            value.map((image, i) => (
              <div
                key={i}
                className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={String(image)}
                  alt={`${field.label} ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
        </div>
      );

    case 'TAGS':
      return (
        <div className="flex flex-wrap gap-2">
          {Array.isArray(value) &&
            value.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
              >
                <Tag className="w-3 h-3 text-emerald-600" />
                {String(tag)}
              </span>
            ))}
        </div>
      );

    case 'BOOLEAN':
      return (
        <span className="font-semibold text-stone-800 text-sm">
          {Boolean(value) ? 'Yes' : 'No'}
        </span>
      );

    case 'GEO_POINT':
      if (typeof value === 'object' && value !== null) {
        const p = value as Record<string, any>;
        return (
          <span className="font-mono text-xs text-stone-600">
            Coordinates: {p.lat}, {p.lng}
          </span>
        );
      }
      return <span>{String(value)}</span>;

    default:
      return (
        <p className="text-sm text-stone-700 leading-relaxed">
          {String(value)}
        </p>
      );
  }
}
export default GenericEntryRenderer;
