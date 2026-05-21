"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, MapPin, Heart, Bookmark, Eye, Clock, Hash } from "lucide-react";
import { CreatorVideo, Creator } from "../../app/data/creators";
import { CreatorBadge } from "./CreatorCard";

interface TourismReelCardProps {
  video: CreatorVideo;
  creator: Creator;
  isLarge?: boolean;
}

export default function TourismReelCard({ video, creator, isLarge = false }: TourismReelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && video.videoUrl) {
      videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && video.videoUrl) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`relative group overflow-hidden rounded-3xl bg-zinc-900 mb-6 cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20 ${
        isLarge ? "h-[450px]" : "h-[350px]"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Layer */}
      {video.videoUrl ? (
        <>
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className={`object-cover transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`}
          />
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
          />
        </>
      ) : (
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
            {video.category}
          </span>
          {video.isTrending && (
            <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg flex items-center">
              Trending
            </span>
          )}
        </div>
        <div className="flex gap-2">
           <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 flex items-center">
            <Clock className="w-3 h-3 mr-1" /> {video.duration}
          </span>
           <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
            {video.language}
          </span>
        </div>
      </div>

      {/* Play Button Indicator (Appears on Hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 w-full p-5">
        <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-md">
          {video.title}
        </h3>
        
        <div className="flex items-center text-zinc-200 text-sm mb-4 font-medium">
          <MapPin className="w-4 h-4 mr-1 text-emerald-400" />
          {video.location}, {video.district}
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/creators/${creator.id}`} className="flex items-center gap-2 z-10 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full border-2 border-white/50 overflow-hidden relative">
              <Image src={creator.avatarUrl} alt={creator.name} fill className="object-cover" />
            </div>
            <div className="text-xs text-white">
              <p className="font-semibold flex items-center">
                {creator.name}
                {creator.verificationBadges[0] !== "NONE" && (
                   <CreatorBadge type={creator.verificationBadges[0]} />
                )}
              </p>
              <p className="opacity-75">{video.views} views</p>
            </div>
          </Link>
          
          <div className="flex gap-3 z-10">
            <button className="text-white/90 hover:text-white transition-colors hover:scale-110">
              <Heart className="w-5 h-5" />
            </button>
            <button className="text-white/90 hover:text-white transition-colors hover:scale-110">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
