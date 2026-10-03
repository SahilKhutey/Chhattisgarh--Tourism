"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, Compass, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { StoryItem } from "../types";
import { interactWithContent } from "../api/social-api";
import { useAuthStore } from "../../../store/auth-store";

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const { token } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isAddedToTrip, setIsAddedToTrip] = useState<boolean>(false);

  const durationMs = 5000;
  const intervalMs = 50;

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsAddedToTrip(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || stories.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (intervalMs / durationMs) * 100;
        if (next >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            setIsAddedToTrip(false);
            return 0;
          } else {
            clearInterval(timer);
            onClose();
            return 100;
          }
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, stories.length, isPaused, onClose]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setIsAddedToTrip(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setIsAddedToTrip(false);
    } else {
      onClose();
    }
  };

  const handleAddToTrip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddedToTrip(true);
    toast.success(`Added story place to your Trip Planner!`, { icon: "🧭" });
    await interactWithContent(currentStory.id, "trip_add", token);
  };

  return (
    <div
      data-testid="story-viewer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 sm:p-4 select-none animate-in fade-in"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-950 shadow-2xl border border-zinc-800">
        {/* Progress Bars (one for each story) */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {stories.map((story, idx) => (
            <div
              key={story.id}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{
                  width:
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400 bg-emerald-950 shrink-0">
              {currentStory.creator.avatar_url ? (
                <Image
                  src={currentStory.creator.avatar_url}
                  alt={currentStory.creator.display_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-emerald-300">
                  {currentStory.creator.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-white truncate">
                  {currentStory.creator.display_name}
                </span>
                {currentStory.creator.verification_badge && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
              {currentStory.district_id && (
                <span className="text-[10px] text-emerald-300 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {currentStory.district_id.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close story"
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/10 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Media */}
        <div className="relative w-full h-full">
          <Image
            src={currentStory.media_url}
            alt={currentStory.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Navigation Touch zones */}
        <button
          onClick={handlePrev}
          aria-label="Previous story"
          className="absolute left-0 inset-y-16 w-1/3 z-20 opacity-0 hover:opacity-100 flex items-center justify-start pl-2 text-white/50 hover:text-white transition-opacity"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next story"
          className="absolute right-0 inset-y-16 w-1/3 z-20 opacity-0 hover:opacity-100 flex items-center justify-end pr-2 text-white/50 hover:text-white transition-opacity"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Bottom Story Footer */}
        <div className="absolute inset-x-0 bottom-0 p-5 z-30 flex flex-col gap-3">
          {currentStory.festival_name && (
            <span className="inline-flex items-center gap-1 self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {currentStory.festival_name}
            </span>
          )}

          <h3 className="text-sm font-bold text-white drop-shadow-md">
            {currentStory.title}
          </h3>

          <div className="flex items-center gap-2">
            {currentStory.place_slug && (
              <Link
                href={`/destinations/${currentStory.place_slug}`}
                onClick={onClose}
                className="flex-1 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md border border-white/20 transition-colors"
              >
                <span>Explore Place</span>
              </Link>
            )}

            <button
              onClick={handleAddToTrip}
              data-testid="story-add-to-trip-btn"
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                isAddedToTrip
                  ? "bg-emerald-600 text-white border border-emerald-400"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isAddedToTrip ? "Added ✓" : "Add to Trip"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
