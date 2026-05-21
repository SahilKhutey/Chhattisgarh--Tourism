"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, CheckCircle, Leaf, Sparkles, Globe, Video, MessageCircle, BarChart2, Compass } from "lucide-react";
import { CREATORS, CREATOR_VIDEOS, VerificationBadge } from "../../data/creators";
import TourismReelCard from "../../../components/creators/TourismReelCard";

export default function CreatorProfile({ params }: { params: Promise<{ creator_id: string }> }) {
  const resolvedParams = use(params);
  const creator = CREATORS.find(c => c.id === resolvedParams.creator_id);
  const creatorVideos = CREATOR_VIDEOS.filter(v => v.creatorId === resolvedParams.creator_id);

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Creator Not Found</h1>
          <Link href="/creators" className="text-emerald-600 hover:underline">
            ← Back to Creators Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-x-hidden pt-16">
      {/* 1. Header & Banner */}
      <div className="relative w-full h-64 md:h-80">
        <Image src={creator.bannerUrl} alt={creator.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Back Button */}
        <Link href="/creators" className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-20 -mt-20 md:-mt-24 mb-16">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden shadow-xl relative shrink-0">
              <Image src={creator.avatarUrl} alt={creator.name} fill className="object-cover" />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black flex items-center flex-wrap gap-2">
                    {creator.name}
                    {creator.verificationBadges.includes("BLUE") && <CheckCircle className="w-6 h-6 text-blue-500 fill-white" />}
                    {creator.verificationBadges.includes("GREEN") && <Leaf className="w-6 h-6 text-green-500 fill-green-50" />}
                    {creator.verificationBadges.includes("CULTURAL") && <Sparkles className="w-6 h-6 text-orange-500 fill-orange-50" />}
                  </h1>
                  <p className="text-zinc-500 text-lg font-medium">{creator.handle}</p>
                </div>
                
                <div className="flex gap-3">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-8 rounded-full transition-colors shadow-lg">
                    Follow
                  </button>
                  <button className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white p-2.5 rounded-full transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="col-span-2">
              <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed mb-6">
                {creator.bio}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm font-medium bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                  {creator.district}
                </div>
                <div className="flex gap-2">
                  {creator.socialLinks.instagram && (
                    <a href={creator.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {creator.socialLinks.youtube && (
                    <a href={creator.socialLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition">
                      <Video className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {creator.categories.map((cat) => (
                  <span key={cat} className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Block */}
            <div className="bg-zinc-50 dark:bg-black/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center">
                <BarChart2 className="w-4 h-4 mr-2" /> Creator Impact Score
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Tourism Value</span>
                    <span className="font-bold">{creator.tourismScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${creator.tourismScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Eco-Safe Practices</span>
                    <span className="font-bold">{creator.ecoSafeScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${creator.ecoSafeScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Engagement</span>
                    <span className="font-bold">{creator.engagementScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${creator.engagementScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center text-sm pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-center">
                  <div className="font-black text-xl">{creator.followers}</div>
                  <div className="text-zinc-500 text-xs">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-xl">{creator.contentCount}</div>
                  <div className="text-zinc-500 text-xs">Stories</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-xl">{creator.languages.join(", ")}</div>
                  <div className="text-zinc-500 text-xs">Languages</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Feed */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-bold flex items-center">
             <Compass className="w-6 h-6 mr-2 text-emerald-500" />
             Discover {creator.name}&apos;s Trails
           </h2>
        </div>
        
        {creatorVideos.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
             <p className="text-zinc-500">No stories uploaded yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creatorVideos.map((video, idx) => (
               <TourismReelCard key={video.id} video={video} creator={creator} isLarge={idx % 3 === 0} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
