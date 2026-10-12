'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/Button/Button';
import { cn } from '@/lib/ui/cn';

export interface SocialPrimaryButtonProps extends ButtonProps {
  icon?: React.ReactNode;
}

export function SocialPrimaryButton({
  children,
  icon,
  className = '',
  size = 'md',
  ...props
}: SocialPrimaryButtonProps) {
  return (
    <Button
      variant="primary"
      size={size}
      className={cn(
        'min-h-[44px] rounded-xl font-semibold shadow-md',
        'bg-forest-emerald hover:bg-forest-emerald/90 text-white',
        'active:scale-[0.98] transition-transform duration-160 ease-out',
        'gap-2 px-5',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Button>
  );
}
