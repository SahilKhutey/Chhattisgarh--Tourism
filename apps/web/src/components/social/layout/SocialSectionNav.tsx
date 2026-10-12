'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Film, Clapperboard, Video, Image, Users } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

export interface SectionNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  count?: number;
}

export const SOCIAL_SECTION_ITEMS: SectionNavItem[] = [
  { id: 'all', label: 'All Stories', icon: Layers, href: '/social/feed' },
  { id: 'reels', label: 'Reels', icon: Film, href: '/social/feed?tab=reel' },
  { id: 'shorts', label: 'Shorts', icon: Clapperboard, href: '/social/feed?tab=short' },
  { id: 'videos', label: 'Videos', icon: Video, href: '/social/feed?tab=video' },
  { id: 'posts', label: 'Posts', icon: Image, href: '/social/feed?tab=post' },
  { id: 'creators', label: 'Creators', icon: Users, href: '/social/creators' },
];

export interface SocialSectionNavProps {
  activeId?: string;
  onSelect?: (id: string) => void;
  items?: SectionNavItem[];
  className?: string;
}

export function SocialSectionNav({
  activeId = 'all',
  onSelect,
  items = SOCIAL_SECTION_ITEMS,
  className = '',
}: SocialSectionNavProps) {
  return (
    <div
      className={cn(
        'w-full sticky top-16 z-[90] backdrop-blur-md bg-white/90 dark:bg-zinc-950/90',
        'border-b border-zinc-200/60 dark:border-zinc-800/60 py-2.5',
        'transition-colors',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Feed Content Categories"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {items.map((item) => {
            const isActive = activeId.toLowerCase() === item.id.toLowerCase();
            const Icon = item.icon;

            if (onSelect) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0',
                    'inline-flex items-center gap-2 transition-all duration-160 ease-out select-none cursor-pointer',
                    isActive
                      ? 'bg-forest-emerald text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80',
                    'active:scale-95'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                  {typeof item.count === 'number' && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href || '#'}
                className={cn(
                  'min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0',
                  'inline-flex items-center gap-2 transition-all duration-160 ease-out select-none',
                  isActive
                    ? 'bg-forest-emerald text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80',
                  'active:scale-95'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
