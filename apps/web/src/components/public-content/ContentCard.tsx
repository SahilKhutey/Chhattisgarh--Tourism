import React from "react";
import Link from "next/link";

interface Props {
  href: string;
  title: string;
  description?: string | null;
  image?: {
    url: string;
    alt_text?: string;
  } | null;
}

export function ContentCard({
  href,
  title,
  description,
  image,
}: Props) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all hover:border-teal-500/40 hover:bg-slate-850 shadow-md">
      {image?.url && (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
          <img
            src={image.url}
            alt={image.alt_text ?? title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="space-y-2.5 p-5">
        <h2 className="text-xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
          <Link href={href} className="focus:outline-none">
            {title}
          </Link>
        </h2>

        {description && (
          <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </article>
  );
}
