'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/Button/Button';
import { cn } from '@/lib/ui/cn';

export interface SocialIconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
  badge?: number | string;
}

export function SocialIconButton({
  icon,
  'aria-label': ariaLabel,
  badge,
  className = '',
  size = 'md',
  ...props
}: SocialIconButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={ariaLabel}
      className={cn(
        'relative min-w-[44px] min-h-[44px] p-2.5 rounded-full',
        'flex items-center justify-center',
        'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800/80',
        'active:scale-95 transition-all duration-160 ease-out',
        className
      )}
      {...props}
    >
      <span className="shrink-0">{icon}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none',
            'bg-forest-emerald text-white ring-2 ring-white dark:ring-zinc-900'
          )}
        >
          {badge}
        </span>
      )}
    </Button>
  );
}
