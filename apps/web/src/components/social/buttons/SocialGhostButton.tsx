'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/Button/Button';
import { cn } from '@/lib/ui/cn';

export interface SocialGhostButtonProps extends ButtonProps {
  icon?: React.ReactNode;
}

export function SocialGhostButton({
  children,
  icon,
  className = '',
  size = 'md',
  ...props
}: SocialGhostButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        'min-h-[44px] rounded-xl font-medium',
        'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
        'active:scale-[0.98] transition-all duration-160 ease-out',
        'gap-2 px-3',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Button>
  );
}
