"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Compass, Tag } from 'lucide-react';
import { SearchSuggestion } from '../api/discovery-api';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  suggestions?: SearchSuggestion[];
  onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  onSelectSuggestion,
  placeholder = "Search destinations, waterfalls, Bastar, temples...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      onSubmit?.();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'district':
        return <MapPin className="h-4 w-4 text-emerald-600" />;
      case 'category':
        return <Tag className="h-4 w-4 text-amber-600" />;
      default:
        return <Compass className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 py-3.5 pl-12 pr-10 text-sm md:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm backdrop-blur-md transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute right-3.5 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl backdrop-blur-lg animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="py-2">
            <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Suggestions
            </div>
            {suggestions.map((item, index) => (
              <button
                key={`${item.type}-${item.slug}-${index}`}
                type="button"
                onClick={() => {
                  onSelectSuggestion?.(item);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {getIconForType(item.type)}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</span>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
