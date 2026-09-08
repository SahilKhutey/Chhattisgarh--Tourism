'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Eye,
  CheckCircle2,
  Share2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { ContentEntry } from '../../types/content';

const GenericMap = dynamic(() => import('./GenericMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400">
      Loading location map...
    </div>
  ),
});

interface GenericRendererProps {
  entry: ContentEntry;
}

export const GenericRenderer: React.FC<GenericRendererProps> = ({ entry }) => {
  const { title, template, data, lat, lng, createdAt } = entry;
  const fields = template?.fields || [];

  // Categorize fields
  const heroImageField = fields.find(
    (f) => f.type === 'IMAGE' && Boolean(data?.[f.key]),
  );
  const heroImageUrl = heroImageField ? data[heroImageField.key] : null;

  const galleryField = fields.find(
    (f) => f.type === 'GALLERY' && Array.isArray(data?.[f.key]) && data[f.key].length > 0,
  );
  const galleryImages: string[] = galleryField ? data[galleryField.key] : [];

  const richTextFields = fields.filter(
    (f) => f.type === 'RICHTEXT' && Boolean(data?.[f.key]),
  );

  const tagsField = fields.find(
    (f) => f.type === 'TAGS' && Array.isArray(data?.[f.key]) && data[f.key].length > 0,
  );
  const tags: string[] = tagsField ? data[tagsField.key] : [];

  const detailFields = fields.filter(
    (f) =>
      !['IMAGE', 'GALLERY', 'RICHTEXT', 'TAGS', 'GEO_POINT'].includes(f.type) &&
      data?.[f.key] !== undefined &&
      data?.[f.key] !== null &&
      data?.[f.key] !== '',
  );

  // Resolved coordinates (entry top-level or data.geo)
  const resolvedLat = lat ?? data?.location?.lat ?? null;
  const resolvedLng = lng ?? data?.location?.lng ?? null;
  const hasCoordinates = resolvedLat !== null && resolvedLng !== null;

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Hero Image Section */}
      {heroImageUrl && (
        <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl}
            alt={title}
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur text-xs font-semibold uppercase tracking-wider">
                {template?.name || 'Experience'}
              </span>
              <span className="text-xs text-stone-300">Chhattisgarh Heritage</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {title}
            </h1>
          </div>
        </div>
      )}

      {/* Title Header (if no hero image) */}
      {!heroImageUrl && (
        <header className="border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              {template?.name || 'Experience'}
            </span>
            <span className="text-xs text-stone-400">Published Tourism Content</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-stone-500 mt-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Public Entry
            </span>
          </div>
        </header>
      )}

      {/* Tags Chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <Tag className="w-3 h-3 text-stone-400" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 cols: Narrative / Rich Text & Gallery */}
        <div className="lg:col-span-2 space-y-8">
          {richTextFields.map((rf) => (
            <section key={rf.key} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 mb-3">{rf.label}</h2>
              <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {data[rf.key]}
              </div>
            </section>
          ))}

          {/* Photo Gallery Grid */}
          {galleryImages.length > 0 && (
            <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 mb-4">Photo Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`${title} photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interactive Geographic Map */}
          {hasCoordinates && (
            <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-stone-900">Geographic Location</h2>
                </div>
                <span className="text-xs font-mono text-stone-500">
                  {resolvedLat.toFixed(4)}, {resolvedLng.toFixed(4)}
                </span>
              </div>
              <GenericMap
                lat={resolvedLat}
                lng={resolvedLng}
                title={title}
                height="300px"
              />
            </section>
          )}
        </div>

        {/* Right 1 col: Key Details & Attributes Card */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
              Attributes & Details
            </h3>

            <div className="space-y-3 text-xs">
              {detailFields.map((field) => {
                const val = data[field.key];
                let displayVal = String(val);

                if (field.type === 'BOOLEAN') {
                  displayVal = val ? 'Yes' : 'No';
                } else if (field.type === 'DATE') {
                  displayVal = new Date(val).toLocaleDateString();
                } else if (field.type === 'DROPDOWN' && field.options) {
                  const match = field.options.find((o) => o.value === val);
                  if (match) displayVal = match.label;
                }

                return (
                  <div
                    key={field.key}
                    className="flex items-start justify-between py-1.5 border-b border-stone-50 last:border-0"
                  >
                    <span className="text-stone-500 font-medium">{field.label}</span>
                    <span className="font-semibold text-stone-800 text-right max-w-[60%] truncate">
                      {displayVal}
                    </span>
                  </div>
                );
              })}

              {template && (
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Template Type</span>
                  <span className="font-mono text-stone-600">{template.slug}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};
