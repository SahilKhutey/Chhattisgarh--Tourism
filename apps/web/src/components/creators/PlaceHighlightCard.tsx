"use client";

import React, { useState } from "react";
import Image from "@/components/ui/NativeImage";
import { getApiOrigin } from "../../app/data/api-config";
import Link from "next/link";
import { MapPin, Compass, EyeOff, Trash2 } from "lucide-react";
import { CreatorVideo } from "../../app/data/api";
import { useAuthStore } from "../../store/auth-store";

interface PlaceHighlightCardProps {
  video: CreatorVideo;
  isDarkTheme?: boolean;
}

export default function PlaceHighlightCard({ video, isDarkTheme = false }: PlaceHighlightCardProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to remove place ${video.location}?`)) return;
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
        alert("Place removed successfully. Refresh to see changes.");
      } else {
        alert("Failed to remove place.");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing place.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`w-[260px] md:w-[300px] shrink-0 rounded-3xl overflow-hidden shadow-lg shadow-[#0A2A3B]/5 border ${isDarkTheme ? 'bg-[#0A2A3B] border-white/10' : 'bg-sand-beige/40 backdrop-blur-md border-forest-emerald/10'} transition-transform duration-500 hover:-translate-y-1 group relative ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="h-40 w-full relative overflow-hidden">
        <Image src={video.thumbnailUrl} alt={video.location} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className={`absolute inset-0 bg-gradient-to-t ${isDarkTheme ? 'from-[#0A2A3B] to-transparent' : 'from-black/80 to-transparent'}`} />
        
        {/* Admin Inline Controls */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.preventDefault(); alert("Hide functionality mocked."); }}
              className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors border border-white/20"
              title="Hide Place"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-full text-white backdrop-blur-md transition-colors shadow-md"
              title="Remove Place"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 text-white z-10">
          <h4 className="font-serif font-bold text-lg leading-tight tracking-wide drop-shadow-md">{video.location}</h4>
          <p className="text-xs text-sand-beige flex items-center font-mono mt-0.5">
            <MapPin className="w-3 h-3 mr-1 text-tribal-terracotta" /> {video.district}
          </p>
        </div>
      </div>
      
      <div className="p-4 relative">
        <p className={`text-sm font-medium line-clamp-2 ${isDarkTheme ? 'text-sand-beige/80' : 'text-charcoal-stone/90'}`}>
          {video.title}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${isDarkTheme ? 'bg-white/10 text-white/90 border border-white/10' : 'bg-forest-emerald/10 text-forest-emerald border border-forest-emerald/20'}`}>
              {video.category}
            </span>
          </div>
          
          <button className={`font-semibold text-xs flex items-center hover:underline transition-colors ${isDarkTheme ? 'text-tribal-terracotta' : 'text-forest-emerald hover:text-tribal-terracotta'}`}>
            Explore <Compass className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

