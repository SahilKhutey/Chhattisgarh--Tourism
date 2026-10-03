"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Compass,
  Film,
  Users,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  StoryBar,
  SocialFeedStream,
  CreateContentModal,
  fetchStories,
  StoryItem,
} from "../../features/social";
import { useAuthStore } from "../../store/auth-store";

export default function FeedPage() {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchStories().then(setStories);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Living Feed Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-teal-950 text-white p-6 sm:p-8 border border-emerald-500/20 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Living Tourism Discovery</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chhattisgarh in Motion
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                Experience real-time stories, 9:16 vertical reels, and verified oral folklore shared by local guides across all 33 districts. Connect every story directly to your next itinerary.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Share Story or Reel</span>
            </button>
          </div>
        </section>

        {/* Ephemeral 24h Stories Bar */}
        <section className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                24h Ephemeral Stories
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-zinc-400">Live from districts</span>
          </div>

          <StoryBar
            stories={stories}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        </section>

        {/* Master Living Feed Stream */}
        <SocialFeedStream
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* Creation Modal */}
      <CreateContentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchStories().then(setStories);
        }}
      />
    </main>
  );
}
