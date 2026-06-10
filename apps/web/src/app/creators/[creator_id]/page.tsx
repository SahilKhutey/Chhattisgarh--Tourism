"use client";

import React, { use } from "react";
import Image from "@/components/ui/NativeImage";
import Link from "next/link";
import { ArrowLeft, MapPin, CheckCircle, Leaf, Sparkles, Globe, Video, MessageCircle, BarChart2, Compass, Map, FileText, Heart } from "lucide-react";
import { fetchCreatorById, type Creator, type CreatorVideo } from "../../data/api";
import TourismReelCard from "../../../components/creators/TourismReelCard";
import StoryTimeline from "../../../components/creators/StoryTimeline";

export default function CreatorProfile({ params }: { params: Promise<{ creator_id: string }> }) {
  const resolvedParams = use(params);
  const [creator, setCreator] = React.useState<Creator | null>(null);
  const [creatorVideos, setCreatorVideos] = React.useState<CreatorVideo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"stories" | "guides" | "routes" | "community">("stories");

  React.useEffect(() => {
    fetchCreatorById(resolvedParams.creator_id).then(res => {
      setCreator(res.creator);
      setCreatorVideos(res.videos);
      setIsLoading(false);
    });
  }, [resolvedParams.creator_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-beige text-[#0A2A3B] pt-20">
        <div className="text-center animate-pulse">
          <Sparkles className="w-8 h-8 text-forest-emerald mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold">Loading Portfolio...</h1>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-beige text-[#0A2A3B] pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Creator Not Found</h1>
          <Link href="/creators" className="text-forest-emerald font-bold hover:underline">
            ← Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  // Mock Timeline Data
  const mockTimeline = [
    { time: "06:00 AM", title: "Sunrise at Tirathgarh", description: "Start the day early to catch the misty waterfall glowing in gold.", type: "morning" as const },
    { time: "12:00 PM", title: "Tribal Lunch in Bastar", description: "Authentic Chapda Chutney and red ant delicacies.", type: "afternoon" as const },
    { time: "05:30 PM", title: "Sunset over Indravati River", description: "A peaceful boat ride as the sky turns orange.", type: "sunset" as const },
  ];

  return (
    <main className="min-h-screen bg-sand-beige text-[#0A2A3B] overflow-x-hidden pt-16 md:pt-20 font-sans pb-24 md:pb-0">
      {/* 1. Header & Banner Cinematic */}
      <div className="relative w-full h-[40vh] md:h-[50vh]">
        <Image src={creator.bannerUrl} alt={creator.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-emerald/20 to-transparent" />
        
        {/* Back Button */}
        <Link href="/creators" className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition shadow-lg border border-white/20">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20 -mt-32 mb-16">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-charcoal-stone/10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-20 md:-mt-24 mb-8">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-white overflow-hidden shadow-2xl relative shrink-0">
              <Image src={creator.avatarUrl} alt={creator.name} fill className="object-cover" />
            </div>
            
            <div className="flex-1 w-full mb-4 md:mb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0A2A3B] flex items-center flex-wrap gap-2">
                    {creator.name}
                    {creator.verificationBadges.includes("BLUE") && <CheckCircle className="w-8 h-8 text-blue-500 fill-white" />}
                  </h1>
                  <p className="text-charcoal-stone/60 text-lg font-bold tracking-wide">@{creator.handle}</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none bg-forest-emerald hover:bg-forest-emerald/90 text-white font-bold py-3.5 px-10 rounded-full transition-colors shadow-xl shadow-forest-emerald/20 text-lg">
                    Follow
                  </button>
                  <button className="bg-sand-beige hover:bg-[#e3d7c5] text-charcoal-stone p-3.5 rounded-full transition-colors border border-charcoal-stone/10 shadow-sm">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <p className="text-charcoal-stone text-lg md:text-xl leading-relaxed mb-8 font-medium">
                {creator.bio}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center text-sm font-bold bg-forest-emerald/10 px-4 py-2 rounded-xl text-forest-emerald border border-forest-emerald/20">
                  <MapPin className="w-5 h-5 mr-2" />
                  {creator.district}
                </div>
                <div className="flex gap-2">
                  {creator.socialLinks.instagram && (
                    <a href={creator.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center px-4 py-2 rounded-xl bg-sand-beige text-charcoal-stone hover:text-pink-600 transition border border-charcoal-stone/10 font-bold text-sm gap-2">
                      <Globe className="w-4 h-4" /> Instagram
                    </a>
                  )}
                  {creator.socialLinks.youtube && (
                    <a href={creator.socialLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center justify-center px-4 py-2 rounded-xl bg-sand-beige text-charcoal-stone hover:text-red-600 transition border border-charcoal-stone/10 font-bold text-sm gap-2">
                      <Video className="w-4 h-4" /> YouTube
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {creator.categories.map((cat) => (
                  <span key={cat} className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md bg-tribal-terracotta/10 text-tribal-terracotta border border-tribal-terracotta/20">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Block */}
            <div className="bg-sand-beige rounded-3xl p-8 border border-charcoal-stone/5 shadow-inner">
              <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal-stone/60 mb-6 flex items-center">
                <BarChart2 className="w-4 h-4 mr-2" /> Official Trust Metrics
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-charcoal-stone">Tourism Value</span>
                    <span className="font-black text-forest-emerald">{creator.tourismScore}/100</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 shadow-inner">
                    <div className="bg-forest-emerald h-2 rounded-full" style={{ width: `${creator.tourismScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-charcoal-stone">Eco-Safe Practices</span>
                    <span className="font-black text-green-600">{creator.ecoSafeScore}/100</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 shadow-inner">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${creator.ecoSafeScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-charcoal-stone">Engagement</span>
                    <span className="font-black text-tribal-terracotta">{creator.engagementScore}/100</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 shadow-inner">
                    <div className="bg-tribal-terracotta h-2 rounded-full" style={{ width: `${creator.engagementScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <div className="font-black text-2xl text-[#0A2A3B]">{creator.followers}</div>
                  <div className="text-charcoal-stone/50 text-[10px] font-bold uppercase tracking-widest mt-1">Followers</div>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <div className="font-black text-2xl text-[#0A2A3B]">{creator.contentCount}</div>
                  <div className="text-charcoal-stone/50 text-[10px] font-bold uppercase tracking-widest mt-1">Stories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-8 border-b-2 border-charcoal-stone/10 flex gap-8 overflow-x-auto hide-scrollbar">
        {[
          { id: "stories", label: "Stories & Reels", icon: <Video className="w-5 h-5" /> },
          { id: "guides", label: "Travel Guides", icon: <FileText className="w-5 h-5" /> },
          { id: "routes", label: "Saved Routes", icon: <Map className="w-5 h-5" /> },
          { id: "community", label: "Community Posts", icon: <MessageCircle className="w-5 h-5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-b-4 border-tribal-terracotta text-tribal-terracotta"
                : "text-charcoal-stone/50 hover:text-charcoal-stone"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Layer */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        {activeTab === "stories" && (
          <>
            {creatorVideos.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-charcoal-stone/10 shadow-sm">
                <p className="text-charcoal-stone/60 font-bold">No stories uploaded yet.</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {creatorVideos.map((video, idx) => (
                  <div key={video.id} className="break-inside-avoid">
                    <TourismReelCard video={video} creator={creator} isLarge={idx % 3 === 0} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "guides" && (
          <div className="max-w-3xl">
             <StoryTimeline events={mockTimeline} />
          </div>
        )}

        {activeTab === "routes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-white rounded-3xl p-6 border border-charcoal-stone/10 shadow-xl group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-forest-emerald/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6 text-forest-emerald" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#0A2A3B] mb-2">The Waterfalls Trail</h3>
                <p className="text-sm text-charcoal-stone/70 mb-4 line-clamp-2">A comprehensive route covering Chitrakote, Tirathgarh, and hidden gems in Bastar.</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-sand-beige text-charcoal-stone font-bold px-2 py-1 rounded">3 Days</span>
                  <span className="text-xs bg-sand-beige text-charcoal-stone font-bold px-2 py-1 rounded">Moderate</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === "community" && (
          <div className="max-w-2xl">
             <div className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal-stone/10 shadow-xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Image src={creator.avatarUrl} alt={creator.name} width={40} height={40} className="rounded-full" />
                  <div>
                    <h4 className="font-bold text-[#0A2A3B] leading-none">{creator.name}</h4>
                    <span className="text-xs text-charcoal-stone/50 font-bold uppercase tracking-widest">2 hours ago</span>
                  </div>
                </div>
                <p className="text-charcoal-stone mb-4 font-medium leading-relaxed">
                  Just got back from the Kanger Valley National Park! The Kotumsar Caves are fully accessible right now. Who wants to see a dedicated reel on navigating the caves? 🦇🌿
                </p>
                <div className="flex items-center gap-6 pt-4 border-t border-charcoal-stone/10 text-charcoal-stone/60">
                   <button className="flex items-center gap-2 hover:text-tribal-terracotta font-bold text-sm"><Heart className="w-5 h-5" /> 2.1k</button>
                   <button className="flex items-center gap-2 hover:text-forest-emerald font-bold text-sm"><MessageCircle className="w-5 h-5" /> 342</button>
                </div>
             </div>
          </div>
        )}
      </section>
    </main>
  );
}
