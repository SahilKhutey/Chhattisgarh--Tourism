import React, { type ReactNode } from "react";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import type { PublicField } from "@/types/public-content";

function TextRenderer({ field }: { field: PublicField }): ReactNode {
  if (field.value === null || field.value === undefined || field.value === "") {
    return null;
  }
  return <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{String(field.value)}</p>;
}

function RichTextRenderer({ field }: { field: PublicField }): ReactNode {
  if (typeof field.value !== "string" || !field.value.trim()) {
    return null;
  }

  const cleanHtml = DOMPurify.sanitize(field.value);

  return (
    <div
      className="prose prose-invert max-w-none text-slate-300 prose-headings:text-slate-100 prose-a:text-teal-400 hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

function NumberRenderer({ field }: { field: PublicField }): ReactNode {
  if (typeof field.value !== "number") {
    return null;
  }
  return <span className="font-mono text-slate-200 text-lg font-semibold">{field.value}</span>;
}

function BooleanRenderer({ field }: { field: PublicField }): ReactNode {
  if (typeof field.value !== "boolean") {
    return null;
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        field.value ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "bg-slate-700/50 text-slate-400"
      }`}
    >
      {field.value ? "Yes" : "No"}
    </span>
  );
}

function BadgesRenderer({ field }: { field: PublicField }): ReactNode {
  if (!Array.isArray(field.value) || field.value.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {field.value.map((item, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
        >
          {String(item)}
        </span>
      ))}
    </div>
  );
}

function ImageRenderer({ field }: { field: PublicField }): ReactNode {
  if (!field.value || typeof field.value !== "object") {
    return null;
  }

  const image = field.value as {
    url?: string;
    alt_text?: string;
    alt?: string;
    caption?: string;
  };

  if (!image.url) {
    return null;
  }

  const alt = image.alt_text ?? image.alt ?? "";

  return (
    <figure className="space-y-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      <img
        src={image.url}
        alt={alt}
        loading="lazy"
        className="w-full max-h-[500px] object-cover"
      />
      {image.caption && (
        <figcaption className="p-3 text-xs text-slate-400 italic text-center">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function GalleryRenderer({ field }: { field: PublicField }): ReactNode {
  if (!Array.isArray(field.value) || field.value.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {field.value.map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const img = item as { url?: string; alt_text?: string; alt?: string; caption?: string };
        if (!img.url) return null;
        return (
          <figure key={index} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
            <img
              src={img.url}
              alt={img.alt_text ?? img.alt ?? ""}
              loading="lazy"
              className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {img.caption && (
              <figcaption className="p-2 text-xs text-slate-400 truncate">
                {img.caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}

function GeoPointRenderer({ field }: { field: PublicField }): ReactNode {
  if (!field.value || typeof field.value !== "object") {
    return null;
  }
  const geo = field.value as { latitude?: number; longitude?: number };
  if (geo.latitude === undefined || geo.longitude === undefined) {
    return null;
  }

  return (
    <div className="inline-flex items-center space-x-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
      <span className="font-mono text-teal-400 text-xs">
        {geo.latitude.toFixed(4)}° N, {geo.longitude.toFixed(4)}° E
      </span>
    </div>
  );
}

function RelationRenderer({ field }: { field: PublicField }): ReactNode {
  if (!Array.isArray(field.value) || field.value.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {field.value.map((rel: any, idx: number) => {
        if (!rel || typeof rel !== "object") return null;
        return (
          <Link
            key={rel.id ?? idx}
            href={rel.url ?? "#"}
            className="group block rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-teal-500/40 hover:bg-slate-850"
          >
            {rel.hero_image?.url && (
              <img
                src={rel.hero_image.url}
                alt={rel.hero_image.alt_text ?? rel.name}
                loading="lazy"
                className="mb-3 aspect-video w-full rounded-lg object-cover"
              />
            )}
            <h4 className="font-semibold text-slate-100 group-hover:text-teal-400 transition-colors">
              {rel.name ?? rel.slug}
            </h4>
          </Link>
        );
      })}
    </div>
  );
}

function MediaEmbedRenderer({ field }: { field: PublicField }): ReactNode {
  if (!field.value) return null;
  const media = typeof field.value === "string" ? { url: field.value } : (field.value as { url?: string });
  if (!media.url) return null;

  if (field.type === "VIDEO") {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
        <video src={media.url} controls className="h-full w-full object-cover" />
      </div>
    );
  }

  if (field.type === "AUDIO") {
    return (
      <div className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3">
        <audio src={media.url} controls className="w-full" />
      </div>
    );
  }

  return null;
}

export function renderPublicField(field: PublicField): ReactNode {
  switch (field.type) {
    case "TEXT":
    case "TEXTAREA":
    case "DATE":
    case "DATETIME":
    case "TIME":
    case "DROPDOWN":
      return <TextRenderer field={field} />;

    case "RICHTEXT":
      return <RichTextRenderer field={field} />;

    case "NUMBER":
      return <NumberRenderer field={field} />;

    case "BOOLEAN":
      return <BooleanRenderer field={field} />;

    case "TAGS":
    case "MULTI_SELECT":
      return <BadgesRenderer field={field} />;

    case "IMAGE":
      return <ImageRenderer field={field} />;

    case "GALLERY":
      return <GalleryRenderer field={field} />;

    case "GEO_POINT":
      return <GeoPointRenderer field={field} />;

    case "RELATION":
      return <RelationRenderer field={field} />;

    case "VIDEO":
    case "AUDIO":
      return <MediaEmbedRenderer field={field} />;

    default:
      return <TextRenderer field={field} />;
  }
}
