import React from 'react';
import { SocialNavigation } from '@/components/social/layout/SocialNavigation';

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand-beige/40 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
      <SocialNavigation />
      <div className="flex-1 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
