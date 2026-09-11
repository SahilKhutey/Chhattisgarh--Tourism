import React from "react";
import Link from "next/link";
import type { PublicContent } from "@/types/public-content";

export function ContentHeader({ content }: { content: PublicContent }) {
  const name =
    content.name ??
    content.fields.find((f) => f.key === "name" || f.key === "title")?.value ??
    content.slug;

  return (
    <header className="space-y-4">
      {content.breadcrumbs && content.breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            {content.breadcrumbs.map((item, idx) => (
              <li key={item.href} className="flex items-center gap-2">
                {idx > 0 && <span className="text-slate-600">/</span>}
                {idx === content.breadcrumbs.length - 1 ? (
                  <span className="text-slate-200 font-medium" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
          {String(name)}
        </h1>
        {content.description && (
          <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
            {content.description}
          </p>
        )}
      </div>
    </header>
  );
}
