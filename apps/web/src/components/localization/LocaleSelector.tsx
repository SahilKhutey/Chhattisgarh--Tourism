"use client";

import React from "react";
import type { Locale } from "@/types/localization";

interface Props {
  selectedLocale: string;
  onChange: (locale: string) => void;
  locales?: Locale[];
  className?: string;
  disabled?: boolean;
}

const DEFAULT_LOCALES: Locale[] = [
  { code: "en", name: "English", native_name: "English", is_default: true, enabled: true },
  { code: "hi", name: "Hindi", native_name: "हिन्दी", is_default: false, enabled: true },
  { code: "chg", name: "Chhattisgarhi", native_name: "छत्तीसगढ़ी", is_default: false, enabled: true },
];

export function LocaleSelector({
  selectedLocale,
  onChange,
  locales = DEFAULT_LOCALES,
  className = "",
  disabled = false,
}: Props) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label
        htmlFor="locale-selector"
        className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0"
      >
        Language
      </label>
      <select
        id="locale-selector"
        value={selectedLocale}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
      >
        {locales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.native_name} ({loc.code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
}
