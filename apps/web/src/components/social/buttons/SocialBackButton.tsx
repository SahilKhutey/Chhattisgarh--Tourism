'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/Button/Button';
import { cn } from '@/lib/ui/cn';

export interface SocialBackButtonProps extends Omit<ButtonProps, 'children'> {
  fallbackHref?: string;
  label?: string;
}

export function SocialBackButton({
  fallbackHref = '/social/feed',
  label = 'Back',
  className = '',
  ...props
}: SocialBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={cn(
        'min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold',
        'text-zinc-600 dark:text-zinc-400 hover:text-forest-emerald dark:hover:text-emerald-400',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
        'active:scale-95 transition-all duration-160 ease-out gap-2',
        className
      )}
      aria-label={`${label} to previous view`}
      {...props}
    >
      <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
