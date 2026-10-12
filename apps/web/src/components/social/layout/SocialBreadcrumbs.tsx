'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SocialBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function SocialBreadcrumbs({
  items,
  className = '',
  showHome = true,
}: SocialBreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Social', href: '/social' }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-xs text-zinc-500 dark:text-zinc-400', className)}
    >
      <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0"
                  aria-hidden="true"
                />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 hover:text-forest-emerald dark:hover:text-emerald-400 transition-colors font-medium py-1"
                >
                  {isFirst && showHome && <Home className="w-3.5 h-3.5 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-semibold truncate max-w-[200px] sm:max-w-[320px]',
                    isLast ? 'text-zinc-900 dark:text-zinc-100' : ''
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
