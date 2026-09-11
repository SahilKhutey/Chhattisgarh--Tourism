"use client";

import React from "react";

interface Props {
  total: number;
  blockers: number;
  averageScore: number;
}

export function AccessibilitySummary({ total, blockers, averageScore }: Props) {
  return (
    <section
      aria-label="Accessibility summary"
      className="grid gap-4 md:grid-cols-3"
    >
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Audited Entries
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-100">
          {total}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Blocking Issues
        </p>
        <p className={`mt-2 text-3xl font-bold ${blockers > 0 ? "text-rose-400" : "text-emerald-400"}`}>
          {blockers}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Average Score
        </p>
        <p className="mt-2 text-3xl font-bold text-teal-400">
          {averageScore}%
        </p>
      </div>
    </section>
  );
}
