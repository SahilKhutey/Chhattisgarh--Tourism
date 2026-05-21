"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Compass, ShieldAlert } from "lucide-react";
import { CreatorVideo } from "../../app/data/creators";

interface PlaceHighlightCardProps {
  video: CreatorVideo;
  isDarkTheme?: boolean;
}

export default function PlaceHighlightCard({ video, isDarkTheme = false }: PlaceHighlightCardProps) {
  return (
    <div className={`w-[260px] md:w-[300px] shrink-0 rounded-3xl overflow-hidden shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'} transition-transform hover:-translate-y-1`}>
      <div className="h-40 w-full relative">
        <Image src={video.thumbnailUrl} alt={video.location} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <h4 className="font-bold text-lg leading-tight">{video.location}</h4>
          <p className="text-xs text-zinc-300 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-emerald-400" /> {video.district}
          </p>
        </div>
      </div>
      
      <div className="p-4">
        <p className={`text-sm font-medium line-clamp-2 ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
          {video.title}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isDarkTheme ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
              {video.category}
            </span>
          </div>
          
          <button className="text-emerald-600 dark:text-emerald-500 font-semibold text-xs flex items-center hover:underline">
            Explore <Compass className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
