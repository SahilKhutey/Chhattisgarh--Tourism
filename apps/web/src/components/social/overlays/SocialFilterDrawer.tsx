'use client';

import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterState } from '@/components/social/SocialFeedFilters';
import {
  SocialPrimaryButton,
  SocialSecondaryButton,
  SocialIconButton,
} from '@/components/social/buttons';
import { cn } from '@/lib/ui/cn';

export interface SocialFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  districts?: string[];
}

const DEFAULT_DISTRICTS = [
  'bastar',
  'dantewada',
  'surguja',
  'raipur',
  'bilaspur',
  'korba',
  'kanker',
  'jashpur',
  'sukma',
  'narayanpur',
  'bijapur',
];

export function SocialFilterDrawer({
  isOpen,
  onClose,
  currentFilters,
  onApply,
  onReset,
  districts = DEFAULT_DISTRICTS,
}: SocialFilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: FilterState = {
      platform: undefined,
      contentType: undefined,
      district: undefined,
    };
    setLocalFilters(emptyFilters);
    onReset();
    onClose();
  };

  const platforms = [
    { label: 'All Platforms', value: undefined },
    { label: 'YouTube', value: 'YOUTUBE' },
    { label: 'Instagram', value: 'INSTAGRAM' },
  ];

  const types = [
    { label: 'All Types', value: undefined },
    { label: 'Reels', value: 'REEL' },
    { label: 'Shorts', value: 'SHORT' },
    { label: 'Videos', value: 'VIDEO' },
    { label: 'Posts', value: 'POST' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-drawer-title"
      className="fixed inset-0 z-[350] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl',
          'border border-zinc-200 dark:border-zinc-800 max-h-[85vh] flex flex-col',
          'animate-in slide-in-from-bottom duration-250'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-forest-emerald" />
            <h2 id="filter-drawer-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Filter Discoveries
            </h2>
          </div>
          <SocialIconButton
            icon={<X className="w-4 h-4" />}
            aria-label="Close filter drawer"
            onClick={onClose}
          />
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Platform Group */}
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 block">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => {
                const isSelected = localFilters.platform === p.value;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, platform: p.value }))
                    }
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95',
                      isSelected
                        ? 'bg-forest-emerald text-white border-forest-emerald'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Type Group */}
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 block">
              Format
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => {
                const isSelected = localFilters.contentType === t.value;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, contentType: t.value }))
                    }
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95',
                      isSelected
                        ? 'bg-forest-emerald text-white border-forest-emerald'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Group */}
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 block">
              District
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, district: undefined }))
                }
                className={cn(
                  'min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95',
                  !localFilters.district
                    ? 'bg-forest-emerald text-white border-forest-emerald'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                )}
              >
                All Districts
              </button>
              {districts.map((d) => {
                const isSelected = localFilters.district?.toLowerCase() === d.toLowerCase();
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, district: d }))
                    }
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all active:scale-95',
                      isSelected
                        ? 'bg-forest-emerald text-white border-forest-emerald'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <SocialSecondaryButton
            onClick={handleClear}
            className="flex-1 justify-center"
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </SocialSecondaryButton>

          <SocialPrimaryButton
            onClick={handleApply}
            className="flex-1 justify-center"
          >
            Apply Filters
          </SocialPrimaryButton>
        </div>
      </div>
    </div>
  );
}
