"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Filter, Play, Map, MapPin } from "lucide-react";
import { CREATOR_VIDEOS, CREATORS, CreatorVideo } from "../data/creators";
import { useLanguage } from "../../context/LanguageContext";
import CreatorCard from "../../components/creators/CreatorCard";
import TourismReelCard from "../../components/creators/TourismReelCard";
import PlaceHighlightCard from "../../components/creators/PlaceHighlightCard";

export default function CreatorsFeed() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLanguage, setActiveLanguage] = useState("All");

  const categories = ["All", "Nature", "Culture", "Food", "Festivals", "Trekking", "Hidden Places", "Adventure"];
  const languages = ["All", "Hindi", "Chhattisgarhi", "English"];

  const filteredVideos = CREATOR_VIDEOS.filter((video) => {
    const matchesCategory = activeCategory === "All" || video.category === activeCategory;
    const matchesLanguage = activeLanguage === "All" || video.language === activeLanguage;
    return matchesCategory && matchesLanguage;
  });

  const trendingVideos = CREATOR_VIDEOS.filter(v => v.isTrending);
  const hiddenGems = CREATOR_VIDEOS.filter(v => v.isHiddenGem);

  // Helper for masonry layout
  const col1: CreatorVideo[] = [];
  const col2: CreatorVideo[] = [];
  const col3: CreatorVideo[] = [];
  const col4: CreatorVideo[] = [];
  
  filteredVideos.forEach((video, index) => {
    if (index % 4 === 0) col1.push(video);
    else if (index % 4 === 1) col2.push(video);
    else if (index % 4 === 2) col3.push(video);
    else col4.push(video);
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-x-hidden pt-16">
      
      {/* 1. Hero Cinematic Section */}
      <section className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        {trendingVideos[0] && (
           <div className="absolute inset-0">
             {trendingVideos[0].videoUrl ? (
               <video 
                 src={trendingVideos[0].videoUrl} 
                 autoPlay 
                 muted 
                 loop 
                 playsInline 
                 className="w-full h-full object-cover" 
               />
             ) : (
                <Image src={trendingVideos[0].thumbnailUrl} alt="Hero" fill className="object-cover" />
             )}
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
           </div>
        )}
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 mt-20 md:mt-0">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <SparklesIcon className="w-4 h-4" />
              {t("creators.hero_badge") || "Community Driven Tourism"}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
              {t("creators.hero_title") || "Discover Chhattisgarh Through Local Storytellers."}
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 font-medium mb-8 max-w-xl drop-shadow-md">
              {t("creators.hero_subtitle") || "Experience hidden waterfalls, ancient tribal heritage, and authentic street food straight from the lens of the creators who call this land home."}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full flex items-center transition-transform hover:scale-105 shadow-lg shadow-emerald-900/20">
                <Play className="w-5 h-5 mr-2 fill-white" /> Watch Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Creators Block */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12 -mt-16 relative z-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
             Featured Local Creators
          </h2>
        </div>
        <div className="flex overflow-x-auto pb-6 -mx-6 px-6 gap-6 hide-scrollbar snap-x snap-mandatory">
          {CREATORS.map(creator => (
            <div key={creator.id} className="snap-start">
              <CreatorCard creator={creator} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trending Near You */}
      <section className="w-full bg-zinc-100 dark:bg-zinc-950 py-12 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-zinc-900 dark:text-white">
            <MapPin className="w-6 h-6 mr-2 text-emerald-500" /> Trending Near You
          </h2>
          <div className="flex overflow-x-auto pb-6 -mx-6 px-6 gap-6 hide-scrollbar snap-x">
             {trendingVideos.map(video => (
               <div key={video.id} className="snap-start">
                 <PlaceHighlightCard video={video} />
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 4. Quick Discovery Chips */}
      <section className="sticky top-16 z-30 bg-zinc-50/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center text-zinc-500 font-medium text-sm border-r border-zinc-300 dark:border-zinc-700 pr-4">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 items-center flex-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-2 flex-shrink-0" />
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeLanguage === lang
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Content Feed (Hybrid Layout) */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white flex justify-between items-end">
          <span>Explore Experiences</span>
          <span className="text-sm font-medium text-zinc-500">{filteredVideos.length} stories</span>
        </h2>
        
        {filteredVideos.length === 0 ? (
          <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <Filter className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No stories found</h3>
            <p className="text-zinc-500 text-sm">Try adjusting your category or language filters.</p>
            <button onClick={() => { setActiveCategory("All"); setActiveLanguage("All"); }} className="mt-6 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-full">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="flex flex-col gap-6">
              {col1.map((video, idx) => (
                <TourismReelCard key={video.id} video={video} creator={CREATORS.find(c => c.id === video.creatorId)!} isLarge={idx % 2 === 0} />
              ))}
            </div>
            <div className="flex flex-col gap-6">
              {col2.map((video, idx) => (
                <TourismReelCard key={video.id} video={video} creator={CREATORS.find(c => c.id === video.creatorId)!} isLarge={idx % 2 !== 0} />
              ))}
            </div>
            <div className="hidden lg:flex flex-col gap-6">
              {col3.map((video, idx) => (
                <TourismReelCard key={video.id} video={video} creator={CREATORS.find(c => c.id === video.creatorId)!} isLarge={idx % 2 === 0} />
              ))}
            </div>
            <div className="hidden xl:flex flex-col gap-6">
              {col4.map((video, idx) => (
                <TourismReelCard key={video.id} video={video} creator={CREATORS.find(c => c.id === video.creatorId)!} isLarge={idx % 2 !== 0} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 6. Hidden Gems */}
      <section className="w-full bg-black text-white py-16 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
             <div>
               <h2 className="text-3xl font-black mb-3">Hidden Gems</h2>
               <p className="text-zinc-400 max-w-xl">Places even locals don&apos;t know. Avoid overcrowding by exploring these pristine, unmapped corridors.</p>
             </div>
             <button className="mt-6 md:mt-0 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-full transition-colors flex items-center w-fit">
               <Map className="w-4 h-4 mr-2" /> View on Map
             </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {hiddenGems.map(video => (
                <PlaceHighlightCard key={video.id} video={video} isDarkTheme={true} />
             ))}
           </div>
        </div>
      </section>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
)
