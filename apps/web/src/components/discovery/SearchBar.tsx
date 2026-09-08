'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { fetchSearchSuggestions } from '../../lib/discovery/api';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({
  initialValue = '',
  placeholder = 'Search destinations, festivals, crafts, folklore...',
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const list = await fetchSearchSuggestions(trimmed, 6);
        setSuggestions(list || []);
      } catch (err) {
        console.warn('Suggestions error', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(value.trim());
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleClear = () => {
    setValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} role="search" className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-stone-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="search"
          value={value}
          placeholder={placeholder}
          aria-label="Search tourism content"
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          className="w-full pl-11 pr-24 py-3.5 bg-white rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden z-30 divide-y divide-stone-100">
          {loadingSuggestions && (
            <div className="flex items-center gap-2 p-3 text-xs text-stone-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Looking for matches...</span>
            </div>
          )}

          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full px-4 py-2.5 text-left text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
