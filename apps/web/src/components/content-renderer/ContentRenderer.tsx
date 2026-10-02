"use client";

import React, { useMemo } from "react";
import type { PublicContent } from "../../types/content-entry";
import { renderPublicField } from "@/lib/content/fieldRegistry";
import type { PublicField, PublicFieldType } from "@/types/public-content";
import { EmptyState } from "@/components/feedback/EmptyState";

export function ContentRenderer({ content }: { content: PublicContent }) {
  const groups = useMemo(() => {
    const map = new Map<string, PublicField[]>();

    for (const field of content.fields || []) {
      const group = field.group?.trim() || "Overview";
      const existing = map.get(group) || [];
      existing.push({
        key: field.key,
        label: field.label,
        type: field.type as PublicFieldType,
        value: field.value,
        group: field.group,
      });
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
        {groups.length === 0 ? (
          <EmptyState
            title="No Published Content Sections"
            description="There are currently no published fields or sections available for this destination entry."
            actionHref="/explore"
            actionLabel="Explore Destinations"
          />
        ) : (
          groups.map(([groupName, fields]) => (
            <section key={groupName} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-100 pb-2">
                {groupName}
              </h2>
              <div className="space-y-6">
                {fields.map((field) => {
                  try {
                    const rendered = renderPublicField(field);
                    if (!rendered) return null;
                    return (
                      <div key={field.key} className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-600">
                          {field.label}
                        </h3>
                        <div>{rendered}</div>
                      </div>
                    );
                  } catch (err) {
                    console.warn(`[ContentRenderer] Failed to render field "${field.key}":`, err);
                    return null;
                  }
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </article>
  );
}

export default ContentRenderer;
