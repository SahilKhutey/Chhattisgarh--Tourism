'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, Sparkles, MapPin, Grid, Calendar } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { trackSocialEvent } from '@/lib/social/analytics';

export function SocialNavigation() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: '/social',
      label: 'Discover',
      icon: Sparkles,
      exact: true,
    },
    {
      href: '/social/feed',
      label: 'Living Feed',
      icon: Grid,
      exact: false,
    },
    {
      href: '/social/creators',
      label: 'Creators',
      icon: Users,
      exact: false,
    },
    {
      href: '/destinations',
      label: 'Destinations',
      icon: Compass,
      exact: false,
      externalContext: true,
    },
    {
      href: '/itineraries',
      label: 'Plan Trip',
      icon: Calendar,
      exact: false,
      externalContext: true,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-[100] w-full backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Context */}
        <Link
          href="/social"
          className="flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-emerald rounded-lg"
          aria-label="Chhattisgarh Tourism Social Feed Home"
        >
          <div className="w-8 h-8 rounded-lg bg-forest-emerald text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform duration-160">
            CG
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
              Tourism Social
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 leading-tight">
              Living Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Social Navigation"
          className="hidden md:flex items-center gap-1 bg-zinc-100/70 dark:bg-zinc-900/70 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (link.externalContext) {
                    trackSocialEvent('social_destination_click', {
                      placeSlug: link.href,
                      action: 'plan_itinerary',
                    });
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160',
                  active
                    ? 'bg-white dark:bg-zinc-800 text-forest-emerald dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Link into Tourism Itinerary */}
        <div className="flex items-center gap-2">
          <Link
            href="/destinations"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-forest-emerald dark:text-emerald-400 hover:underline px-2 py-1"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>33 Districts</span>
          </Link>

          <Link
            href="/social/feed"
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest-emerald text-white shadow-xs"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Feed</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
