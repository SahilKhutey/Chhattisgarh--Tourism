'use client';

import React from 'react';
import { Search, MapPin } from 'lucide-react';
import type { SuggestionItem } from '@/lib/api/search';

interface SearchSuggestionsProps {
  suggestions: SuggestionItem[];
  selectedIndex: number;
  onSelect: (suggestion: SuggestionItem) => void;
}

export function SearchSuggestions({
  suggestions,
  selectedIndex,
  onSelect,
}: SearchSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <ul
      id="search-suggestions"
      role="listbox"
      aria-label="Search suggestions"
      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1.5 focus:outline-none"
    >
      {suggestions.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <li
            key={`${item.text}-${index}`}
            id={`suggestion-${index}`}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(item)}
            className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
              isSelected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">{item.text}</span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 ml-2">
              {item.type}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
