import React from "react";
import type { PublicContent, PublicField } from "@/types/public-content";
import { renderPublicField } from "@/lib/content/fieldRegistry";

interface Props {
  content: PublicContent;
}

export function ContentRenderer({ content }: Props) {
  const groups = new Map<string, PublicField[]>();

  for (const field of content.fields) {
    // Skip name or title if it is rendered in the header
    const group = field.group ?? "General Information";
    const current = groups.get(group) ?? [];
    current.push(field);
    groups.set(group, current);
  }

  return (
    <article className="space-y-12">
      {Array.from(groups.entries()).map(([group, fields]) => (
        <section
          key={group}
          aria-labelledby={`group-${group.toLowerCase().replace(/\s+/g, "-")}`}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-6"
        >
          <h2
            id={`group-${group.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-3"
          >
            {group}
          </h2>

          <div className="space-y-6">
            {fields.map((field) => {
              const rendered = renderPublicField(field);
              if (!rendered) return null;

              return (
                <div key={field.key} className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-400">
                    {field.label}
                  </h3>
                  <div>{rendered}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </article>
  );
}
