"use client";

import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { PublicContent, PublicContentField } from "../../types/content-entry";

export function ContentRenderer({ content }: { content: PublicContent }) {
  const groups = useMemo(() => {
    const map = new Map<string, PublicContentField[]>();

    for (const field of content.fields) {
      const group = field.group?.trim() || "Overview";
      const existing = map.get(group) || [];
      existing.push(field);
      map.set(group, existing);
    }

    return Array.from(map.entries());
  }, [content.fields]);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <header className="border-b border-gray-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
          {content.template.slug} &bull; v{content.template.version}
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
          {content.entry.title}
        </h1>
      </header>

      <div className="space-y-12">
        {groups.map(([groupName, fields]) => (
          <section key={groupName} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-100 pb-2">
              {groupName}
            </h2>
            <div className="space-y-6">
              {fields.map((field) => (
                <RenderedField key={field.key} field={field} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function RenderedField({ field }: { field: PublicContentField }) {
  if (field.value === null || field.value === undefined || field.value === "") {
    return null;
  }

  switch (field.type) {
    case "TEXT":
      return (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <p className="mt-1 text-lg text-gray-900">{String(field.value)}</p>
        </div>
      );

    case "TEXTAREA":
      return (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <p className="mt-1 text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
            {String(field.value)}
          </p>
        </div>
      );

    case "RICHTEXT":
      return (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {field.label}
          </h3>
          <div
            className="prose prose-amber max-w-none text-gray-800"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(String(field.value)),
            }}
          />
        </section>
      );

    case "BOOLEAN":
      return (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <p className="mt-1 text-base font-medium text-gray-900">
            {field.value ? "Yes" : "No"}
          </p>
        </div>
      );

    case "NUMBER":
      return (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {String(field.value)}
          </p>
        </div>
      );

    case "GEO_POINT": {
      const geo = field.value as { latitude?: number; longitude?: number };
      return (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <p className="mt-1 text-base text-gray-800 font-mono">
            {geo.latitude}, {geo.longitude}
          </p>
        </div>
      );
    }

    case "IMAGE": {
      const img = typeof field.value === "object" ? (field.value as { url?: string; alt?: string }) : { url: String(field.value), alt: field.label };
      if (!img.url) return null;
      return (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm max-w-2xl mt-2">
            <img
              src={img.url}
              alt={img.alt || field.label}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          {img.alt && (
            <p className="text-xs text-gray-500 italic mt-1">{img.alt}</p>
          )}
        </div>
      );
    }

    case "GALLERY": {
      const items = Array.isArray(field.value) ? (field.value as Array<{ url?: string; alt?: string }>) : [];
      if (items.length === 0) return null;
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {items.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                {item.url && (
                  <img
                    src={item.url}
                    alt={item.alt || `Gallery image ${idx + 1}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
                {item.alt && (
                  <p className="p-2 text-xs text-gray-600 truncate">{item.alt}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "TAGS": {
      const tags = Array.isArray(field.value) ? (field.value as string[]) : [];
      if (tags.length === 0) return null;
      return (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {field.label}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      );
    }

    default:
      return (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}
          </h3>
          <div className="mt-1 text-sm text-gray-800">
            {typeof field.value === "object" ? (
              <pre className="overflow-auto rounded border bg-gray-50 p-3 text-xs">
                {JSON.stringify(field.value, null, 2)}
              </pre>
            ) : (
              String(field.value)
            )}
          </div>
        </div>
      );
  }
}
