"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Sparkles,
  MapPin,
  Film,
  BookOpen,
  Filter,
  Search,
  Scale,
  RefreshCw,
} from "lucide-react";
import { SocialContentItem, FeedType } from "../types";
import { ReelPlayer } from "./ReelPlayer";
import { CulturalNarrativeCard } from "./CulturalNarrativeCard";
import { fetchFeed } from "../api/social-api";

interface SocialFeedStreamProps {
  initialItems?: SocialContentItem[];
  onOpenCreateModal?: () => void;
}

type TabFilter = "ALL" | "REELS" | "CULTURE" | "BASTAR" | "SURGUJA";

export const SocialFeedStream: React.FC<SocialFeedStreamProps> = ({
  initialItems,
  onOpenCreateModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [items, setItems] = useState<SocialContentItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialItems);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let feedType: FeedType = "HOME";
    let districtId: string | undefined = undefined;

    if (activeTab === "CULTURE") {
      feedType = "CULTURE";
    } else if (activeTab === "BASTAR") {
      feedType = "REGIONAL";
      districtId = "bastar";
    } else if (activeTab === "SURGUJA") {
      feedType = "REGIONAL";
      districtId = "surguja";
    }

    setIsLoading(true);
    fetchFeed(feedType, districtId)
      .then((res) => {
        let fetched = res.items || [];
        if (activeTab === "REELS") {
          fetched = fetched.filter((it) => it.content_type === "REEL" || it.content_type === "VIDEO");
        }
        setItems(fetched);
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.caption?.toLowerCase().includes(q) ||
      item.district_name?.toLowerCase().includes(q) ||
      item.place_name?.toLowerCase().includes(q) ||
      item.festival_name?.toLowerCase().includes(q) ||
      item.creator?.display_name.toLowerCase().includes(q)
    );
  });

  return (
    <div data-testid="social-feed-stream" className="w-full flex flex-col gap-6">
      {/* Feed Filter & Diversity Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {[
            { id: "ALL", label: "✨ Living Feed", icon: Sparkles },
            { id: "REELS", label: "🎥 Reels", icon: Film },
            { id: "CULTURE", label: "📜 Lore & Heritage", icon: BookOpen },
            { id: "BASTAR", label: "🌿 Bastar", icon: MapPin },
            { id: "SURGUJA", label: "⛰️ Surguja", icon: MapPin },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabFilter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search places, festivals, lore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Anti-Monopoly Diversity Guarantee Banner */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            <strong>Equitable Regional Discovery</strong>: Content is distributed across 33 districts to prevent viral monopolies and celebrate authentic local voices.
          </span>
        </div>
        <span className="text-[11px] opacity-75 hidden sm:inline">Verified OS Algorithm</span>
      </div>

      {/* Feed Items Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <p className="text-xs">Loading regional discovery stream...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <Compass className="w-10 h-10 text-zinc-400 mb-2" />
          <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
            No stories match your criteria
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            Be the first local guide or traveler to document this destination.
          </p>
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors"
            >
              Share Your Story
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {filteredItems.map((item, index) => {
            if (item.content_type === "REEL" || item.content_type === "VIDEO") {
              return (
                <div key={item.id} className="w-full flex justify-center">
                  <ReelPlayer item={item} isActive={index === 0} />
                </div>
              );
            }
            return (
              <div key={item.id} className="w-full flex justify-center">
                <CulturalNarrativeCard item={item} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
