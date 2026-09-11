"use client";

import React, { useMemo } from "react";
import { RuntimeSchema } from "../../types/content-entry";

interface EntryPreviewProps {
  title: string;
  slug: string;
  schema: RuntimeSchema;
  values: Record<string, unknown>;
}

export function EntryPreview({
  title,
  slug,
  schema,
  values,
}: EntryPreviewProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Array<{ label: string; value: unknown; type: string }>>();
    const sorted = [...schema.fields].sort((a, b) => a.order - b.order);

    for (const f of sorted) {
      const g = f.group?.trim() || "General";
      const list = map.get(g) || [];
      const val = values[f.key];
      if (val !== undefined && val !== null && val !== "") {
        list.push({ label: f.label, value: val, type: f.type });
      }
      map.set(g, list);
    }
    return Array.from(map.entries());
  }, [schema.fields, values]);

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
          Template: {schema.template.slug} (v{schema.template.version})
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          {title || "Untitled Entry"}
        </h1>
        {slug && (
          <p className="text-xs text-gray-400 font-mono mt-0.5">/{slug}</p>
        )}
      </div>

      <div className="space-y-6">
        {groups.map(([groupName, fields]) => (
          <div key={groupName} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {groupName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((f, i) => (
                <div key={i} className="text-sm bg-gray-50 p-3 rounded-md">
                  <span className="block text-xs font-medium text-gray-500 mb-1">
                    {f.label}
                  </span>
                  <div className="text-gray-900 font-medium">
                    {formatPreviewValue(f.value, f.type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPreviewValue(value: unknown, type: string): React.ReactNode {
  if (type === "BOOLEAN") {
    return value ? "Yes" : "No";
  }
  if (type === "GEO_POINT" && typeof value === "object" && value !== null) {
    const geo = value as { latitude?: number; longitude?: number };
    return `${geo.latitude ?? "-"}, ${geo.longitude ?? "-"}`;
  }
  if (type === "TAGS" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  }
  if (type === "IMAGE" && typeof value === "object" && value !== null) {
    const img = value as { url?: string; alt?: string };
    return (
      <div className="text-xs space-y-1">
        <p className="truncate text-blue-600">{img.url}</p>
        {img.alt && <p className="text-gray-500 italic">Alt: "{img.alt}"</p>}
      </div>
    );
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
