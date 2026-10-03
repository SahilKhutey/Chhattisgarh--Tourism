"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  Share2,
  Compass,
  MapPin,
  ShieldCheck,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { SocialContentItem } from "../types";
import { interactWithContent } from "../api/social-api";
import { useAuthStore } from "../../../store/auth-store";

interface ReelPlayerProps {
  item: SocialContentItem;
  isActive?: boolean;
  onTripAddSuccess?: (item: SocialContentItem) => void;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  item,
  isActive = false,
  onTripAddSuccess,
}) => {
  const { token } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(item.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState<number>(item.likes_count || 0);
  const [isSaved, setIsSaved] = useState<boolean>(item.is_saved_by_user || false);
  const [tripAddsCount, setTripAddsCount] = useState<number>(item.trip_adds_count || 0);
  const [isAddedToTrip, setIsAddedToTrip] = useState<boolean>(false);
  const [showCulturalInfo, setShowCulturalInfo] = useState<boolean>(false);

  const media = item.media_items[0];
  const isVideo = media?.media_type === "VIDEO";

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isActive) {
        try {
          const res = videoRef.current.play();
          if (res && typeof res.then === "function") {
            res.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            setIsPlaying(true);
          }
        } catch {
          setIsPlaying(false);
        }
      } else {
        try {
          videoRef.current.pause();
        } catch {
          // ignore
        }
        setIsPlaying(false);
      }
    }
  }, [isActive, isVideo]);

  const togglePlay = () => {
    if (!videoRef.current || !isVideo) return;
    if (isPlaying) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore
      }
      setIsPlaying(false);
    } else {
      try {
        const res = videoRef.current.play();
        if (res && typeof res.then === "function") {
          res.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(true);
        }
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    await interactWithContent(item.id, "like", token);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    toast.success(nextState ? "Saved to your bookmarks!" : "Removed from bookmarks");
    await interactWithContent(item.id, "save", token);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/feed#${item.slug}` : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out "${item.title}" on Unseen36Garh Tourism OS!`,
          url: shareUrl,
        });
        await interactWithContent(item.id, "share", token);
      } catch {
        // user dismissed share sheet
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      await interactWithContent(item.id, "share", token);
    }
  };

  const handleAddToTrip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAddedToTrip) {
      toast("Already added to your active itinerary!", { icon: "ℹ️" });
      return;
    }

    setIsAddedToTrip(true);
    setTripAddsCount((prev) => prev + 1);
    toast.success(
      `Added "${item.place_name || item.title}" to your Trip Planner!`,
      {
        icon: "🧭",
        duration: 4000,
      }
    );
    onTripAddSuccess?.(item);

    await interactWithContent(item.id, "trip_add", token);
  };

  return (
    <div
      data-testid="reel-player"
      className="relative mx-auto w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl border border-zinc-800 select-none group"
      onClick={togglePlay}
    >
      {/* Background Media */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={media.media_url}
          poster={media.thumbnail_url || undefined}
          loop
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="relative w-full h-full">
          <Image
            src={media?.media_url || "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80"}
            alt={item.title}
            fill
            className="object-cover"
            priority={isActive}
          />
        </div>
      )}

      {/* Dim overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

      {/* Top Header Controls: Sound & Sensitivity */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 flex-wrap">
          {item.district_name && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {item.district_name}
            </span>
          )}

          {item.festival_name && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {item.festival_name}
            </span>
          )}

          {item.cultural_sensitivity_level === "SACRED_TRIBAL_RITUAL" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCulturalInfo(!showCulturalInfo);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/30 backdrop-blur-md hover:bg-purple-900/80 transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              Sacred Ritual
              <Info className="w-3 h-3 ml-0.5 opacity-70" />
            </button>
          )}
        </div>

        {isVideo && (
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/10 backdrop-blur-md transition-transform active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Cultural Info Drawer Overlay */}
      {showCulturalInfo && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-4 top-16 z-30 p-4 rounded-2xl bg-zinc-900/95 border border-purple-500/30 text-white backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Cultural Heritage Protection Gate
            </span>
            <button
              onClick={() => setShowCulturalInfo(false)}
              className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed mb-2">
            This narrative documents a sacred tribal ceremony verified under Chhattisgarh Tourism OS guidelines.
          </p>
          {item.community_attribution && (
            <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-zinc-300">
              <span className="text-purple-300 font-semibold">Community Attribution: </span>
              {item.community_attribution}
            </div>
          )}
        </div>
      )}

      {/* Play/Pause Center Indicator */}
      {isVideo && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="p-4 rounded-full bg-black/40 text-white/90 border border-white/20 backdrop-blur-md">
            <Play className="w-10 h-10 fill-white" />
          </div>
        </div>
      )}

      {/* Right Side Vertical Action Rail */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-20">
        {/* Like */}
        <button
          onClick={handleLike}
          data-testid="like-btn"
          aria-label="Like"
          className="flex flex-col items-center gap-1 text-white group/btn"
        >
          <div
            className={`p-3 rounded-full backdrop-blur-md border transition-transform active:scale-125 ${
              isLiked
                ? "bg-rose-600/80 text-white border-rose-500"
                : "bg-black/40 text-white border-white/10 hover:bg-black/60"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-white" : ""}`} />
          </div>
          <span className="text-[11px] font-medium text-white/90">{likesCount}</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          data-testid="save-btn"
          aria-label="Save"
          className="flex flex-col items-center gap-1 text-white group/btn"
        >
          <div
            className={`p-3 rounded-full backdrop-blur-md border transition-transform active:scale-125 ${
              isSaved
                ? "bg-amber-600/80 text-white border-amber-500"
                : "bg-black/40 text-white border-white/10 hover:bg-black/60"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
          </div>
          <span className="text-[11px] font-medium text-white/90">Save</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          data-testid="share-btn"
          aria-label="Share"
          className="flex flex-col items-center gap-1 text-white group/btn"
        >
          <div className="p-3 rounded-full bg-black/40 text-white border border-white/10 hover:bg-black/60 backdrop-blur-md transition-transform active:scale-125">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-white/90">Share</span>
        </button>
      </div>

      {/* Bottom Content & Primary "Add to Trip" CTA */}
      <div className="absolute inset-x-0 bottom-0 p-5 pt-12 z-20 flex flex-col gap-3">
        {/* Creator Info Header */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0 bg-emerald-950">
            {item.creator?.avatar_url ? (
              <Image
                src={item.creator.avatar_url}
                alt={item.creator.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-emerald-300">
                {item.creator?.display_name?.slice(0, 2).toUpperCase() || "CG"}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-white truncate drop-shadow-md">
                {item.creator?.display_name || "Chhattisgarh Guide"}
              </span>
              {item.creator?.verification_badge && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-zinc-300 truncate">@{item.creator?.handle}</p>
          </div>
        </div>

        {/* Destination Entity Tag (Clickable directly to Destination Page) */}
        {item.place_slug && (
          <div className="flex items-center gap-2">
            <Link
              href={`/destinations/${item.place_slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02]"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>{item.place_name || item.place_slug}</span>
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            </Link>
          </div>
        )}

        {/* Title & Caption */}
        <div>
          <h3 className="text-sm font-bold text-white line-clamp-2 drop-shadow-sm mb-1">
            {item.title}
          </h3>
          {item.caption && (
            <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed drop-shadow-sm">
              {item.caption}
            </p>
          )}
        </div>

        {/* First-Class "Add to Trip" Action Button */}
        <button
          onClick={handleAddToTrip}
          data-testid="add-to-trip-btn"
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
            isAddedToTrip
              ? "bg-emerald-600 text-white border border-emerald-400"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-400/50 hover:shadow-emerald-500/25"
          }`}
        >
          <Compass className={`w-4 h-4 ${isAddedToTrip ? "text-white" : "text-emerald-100"}`} />
          <span>{isAddedToTrip ? "✓ Added to Itinerary" : "Add to Trip Planner"}</span>
          <span className="text-[10px] opacity-75 font-normal ml-1">
            ({tripAddsCount} travelers)
          </span>
        </button>
      </div>
    </div>
  );
};
