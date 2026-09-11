"use client";

import React from "react";
import type { LocalizationCompleteness } from "@/types/localization";

interface Props {
  completeness: LocalizationCompleteness;
  localeName?: string;
}

export function TranslationCompletenessBadge({ completeness, localeName }: Props) {
  const { percentage, complete, translated_fields, total_fields, locale_code } = completeness;
  const label = localeName || locale_code.toUpperCase();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">
          {label} Translation
        </span>
        <span className="text-slate-400">
          {translated_fields}/{total_fields} fields ({percentage}%)
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full transition-all duration-300 ${
            complete ? "bg-emerald-500" : percentage > 0 ? "bg-teal-500" : "bg-slate-600"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      <div className="flex justify-end">
        {complete ? (
          <span className="text-[11px] font-medium text-emerald-400">
            ✓ 100% Complete
          </span>
        ) : (
          <span className="text-[11px] font-medium text-amber-400">
            ⚠ Incomplete ({total_fields - translated_fields} missing)
          </span>
        )}
      </div>
    </div>
  );
}
