"use client";

import React from 'react';
import { Filter, X, Droplets, Trees, Landmark, Users, Mountain, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { slug: '', label: 'All Destinations', icon: Sparkles },
  { slug: 'waterfalls', label: 'Waterfalls', icon: Droplets },
  { slug: 'temples-heritage', label: 'Heritage & Temples', icon: Landmark },
  { slug: 'wildlife-forests', label: 'Forests & Wildlife', icon: Trees },
  { slug: 'tribal-culture', label: 'Tribal Culture', icon: Users },
  { slug: 'caves-adventure', label: 'Caves & Adventure', icon: Mountain },
];

const POPULAR_DISTRICTS = [
  { slug: '', name: 'All Districts' },
  { slug: 'bastar', name: 'Bastar' },
  { slug: 'raipur', name: 'Raipur' },
  { slug: 'bilaspur', name: 'Bilaspur' },
  { slug: 'dantewada', name: 'Dantewada' },
  { slug: 'kabirdham', name: 'Kabirdham' },
  { slug: 'surguja', name: 'Surguja' },
  { slug: 'dhamtari', name: 'Dhamtari' },
  { slug: 'kanker', name: 'Kanker' },
];

interface SearchFiltersProps {
  selectedCategory?: string;
  onSelectCategory: (slug?: string) => void;
  selectedDistrict?: string;
  onSelectDistrict: (slug?: string) => void;
  onReset: () => void;
  className?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedDistrict,
  onSelectDistrict,
  onReset,
  className = '',
}) => {
  const hasActiveFilters = Boolean(selectedCategory || selectedDistrict);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Category Horizontal Scroll Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = (!selectedCategory && !cat.slug) || selectedCategory === cat.slug;

          return (
            <button
              key={cat.slug || 'all'}
              type="button"
              onClick={() => onSelectCategory(cat.slug || undefined)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs md:text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* District & Reset Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            District:
          </label>
          <select
            value={selectedDistrict || ''}
            onChange={(e) => onSelectDistrict(e.target.value || undefined)}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {POPULAR_DISTRICTS.map((d) => (
              <option key={d.slug || 'all'} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
