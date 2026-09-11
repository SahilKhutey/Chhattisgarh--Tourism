'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';

const GenericMap = dynamic(
  () => import('./GenericMap').then((mod) => mod.GenericMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400">
        Loading interactive map...
      </div>
    ),
  },
);

type Field = {
  key: string;
  label: string;
  fieldType: string;
  order: number;
};

type Props = {
  template: {
    name: string;
    fields: Field[];
  };
  entry: {
    data: Record<string, unknown>;
    latitude?: number | null;
    longitude?: number | null;
    lat?: number | null;
    lng?: number | null;
  };
};

export function DynamicEntryPage({ template, entry }: Props) {
  const orderedFields = [...template.fields].sort((a, b) => a.order - b.order);

  const titleField = orderedFields.find(
    (field) => field.fieldType === 'TEXT' && /title|name/i.test(field.key),
  );

  const heroField = orderedFields.find((field) => {
    if (field.fieldType !== 'IMAGE') return false;
    const val = entry.data[field.key];
    return typeof val === 'string' || (typeof val === 'object' && val !== null && typeof (val as any).url === 'string');
  });

  const bodyFields = orderedFields.filter(
    (field) => field !== titleField && field !== heroField,
  );

  const lat = entry.latitude ?? entry.lat ?? null;
  const lng = entry.longitude ?? entry.lng ?? null;

  const heroImageUrl = heroField
    ? typeof entry.data[heroField.key] === 'string'
      ? (entry.data[heroField.key] as string)
      : (entry.data[heroField.key] as any)?.url
    : null;

  const heroImageAlt = heroField && typeof entry.data[heroField.key] === 'object' && (entry.data[heroField.key] as any)?.altText
    ? (entry.data[heroField.key] as any).altText
    : (titleField ? String(entry.data[titleField.key] ?? '') : template.name);

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {heroField && heroImageUrl && (
        <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl}
            alt={heroImageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="border-b border-stone-200 pb-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
          {template.name}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          {titleField ? String(entry.data[titleField.key] ?? '') : template.name}
        </h1>
      </header>

      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-8 shadow-xs">
        {bodyFields.map((field) => {
          const val = entry.data[field.key];
          if (val === undefined || val === null || val === '') return null;
          if (Array.isArray(val) && val.length === 0) return null;

          return (
            <section key={field.key} className="space-y-2 border-b border-stone-100 last:border-0 pb-6 last:pb-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {field.label}
              </h2>
              <DynamicValue field={field} value={val} />
            </section>
          );
        })}

        {lat != null && lng != null && (
          <section className="border-t border-stone-100 pt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Geographic Location
            </h2>
            <div className="h-80 rounded-xl overflow-hidden border border-stone-200 shadow-xs">
              <GenericMap
                lat={lat}
                lng={lng}
                title={titleField ? String(entry.data[titleField.key]) : template.name}
                height="100%"
              />
            </div>
            <p className="text-[11px] font-mono text-stone-500">
              Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </section>
        )}
      </section>
    </article>
  );
}

function DynamicValue({ field, value }: { field: Field; value: unknown }) {
  if (field.fieldType === 'TAGS' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item) => (
          <span
            key={String(item)}
            className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
          >
            #{String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (field.fieldType === 'RICHTEXT') {
    const cleanHtml = DOMPurify.sanitize(String(value ?? ''));
    return (
      <div
        className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-800"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm text-stone-800 leading-relaxed">
      {String(value ?? '')}
    </p>
  );
}
