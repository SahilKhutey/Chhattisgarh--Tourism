"use client";
import React from "react";

interface Props {
  preferred: boolean;
  deprecated: boolean;
}

export function GlossaryStatusBadge({ preferred, deprecated }: Props) {
  if (deprecated) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
        Deprecated
      </span>
    );
  }
  if (preferred) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        Preferred
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">
      Standard
    </span>
  );
}
