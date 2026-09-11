import React from "react";

export default function Loading() {
  return (
    <main
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      aria-busy="true"
    >
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-48 rounded bg-slate-800" />
        <div className="h-12 w-2/3 rounded-lg bg-slate-800" />
        <div className="h-5 w-full max-w-2xl rounded bg-slate-800/60" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 space-y-6 animate-pulse">
        <div className="h-8 w-40 rounded bg-slate-800" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-slate-800/60" />
          <div className="h-4 w-5/6 rounded bg-slate-800/60" />
          <div className="h-4 w-4/6 rounded bg-slate-800/60" />
        </div>
      </div>
    </main>
  );
}
