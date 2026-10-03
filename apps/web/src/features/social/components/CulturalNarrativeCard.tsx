"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Compass,
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  BookOpen,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { SocialContentItem } from "../types";
import { interactWithContent } from "../api/social-api";
import { useAuthStore } from "../../../store/auth-store";

interface CulturalNarrativeCardProps {
  item: SocialContentItem;
  onTripAddSuccess?: (item: SocialContentItem) => void;
}

export const CulturalNarrativeCard: React.FC<CulturalNarrativeCardProps> = ({
  item,
  onTripAddSuccess,
}) => {
  const { token } = useAuthStore();
  const [isLiked, setIsLiked] = useState<boolean>(item.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState<number>(item.likes_count || 0);
  const [isSaved, setIsSaved] = useState<boolean>(item.is_saved_by_user || false);
  const [isAddedToTrip, setIsAddedToTrip] = useState<boolean>(false);
  const [tripAddsCount, setTripAddsCount] = useState<number>(item.trip_adds_count || 0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const media = item.media_items[0];

  const handleLike = async () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    await interactWithContent(item.id, "like", token);
  };

  const handleSave = async () => {
    const next = !isSaved;
    setIsSaved(next);
    toast.success(next ? "Saved to cultural archives!" : "Removed from saved");
    await interactWithContent(item.id, "save", token);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/feed#${item.slug}` : "";
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Cultural story link copied!");
      await interactWithContent(item.id, "share", token);
    }
  };

  const handleAddToTrip = async () => {
    if (isAddedToTrip) {
      toast("Already part of your trip plan!", { icon: "ℹ️" });
      return;
    }
    setIsAddedToTrip(true);
    setTripAddsCount((prev) => prev + 1);
    toast.success(`Added "${item.place_name || item.title}" to Trip Planner!`, { icon: "🧭" });
    await interactWithContent(item.id, "trip_add", token);
    onTripAddSuccess?.(item);
  };

  return (
    <article
      data-testid="cultural-narrative-card"
      className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Cultural Sensitivity & Community Banner */}
      {item.cultural_sensitivity_level === "SACRED_TRIBAL_RITUAL" || item.community_attribution ? (
        <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-amber-950 text-white px-5 py-2.5 flex items-center justify-between text-xs border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-semibold text-purple-200">
              {item.cultural_sensitivity_level === "SACRED_TRIBAL_RITUAL"
                ? "Sacred Tribal Ceremony Archive"
                : "Indigenous Cultural Heritage"}
            </span>
          </div>
          {item.community_attribution && (
            <span className="text-[11px] text-zinc-300 truncate max-w-[200px]">
              Attribution: {item.community_attribution}
            </span>
          )}
        </div>
      ) : null}

      {/* Author & Context Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500 bg-emerald-100 dark:bg-emerald-950 shrink-0">
            {item.creator?.avatar_url ? (
              <Image
                src={item.creator.avatar_url}
                alt={item.creator.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300">
                {item.creator?.display_name.slice(0, 2).toUpperCase() || "CG"}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                {item.creator?.display_name || "Tribal Historian"}
              </span>
              {item.creator?.verification_badge && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              {item.district_name && (
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <MapPin className="w-3 h-3" />
                  {item.district_name}
                </span>
              )}
              <span>•</span>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {item.place_slug && (
          <Link
            href={`/destinations/${item.place_slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
          >
            <span>{item.place_name || item.place_slug}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Featured Media (if available) */}
      {media && (
        <div className="relative w-full aspect-[16/9] bg-zinc-950 overflow-hidden">
          <Image
            src={media.media_url}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          {item.festival_name && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {item.festival_name}
            </div>
          )}
        </div>
      )}

      {/* Narrative Body */}
      <div className="p-5 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {item.title}
        </h2>

        {item.caption && (
          <div className="relative">
            <p
              className={`text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif ${
                !isExpanded ? "line-clamp-3" : ""
              }`}
            >
              {item.caption}
            </p>
            {item.caption.length > 180 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" />
                {isExpanded ? "Show Less" : "Read Full Oral Narrative"}
              </button>
            )}
          </div>
        )}

        {/* Cultural Tags */}
        {item.cultural_tags && item.cultural_tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {item.cultural_tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Controls & Add to Trip */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isLiked ? "text-rose-600 dark:text-rose-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isSaved ? "text-amber-600 dark:text-amber-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              <span>Save</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Add to Trip Planner Button */}
          <button
            onClick={handleAddToTrip}
            data-testid="cultural-add-to-trip-btn"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isAddedToTrip
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isAddedToTrip ? "Added to Trip ✓" : "Add to Trip"}</span>
            <span className="text-[10px] opacity-70">({tripAddsCount})</span>
          </button>
        </div>
      </div>
    </article>
  );
};
