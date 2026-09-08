'use client';

import React, { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Film,
  Music,
  ExternalLink,
  Layers,
} from 'lucide-react';
import {
  FieldRendererProps,
  registerFieldRenderer,
} from './field-registry';
import { GeoField } from './GeoField';

export const TextField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <p className="text-base text-stone-900 font-medium">{String(value)}</p>
    </div>
  );
};

export const TextAreaField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
        {String(value)}
      </p>
    </div>
  );
};

export const RichTextField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (!value) return null;
  const cleanHtml = DOMPurify.sanitize(String(value));
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <div
        className="prose prose-stone max-w-none text-sm text-stone-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
};

export const NumberField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  const formatted = isNaN(num) ? String(value) : num.toLocaleString();
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <p className="text-base font-semibold text-stone-900">{formatted}</p>
    </div>
  );
};

export const BooleanField: React.FC<FieldRendererProps> = ({ field, value }) => {
  const isTrue = Boolean(value);
  return (
    <div className="flex items-center gap-2 py-1">
      {isTrue ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {field.label}: Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
          <XCircle className="w-3.5 h-3.5 text-stone-400" />
          {field.label}: No
        </span>
      )}
    </div>
  );
};

export const DateField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (!value) return null;
  const date = new Date(String(value));
  const formatted = isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
        <Calendar className="w-3 h-3 text-stone-400" />
        {field.label}
      </span>
      <p className="text-sm font-medium text-stone-800">{formatted}</p>
    </div>
  );
};

export const DateTimeField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (!value) return null;
  const date = new Date(String(value));
  const formatted = isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
        <Clock className="w-3 h-3 text-stone-400" />
        {field.label}
      </span>
      <p className="text-sm font-medium text-stone-800">{formatted}</p>
    </div>
  );
};

export const TimeField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
        <Clock className="w-3 h-3 text-stone-400" />
        {field.label}
      </span>
      <p className="text-sm font-medium text-stone-800">{String(value)}</p>
    </div>
  );
};

export const ImageField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (!value || typeof value !== 'string') return null;
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm max-h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt={field.label}
          className="w-full h-auto object-cover max-h-96"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export const GalleryField: React.FC<FieldRendererProps> = ({ field, value }) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!Array.isArray(value) || value.length === 0) return null;

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-emerald-600" />
        {field.label} ({value.length})
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((imgUrl, index) => {
          if (!imgUrl || typeof imgUrl !== 'string') return null;
          return (
            <button
              type="button"
              key={index}
              onClick={() => setActiveImage(imgUrl)}
              className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`${field.label} ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>

      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt="Expanded view"
              className="max-h-[85vh] w-auto mx-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute top-3 right-3 text-white bg-stone-800/80 hover:bg-stone-800 p-2 rounded-full text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const TagsField: React.FC<FieldRendererProps> = ({ field, value }) => {
  const tags = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').map((t) => t.trim())
      : [];

  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
        <Tag className="w-3 h-3 text-stone-400" />
        {field.label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
          >
            #{String(tag)}
          </span>
        ))}
      </div>
    </div>
  );
};

export const DropdownField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <div>
        <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {String(value)}
        </span>
      </div>
    </div>
  );
};

export const MultiSelectField: React.FC<FieldRendererProps> = ({ field, value }) => {
  const items = Array.isArray(value) ? value : [value];
  if (items.length === 0 || !items[0]) return null;

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            {String(item)}
          </span>
        ))}
      </div>
    </div>
  );
};

export const RelationField: React.FC<FieldRendererProps> = ({ field, value, context }) => {
  if (!value) return null;

  const title =
    typeof value === 'object' && value !== null
      ? (value as any).title || (value as any).name || 'Related Content'
      : String(value);

  const href =
    typeof value === 'object' && value !== null && (value as any).slug
      ? `/content/${(value as any).templateSlug || 'items'}/${(value as any).slug}`
      : undefined;

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
        <ExternalLink className="w-3 h-3 text-stone-400" />
        {field.label}
      </span>
      {href ? (
        <a
          href={href}
          onClick={(e) => {
            if (context?.onNavigate) {
              e.preventDefault();
              context.onNavigate(href);
            }
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          {title} &rarr;
        </a>
      ) : (
        <span className="text-sm font-medium text-stone-800">{title}</span>
      )}
    </div>
  );
};

export const VideoField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (!value || typeof value !== 'string') return null;

  // Simple YouTube detection
  const isYouTube = value.includes('youtube.com') || value.includes('youtu.be');
  let embedUrl = value;
  if (isYouTube) {
    const videoId = value.includes('v=')
      ? value.split('v=')[1]?.split('&')[0]
      : value.split('/').pop();
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
        <Film className="w-3.5 h-3.5 text-stone-400" />
        {field.label}
      </span>
      <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-200 bg-black">
        {isYouTube ? (
          <iframe
            src={embedUrl}
            title={field.label}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video controls className="w-full h-full">
            <source src={value} />
            Your browser does not support video playback.
          </video>
        )}
      </div>
    </div>
  );
};

export const AudioField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (!value || typeof value !== 'string') return null;

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
        <Music className="w-3.5 h-3.5 text-stone-400" />
        {field.label}
      </span>
      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
        <audio controls className="w-full">
          <source src={value} />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export const DefaultField: React.FC<FieldRendererProps> = ({ field, value }) => {
  if (value === null || value === undefined || value === '') return null;
  const displayVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {field.label}
      </span>
      <p className="text-sm text-stone-800 font-mono text-xs bg-stone-50 p-2 rounded border border-stone-200">
        {displayVal}
      </p>
    </div>
  );
};

// Register all 16 field types
registerFieldRenderer('TEXT', TextField);
registerFieldRenderer('TEXTAREA', TextAreaField);
registerFieldRenderer('RICHTEXT', RichTextField);
registerFieldRenderer('NUMBER', NumberField);
registerFieldRenderer('BOOLEAN', BooleanField);
registerFieldRenderer('DATE', DateField);
registerFieldRenderer('DATETIME', DateTimeField);
registerFieldRenderer('TIME', TimeField);
registerFieldRenderer('IMAGE', ImageField);
registerFieldRenderer('GALLERY', GalleryField);
registerFieldRenderer('TAGS', TagsField);
registerFieldRenderer('DROPDOWN', DropdownField);
registerFieldRenderer('MULTI_SELECT', MultiSelectField);
registerFieldRenderer('GEO_POINT', GeoField);
registerFieldRenderer('MAP_REGION', GeoField);
registerFieldRenderer('RELATION', RelationField);
registerFieldRenderer('VIDEO', VideoField);
registerFieldRenderer('AUDIO', AudioField);
