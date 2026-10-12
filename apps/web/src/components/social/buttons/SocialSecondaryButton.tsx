'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/Button/Button';
import { cn } from '@/lib/ui/cn';

export interface SocialSecondaryButtonProps extends ButtonProps {
  icon?: React.ReactNode;
}

export function SocialSecondaryButton({
  children,
  icon,
  className = '',
  size = 'md',
  ...props
}: SocialSecondaryButtonProps) {
  return (
    <Button
      variant="secondary"
      size={size}
      className={cn(
        'min-h-[44px] rounded-xl font-medium shadow-2xs',
        'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
        'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80',
        'active:scale-[0.98] transition-transform duration-160 ease-out',
        'gap-2 px-4',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Button>
  );
}
