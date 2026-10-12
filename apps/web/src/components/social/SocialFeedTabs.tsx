'use client';

import React from 'react';
import { Film, Video, Image as ImageIcon, Users, LayoutGrid } from 'lucide-react';

export type SocialFeedTab = 'all' | 'reel' | 'video' | 'post' | 'creators';

interface SocialFeedTabsProps {
  activeTab: SocialFeedTab;
  onTabChange: (tab: SocialFeedTab) => void;
  className?: string;
}

export function SocialFeedTabs({
  activeTab,
  onTabChange,
  className = '',
}: SocialFeedTabsProps) {
  const tabs: Array<{ id: SocialFeedTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'all',
      label: 'All Stories',
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
    },
    {
      id: 'reel',
      label: 'Reels',
      icon: <Film className="w-3.5 h-3.5" />,
    },
    {
      id: 'video',
      label: 'Videos',
      icon: <Video className="w-3.5 h-3.5" />,
    },
    {
      id: 'post',
      label: 'Posts',
      icon: <ImageIcon className="w-3.5 h-3.5" />,
    },
    {
      id: 'creators',
      label: 'Creators',
      icon: <Users className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Social content formats"
      className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isActive
                ? 'bg-forest-emerald text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
