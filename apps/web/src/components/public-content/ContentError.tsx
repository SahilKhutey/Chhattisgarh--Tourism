"use client";

import React from "react";
import Link from "next/link";

interface Props {
  title?: string;
  message?: string;
  reset?: () => void;
  locale?: string;
}

export function ContentError({
  title = "Something went wrong",
  message = "We couldn't load this tourism page.",
  reset,
  locale = "en",
}: Props) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
        <span className="text-2xl font-bold">!</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-100">{title}</h1>
        <p className="text-slate-400">{message}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        {reset && (
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-400 transition-colors shadow-sm"
          >
            Try again
          </button>
        )}

        <Link
          href={`/${locale}`}
          className="rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
