"use client";

import React from 'react';
import { useTranslation } from './TranslationProvider';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { locale, setLocale, languages } = useTranslation();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label htmlFor="p12-language-switcher" className="sr-only">
        Select platform language
      </label>
      <select
        id="p12-language-switcher"
        aria-label="Select platform language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        className="appearance-none bg-sand-beige/60 text-charcoal-stone font-semibold text-xs py-1.5 pl-3 pr-8 rounded-lg border border-charcoal-stone/20 hover:bg-sand-beige focus:outline-none focus:ring-2 focus:ring-tribal-terracotta cursor-pointer transition-colors shadow-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-sand-beige text-charcoal-stone">
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="absolute right-2 pointer-events-none text-xs text-charcoal-stone/60">
        ▼
      </span>
    </div>
  );
};
