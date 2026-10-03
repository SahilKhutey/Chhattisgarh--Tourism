"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Sparkles } from "lucide-react";
import { StoryItem } from "../types";
import { StoryViewerModal } from "./StoryViewerModal";

interface StoryBarProps {
  stories: StoryItem[];
  onOpenCreateModal?: () => void;
}

export const StoryBar: React.FC<StoryBarProps> = ({
  stories,
  onOpenCreateModal,
}) => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const handleOpenStory = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
  };

  return (
    <>
      <div
        data-testid="story-bar"
        className="w-full flex items-center gap-4 overflow-x-auto py-3 px-1 no-scrollbar select-none"
      >
        {/* Create Story Button */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-emerald-500/50 p-0.5 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 group-hover:border-emerald-500 transition-colors">
              <div className="w-full h-full rounded-full bg-emerald-600/10 dark:bg-emerald-600/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Share Story
            </span>
          </button>
        )}

        {/* Stories List */}
        {stories.map((story, idx) => (
          <button
            key={story.id}
            onClick={() => handleOpenStory(idx)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            {/* Story Ring (Emerald/Amber gradient) */}
            <div className="relative w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 group-hover:scale-105 transition-transform shadow-sm">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-900 border-2 border-white dark:border-zinc-950">
                <Image
                  src={story.media_url}
                  alt={story.title}
                  fill
                  className="object-cover"
                />
              </div>

              {story.festival_name && (
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-white shadow-md">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              )}
            </div>

            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 max-w-[68px] truncate">
              {story.creator.display_name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={selectedStoryIndex}
          isOpen={selectedStoryIndex !== null}
          onClose={handleCloseStory}
        />
      )}
    </>
  );
};
