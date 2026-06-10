"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "@/components/ui/NativeImage";
import Link from "next/link";
import { Filter, Play, Map, MapPin, UserPlus, Tent, Utensils, Music, Trees, Compass } from "lucide-react";
import { fetchCreators, fetchCreatorFeed, Creator, CreatorVideo } from "../data/api";
import CreatorCard from "../../components/creators/CreatorCard";
import TourismReelCard from "../../components/creators/TourismReelCard";
import VideoDetailModal from "../../components/creators/VideoDetailModal";

interface FeedCreator extends Creator {
  user?: {
    fullName?: string;
    avatar?: string;
  };
}

interface FeedVideoItem extends CreatorVideo {
  creator?: FeedCreator;
}

const discoveryChips = [
  { label: "Waterfalls", icon: <MapPin className="w-4 h-4" /> },
  { label: "Food", icon: <Utensils className="w-4 h-4" /> },
  { label: "Adventure", icon: <Tent className="w-4 h-4" /> },
  { label: "Tribal Culture", icon: <Music className="w-4 h-4" /> },
  { label: "Wildlife", icon: <Trees className="w-4 h-4" /> },
  { label: "Hidden Gems", icon: <Compass className="w-4 h-4" /> },
];

const districts = [
  { name: "Bastar", tag: "Tribal Heartland", color: "from-forest-emerald to-[#0A2A3B]" },
  { name: "Jagdalpur", tag: "City of Lakes & Waterfalls", color: "from-blue-600 to-indigo-900" },
  { name: "Raipur", tag: "Capital Heritage", color: "from-tribal-terracotta to-orange-900" },
  { name: "Bilaspur", tag: "Nyayadhani", color: "from-purple-600 to-fuchsia-900" },
  { name: "Dantewada", tag: "Shakti Peeth", color: "from-red-600 to-rose-900" },
];

export default function CreatorsFeed() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [feedVideos, setFeedVideos] = useState<FeedVideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ video: CreatorVideo, creator: Creator } | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);

  // Infinite Scroll State
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadFeed = useCallback(async (pageNumber: number) => {
    setIsLoadingFeed(true);
    const data = await fetchCreatorFeed(pageNumber, 15);
    if (data.videos && data.videos.length > 0) {
      const nextVideos = data.videos as FeedVideoItem[];
      setFeedVideos(prev => pageNumber === 1 ? nextVideos : [...prev, ...nextVideos]);
      setHasMore(data.metadata.page < data.metadata.totalPages);
    } else {
      setHasMore(false);
    }
    setIsLoadingFeed(false);
  }, []);

  useEffect(() => {
    // We fetch a few creators for the discovery cards
    fetchCreators().then(({ creators }) => {
      setCreators(creators);
    });
    // Initial feed load
    Promise.resolve().then(() => loadFeed(1));
  }, [loadFeed]);

  // Intersection Observer for Infinite Scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoadingFeed) {
        setPage(p => {
          const nextPage = p + 1;
          loadFeed(nextPage);
          return nextPage;
        });
      }
    },
    [hasMore, isLoadingFeed, loadFeed]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Hero Slider logic
  useEffect(() => {
    if (feedVideos.length > 0) {
      const interval = setInterval(() => {
        setHeroSlide((prev) => (prev + 1) % Math.min(3, feedVideos.length));
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [feedVideos]);

  return (
    <main className="min-h-screen bg-sand-beige text-[#0A2A3B] overflow-x-hidden font-sans">
      
      {/* 0. Page Header (Inline) */}
      <div className="w-full bg-[#0A2A3B] text-white border-b border-white/10 px-6 py-4 flex items-center justify-between md:hidden">
         <div className="flex items-center gap-3">
           <span className="w-8 h-8 bg-forest-emerald rounded flex items-center justify-center text-white font-serif font-bold">CG</span>
           <div>
             <h1 className="text-white font-bold text-sm leading-none">Explore Through Creators</h1>
             <p className="text-white/60 text-xs">Stories from across Chhattisgarh</p>
           </div>
         </div>
         <button className="text-white hover:text-forest-emerald transition-colors"><Filter className="w-5 h-5" /></button>
      </div>

      {/* 1. Hero Cinematic Section (Immersive Slider) */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {feedVideos.slice(0, 3).map((videoData, idx) => {
           const video = videoData;
           const creator = videoData.creator 
             ? { ...videoData.creator, name: videoData.creator.user?.fullName || 'Creator', avatarUrl: videoData.creator.user?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG' } 
             : creators.find(c => c.id === video.creatorId);
             
           return (
             <div 
               key={`hero-${video.id}`} 
               className={`absolute inset-0 transition-opacity duration-1000 ${idx === heroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
             >
               {video.videoUrl ? (
                 <video 
                   src={video.videoUrl} 
                   autoPlay 
                   muted 
                   loop 
                   playsInline 
                   className="w-full h-full object-cover scale-105 animate-[slowZoom_20s_ease-in-out_infinite_alternate]" 
                 />
               ) : (
                  <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover scale-105 animate-[slowZoom_20s_ease-in-out_infinite_alternate]" />
               )}
               <div className="absolute inset-0 bg-gradient-to-r from-[#0A2A3B]/90 via-[#0A2A3B]/40 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-t from-sand-beige via-transparent to-transparent opacity-90" />
               
               {/* Slider Content */}
               <div className="absolute inset-0 z-20 flex items-center">
                  <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 mt-20 md:mt-0">
                    <div className="max-w-3xl transform transition-all duration-700 translate-y-0 opacity-100">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-emerald/20 border border-forest-emerald/30 text-forest-emerald text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-lg shadow-forest-emerald/10">
                        <MapPin className="w-4 h-4 text-tribal-terracotta" />
                        {video.district}
                      </div>
                      <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.05] mb-4 drop-shadow-2xl">
                        {video.title}
                      </h1>
                      <div className="flex items-center gap-3 mb-8">
                         {creator?.avatarUrl && (
                           <Image src={creator.avatarUrl} alt="Creator" width={32} height={32} className="rounded-full border-2 border-white/50 object-cover" />
                         )}
                         <span className="text-white/80 font-medium">@{creator?.handle || creator?.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => setSelectedVideo({ video, creator: creator! })}
                          className="bg-forest-emerald hover:bg-forest-emerald/90 text-white font-bold py-3.5 px-8 rounded-full flex items-center transition-transform hover:scale-105 shadow-xl border border-forest-emerald/50"
                        >
                          <Play className="w-5 h-5 mr-2 fill-current" /> Watch Story
                        </button>
                        <Link href="/creator">
                          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold py-3.5 px-8 rounded-full flex items-center transition-all hover:scale-105 shadow-xl hidden md:flex">
                            <UserPlus className="w-5 h-5 mr-2" /> Become a Creator
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
               </div>
             </div>
           );
        })}
        {/* Slider Indicators */}
        <div className="absolute bottom-12 left-0 w-full z-30 flex justify-center gap-2">
           {feedVideos.slice(0, 3).map((_, idx) => (
             <button 
               key={`ind-${idx}`} 
               onClick={() => setHeroSlide(idx)}
               className={`h-1.5 rounded-full transition-all ${idx === heroSlide ? 'w-8 bg-forest-emerald' : 'w-4 bg-white/40'}`} 
             />
           ))}
        </div>
      </section>

      {/* 2. Quick Discovery Chips */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 relative z-20 -mt-6">
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {discoveryChips.map((chip, idx) => (
            <button key={idx} className="snap-start shrink-0 flex items-center gap-2 bg-white/80 backdrop-blur-md hover:bg-forest-emerald hover:text-white border border-charcoal-stone/10 text-charcoal-stone font-bold px-5 py-3 rounded-full transition-all shadow-sm">
              {chip.icon}
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Trending Near You */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center">
             <Compass className="w-6 h-6 mr-3 text-tribal-terracotta" />
             Trending Near You
           </h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
          {feedVideos.slice(0, 8).map((videoData) => {
            const video = videoData;
            const creator = videoData.creator 
              ? { ...videoData.creator, name: videoData.creator.user?.fullName || 'Creator', avatarUrl: videoData.creator.user?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg' } 
              : creators.find((c) => c.id === video.creatorId);
            if (!creator) return null;
            return (
              <div key={`trending-${video.id}`} className="snap-start shrink-0 w-[280px] md:w-[320px]">
                <TourismReelCard video={video} creator={creator} onPlay={() => setSelectedVideo({ video, creator })} />
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Explore by District */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">Explore by District</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           {districts.map(district => (
             <div key={district.name} className={`relative h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-lg bg-gradient-to-br ${district.color}`}>
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
               <div className="absolute bottom-4 left-4 right-4">
                 <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-md group-hover:-translate-y-1 transition-transform">{district.name}</h3>
                 <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{district.tag}</p>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* 5. Main Content Feed (Hybrid Layout) */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 flex items-center">
          <Filter className="w-6 h-6 mr-3 text-forest-emerald" />
          Curated Discovery
        </h2>
        
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {/* Inject Creators and Videos in a masonry pattern */}
          {creators.slice(0, 2).map(creator => (
            <div key={`creator-${creator.id}`} className="break-inside-avoid">
              <CreatorCard creator={creator} />
            </div>
          ))}
          {feedVideos.map((videoData, idx) => {
            const video = videoData;
            const creator = videoData.creator 
              ? { ...videoData.creator, name: videoData.creator.user?.fullName || 'Creator', avatarUrl: videoData.creator.user?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MAINPAT%2CAMBIKAPUR_CG.jpg/1280px-MAINPAT%2CAMBIKAPUR_CG.jpg' } 
              : creators.find(c => c.id === video.creatorId);
            if (!creator) return null;
            return (
              <div key={`feed-${video.id}-${idx}`} className="break-inside-avoid" onClick={() => setSelectedVideo({ video, creator })}>
                <TourismReelCard video={video} creator={creator} isLarge={idx % 4 === 0} />
              </div>
            );
          })}
        </div>

        {/* Loading Spinner & Observer Target */}
        {hasMore && (
          <div ref={observerTarget} className="w-full py-12 flex justify-center items-center mt-8">
            <div className="w-8 h-8 rounded-full border-4 border-forest-emerald/20 border-t-forest-emerald animate-spin" />
          </div>
        )}
      </section>

      {/* 6. Interactive Map Mock Section */}
      <section className="w-full bg-[#0A2A3B] py-20 mt-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 relative z-10">
           <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Explore the Map</h2>
              <p className="text-sand-beige/80 text-lg mb-8 max-w-md">Discover hidden waterfalls, ancient temples, and local street food directly through our interactive map of Chhattisgarh.</p>
              <Link href="/explore">
                 <button className="bg-forest-emerald text-white font-bold py-3.5 px-8 rounded-full flex items-center transition-transform hover:scale-105 shadow-xl shadow-forest-emerald/20 border border-forest-emerald/50">
                    <Map className="w-5 h-5 mr-2" /> Open Interactive Map
                 </button>
              </Link>
           </div>
           <div className="flex-1 w-full relative h-[400px]">
              {/* CSS Mock of a Map */}
              <div className="absolute inset-0 bg-[#0c3245] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                 <div className="absolute top-10 left-10 w-40 h-40 bg-forest-emerald/20 rounded-full blur-3xl animate-pulse" />
                 <div className="absolute bottom-20 right-20 w-60 h-60 bg-tribal-terracotta/20 rounded-full blur-3xl animate-pulse" />
                 
                 {/* Mock Map Markers */}
                 <div className="absolute top-[30%] left-[40%] flex flex-col items-center group cursor-pointer">
                    <div className="bg-white p-1 rounded-lg shadow-lg mb-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 w-32">
                       <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Danteswari_Temple_0034.jpg/1280px-Danteswari_Temple_0034.jpg" alt="Chitrakote" width={120} height={60} className="rounded object-cover h-16 w-full" />
                       <p className="text-xs font-bold text-charcoal-stone mt-1 text-center">Chitrakote Falls</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-forest-emerald border-2 border-white shadow-md shadow-forest-emerald/50 animate-bounce" />
                 </div>

                 <div className="absolute bottom-[40%] right-[30%] flex flex-col items-center group cursor-pointer">
                    <div className="bg-white p-1 rounded-lg shadow-lg mb-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 w-32">
                       <Image src="https://upload.wikimedia.org/wikipedia/commons/1/19/Kanger_valley_National_Park.png" alt="Bastar" width={120} height={60} className="rounded object-cover h-16 w-full" />
                       <p className="text-xs font-bold text-charcoal-stone mt-1 text-center">Bastar Art</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-tribal-terracotta border-2 border-white shadow-md shadow-tribal-terracotta/50 animate-bounce delay-150" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Detail Modal Layer */}
      {selectedVideo && (
        <VideoDetailModal 
          video={selectedVideo.video} 
          creator={selectedVideo.creator} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </main>
  );
}


