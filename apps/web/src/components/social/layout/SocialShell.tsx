'use client';

import React from 'react';
import { cn } from '@/lib/ui/cn';

export interface SocialShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
  withGutter?: boolean;
}

export function SocialShell({
  children,
  className = '',
  maxWidth = '7xl',
  withGutter = true,
}: SocialShellProps) {
  const maxWidthClass = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClass,
        withGutter && 'px-4 sm:px-6 lg:px-8',
        'animate-in fade-in duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}
