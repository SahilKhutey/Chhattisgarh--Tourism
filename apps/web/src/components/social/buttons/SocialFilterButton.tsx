'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/Button/Button';
import { cn } from '@/lib/ui/cn';

export interface SocialFilterButtonProps extends ButtonProps {
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

export function SocialFilterButton({
  children,
  active = false,
  count,
  icon,
  className = '',
  ...props
}: SocialFilterButtonProps) {
  return (
    <Button
      variant="ghost"
      aria-pressed={active}
      className={cn(
        'min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium',
        'transition-all duration-160 ease-out select-none gap-2 border',
        active
          ? 'bg-forest-emerald text-white border-forest-emerald shadow-sm font-semibold'
          : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60',
        'active:scale-[0.97]',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
            active
              ? 'bg-white/20 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          )}
        >
          {count}
        </span>
      )}
    </Button>
  );
}
