"use client";

import React from "react";

interface Props {
  status: string;
}

export function AccessibilityStatusBadge({ status }: Props) {
  if (status === "PASS") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        PASS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
      FAIL
    </span>
  );
}
