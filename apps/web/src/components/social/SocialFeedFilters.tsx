'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Check } from 'lucide-react';

export interface FilterState {
  platform?: string;
  contentType?: string;
  district?: string;
}

interface SocialFeedFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

const DISTRICTS = [
  { id: 'bastar', name: 'Bastar (Jagdalpur)' },
  { id: 'surguja', name: 'Surguja (Mainpat)' },
  { id: 'mahasamund', name: 'Mahasamund (Sirpur / Barnawapara)' },
  { id: 'dantewada', name: 'Dantewada' },
  { id: 'raipur', name: 'Raipur' },
  { id: 'bilaspur', name: 'Bilaspur' },
  { id: 'durg', name: 'Durg' },
  { id: 'kanker', name: 'Kanker' },
  { id: 'kondagaon', name: 'Kondagaon' },
  { id: 'sukma', name: 'Sukma' },
  { id: 'bijapur', name: 'Bijapur' },
  { id: 'jashpur', name: 'Jashpur' },
  { id: 'korba', name: 'Korba' },
  { id: 'rajnandgaon', name: 'Rajnandgaon' },
];

export function SocialFeedFilters({
  filters,
  onFilterChange,
  className = '',
}: SocialFeedFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeCount = [
    filters.platform,
    filters.contentType,
    filters.district,
  ].filter(Boolean).length;

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {/* Desktop Filter Row */}
      <div className="hidden lg:flex items-center flex-wrap gap-2.5">
        {/* Platform Selector */}
        <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs shadow-2xs">
          <span className="px-2 font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
            Platform
          </span>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, platform: undefined })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              !filters.platform
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, platform: 'INSTAGRAM' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.platform === 'INSTAGRAM'
                ? 'bg-pink-500/15 text-pink-700 dark:text-pink-300 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Instagram
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, platform: 'YOUTUBE' })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.platform === 'YOUTUBE'
                ? 'bg-red-500/15 text-red-700 dark:text-red-300 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            YouTube
          </button>
        </div>

        {/* Content Format Selector */}
        <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs shadow-2xs">
          <span className="px-2 font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
            Format
          </span>
          {['All', 'Reel', 'Video', 'Post', 'Short'].map((fmt) => {
            const isAll = fmt === 'All';
            const value = isAll ? undefined : fmt.toUpperCase();
            const isSelected = isAll ? !filters.contentType : filters.contentType === value;
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => onFilterChange({ ...filters, contentType: value })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {fmt}
              </button>
            );
          })}
        </div>

        {/* District Selector Dropdown */}
        <div className="relative inline-flex items-center">
          <select
            value={filters.district || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                district: e.target.value || undefined,
              })
            }
            aria-label="Filter by district"
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
          >
            <option value="">All 33 Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mobile Filters Trigger */}
      <div className="lg:hidden flex items-center justify-between w-full">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs hover:bg-zinc-50 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-forest-emerald" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-forest-emerald text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Mobile Drawer / Bottom Sheet */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter Social Stories"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-forest-emerald" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Filter Social Stories
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Close filters dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: undefined, label: 'All' },
                  { id: 'INSTAGRAM', label: 'Instagram' },
                  { id: 'YOUTUBE', label: 'YouTube' },
                ].map((opt) => {
                  const isSel = filters.platform === opt.id;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() =>
                        onFilterChange({ ...filters, platform: opt.id })
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-colors ${
                        isSel
                          ? 'bg-forest-emerald text-white border-forest-emerald'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Format Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Content Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: undefined, label: 'All' },
                  { id: 'REEL', label: 'Reel' },
                  { id: 'VIDEO', label: 'Video' },
                  { id: 'POST', label: 'Post' },
                  { id: 'SHORT', label: 'Short' },
                ].map((opt) => {
                  const isSel = filters.contentType === opt.id;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() =>
                        onFilterChange({ ...filters, contentType: opt.id })
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-colors ${
                        isSel
                          ? 'bg-forest-emerald text-white border-forest-emerald'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* District Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                District / Region
              </label>
              <select
                value={filters.district || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    district: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100"
              >
                <option value="">All 33 Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-forest-emerald hover:bg-forest-emerald/90 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
