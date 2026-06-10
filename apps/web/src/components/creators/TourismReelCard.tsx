"use client";

import React, { useRef, useState } from "react";
import Image from "@/components/ui/NativeImage";
import { getApiOrigin } from "../../app/data/api-config";
import Link from "next/link";
import { Play, MapPin, Heart, Bookmark, Clock, EyeOff, Trash2 } from "lucide-react";
import { CreatorVideo, Creator } from "../../app/data/api";
import { CreatorBadge } from "./CreatorCard";
import { useAuthStore } from "../../store/auth-store";

interface TourismReelCardProps {
  video: CreatorVideo;
  creator: Creator;
  isLarge?: boolean;
  onPlay?: () => void;
}

export default function TourismReelCard({ video, creator, isLarge = false, onPlay }: TourismReelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to remove video ${video.title}?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${getApiOrigin()}/api/v1/moderation/places/${video.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user?.id}`,
          "x-admin-role": user?.role || "",
        }
      });
      if (res.ok) {
        alert("Video removed successfully. Refresh to see changes.");
      } else {
        alert("Failed to remove video.");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing video.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`relative group overflow-hidden rounded-3xl bg-[#0A2A3B] mb-6 cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-forest-emerald/30 ${
        isLarge ? "h-[450px]" : "h-[350px]"
      } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onPlay}
    >
      {/* Media Layer */}
      {video.videoUrl ? (
        <>
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className={`object-cover transition-opacity duration-700 ${isHovered ? "opacity-0" : "opacity-100"}`}
          />
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? "opacity-100" : "opacity-0"}`}
          />
        </>
      ) : (
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      )}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#0A2A3B]/95 pointer-events-none transition-opacity duration-500 group-hover:opacity-80" />

      {/* Admin Inline Controls */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); alert("Hide functionality mocked."); }}
            className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors border border-white/20"
            title="Hide Video"
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white backdrop-blur-md transition-colors shadow-md"
            title="Remove Video"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <div className="flex gap-2">
          <span className="bg-forest-emerald/90 backdrop-blur-md text-sand-beige text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg border border-forest-emerald/50">
            {video.category}
          </span>
          {video.isTrending && (
            <span className="bg-tribal-terracotta/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg border border-tribal-terracotta/50">
              Trending
            </span>
          )}
        </div>
        <div className="flex gap-2">
           <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20 flex items-center">
            <Clock className="w-3 h-3 mr-1" /> {video.duration}
          </span>
           <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20">
            {video.language}
          </span>
        </div>
      </div>

      {/* Play Button Indicator (Appears on Hover for Videos) */}
      {video.videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/40 shadow-2xl">
            <Play className="w-6 h-6 text-white fill-white ml-1 drop-shadow-md" />
          </div>
        </div>
      )}

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 w-full p-5 z-10">
        <h3 className="text-white font-serif font-bold text-xl leading-tight mb-2 line-clamp-2 drop-shadow-md">
          {video.title}
        </h3>
        
        <div className="flex items-center text-sand-beige/90 text-xs mb-4 font-mono uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5 mr-1 text-tribal-terracotta" />
          {video.location}, {video.district}
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/creators/${creator.id}`} className="flex items-center gap-2.5 z-10 hover:opacity-80 transition-opacity group/creator">
            <div className="w-9 h-9 rounded-full border-2 border-forest-emerald/50 overflow-hidden relative shadow-md">
              <Image src={creator.avatarUrl} alt={creator.name} fill className="object-cover transition-transform group-hover/creator:scale-110" />
            </div>
            <div className="text-xs text-white">
              <p className="font-semibold flex items-center tracking-wide">
                {creator.name}
                {creator.verificationBadges[0] !== "NONE" && (
                   <CreatorBadge type={creator.verificationBadges[0]} />
                )}
              </p>
              <p className="text-sand-beige/60 font-mono mt-0.5">{video.views} views</p>
            </div>
          </Link>
          
          <div className="flex gap-3 z-10">
            <button className="text-white/80 hover:text-tribal-terracotta transition-colors hover:scale-110 bg-black/30 p-2 rounded-full backdrop-blur-sm border border-white/10">
              <Heart className="w-4 h-4" />
            </button>
            <button className="text-white/80 hover:text-forest-emerald transition-colors hover:scale-110 bg-black/30 p-2 rounded-full backdrop-blur-sm border border-white/10">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

