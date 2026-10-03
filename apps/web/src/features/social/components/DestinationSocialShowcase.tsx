"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Compass,
  Sparkles,
  Play,
  Heart,
  ShieldCheck,
  Plus,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { SocialContentItem } from "../types";
import { fetchDestinationContent, interactWithContent } from "../api/social-api";
import { CreateContentModal } from "./CreateContentModal";
import { ReelPlayer } from "./ReelPlayer";
import { useAuthStore } from "../../../store/auth-store";

interface DestinationSocialShowcaseProps {
  placeSlug: string;
  placeName: string;
}

export const DestinationSocialShowcase: React.FC<
  DestinationSocialShowcaseProps
> = ({ placeSlug, placeName }) => {
  const { token } = useAuthStore();
  const [items, setItems] = useState<SocialContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeReel, setActiveReel] = useState<SocialContentItem | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchDestinationContent(placeSlug)
      .then((data) => setItems(data))
      .finally(() => setIsLoading(false));
  }, [placeSlug]);

  const handleQuickAddToTrip = async (
    e: React.MouseEvent,
    item: SocialContentItem
  ) => {
    e.stopPropagation();
    toast.success(`Added "${placeName}" to your Trip Planner!`, { icon: "🧭" });
    await interactWithContent(item.id, "trip_add", token);
  };

  return (
    <section
      data-testid="destination-social-showcase"
      className="w-full my-8 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Living Discovery
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Stories & Reels from {placeName}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real experiences, indigenous folklore, and guides shared by verified creators
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Story</span>
        </button>
      </div>

      {/* Grid of Reels & Stories */}
      {isLoading ? (
        <div className="py-12 flex justify-center text-xs text-zinc-400">
          Loading creator stories for {placeName}...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">
            No community reels posted for {placeName} yet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Be the first creator to share a reel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const media = item.media_items[0];
            const isVideo = media?.media_type === "VIDEO";

            return (
              <div
                key={item.id}
                onClick={() => setActiveReel(item)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                {/* Media Thumbnail */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={
                      media?.thumbnail_url ||
                      media?.media_url ||
                      "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {isVideo && (
                    <div className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </div>
                  )}

                  {item.cultural_sensitivity_level === "SACRED_TRIBAL_RITUAL" && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-500/30 backdrop-blur-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-400" />
                      Sacred Lore
                    </div>
                  )}

                  {/* Creator Pill Overlay */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold truncate drop-shadow-sm">
                      @{item.creator?.handle}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] drop-shadow-sm">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      {item.likes_count}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>

                  {item.caption && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {item.caption}
                    </p>
                  )}

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={(e) => handleQuickAddToTrip(e, item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Add to Trip</span>
                    </button>

                    <span className="text-[11px] text-zinc-400 flex items-center gap-0.5">
                      Watch Reel
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Reel Viewer Modal */}
      {activeReel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveReel(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <ReelPlayer item={activeReel} isActive={true} />
            <button
              onClick={() => setActiveReel(null)}
              className="absolute -top-10 right-0 text-white font-bold text-xs p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      <CreateContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchDestinationContent(placeSlug).then(setItems);
        }}
      />
    </section>
  );
};
