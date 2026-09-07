"use client";

import React, { useState } from "react";
import Image from "@/components/ui/NativeImage";
import { getApiOrigin } from "../../app/data/api-config";
import Link from "next/link";
import { CheckCircle, Leaf, Sparkles, MapPin, ShieldAlert, EyeOff, Trash2 } from "lucide-react";
import { Creator, VerificationBadge } from "../../app/data/api";
import { useAuthStore } from "../../store/auth-store";
import CreatorFollowButton from "../community/CreatorFollowButton";

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorBadge = ({ type }: { type: VerificationBadge }) => {
  if (type === "BLUE") return <span title="Verified Creator"><CheckCircle className="w-4 h-4 text-blue-500 fill-white ml-1" /></span>;
  if (type === "GREEN") return <span title="Eco/Rural Tourism Creator"><Leaf className="w-4 h-4 text-forest-emerald fill-green-50 ml-1" /></span>;
  if (type === "CULTURAL") return <span title="Cultural Ambassador"><Sparkles className="w-4 h-4 text-tribal-terracotta fill-orange-50 ml-1" /></span>;
  return null;
};

export default function CreatorCard({ creator }: CreatorCardProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to remove creator ${creator.name}?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${getApiOrigin()}/api/v1/moderation/creators/${creator.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user?.id}`,
          "x-admin-role": user?.role || "",
        }
      });
      if (res.ok) {
        alert("Creator removed successfully. Refresh to see changes.");
      } else {
        alert("Failed to remove creator.");
      }
    } catch (err) {
      console.error(err);
      alert("Error removing creator.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link href={`/creators/${creator.id}`} className={`block w-[280px] shrink-0 group relative overflow-hidden rounded-3xl shadow-lg shadow-forest-emerald/5 border border-forest-emerald/10 transition-transform hover:scale-[1.02] ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Banner */}
      <div className="h-24 w-full relative">
        <Image src={creator.bannerUrl} alt="Banner" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        
        {/* Admin Inline Controls */}
        {isAdmin && (
          <div className="absolute top-2 left-2 flex gap-1 z-20">
            <button 
              onClick={(e) => { e.preventDefault(); alert("Hide functionality mocked."); }}
              className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors border border-white/20"
              title="Hide Creator from Feed"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-full text-white backdrop-blur-md transition-colors shadow-md"
              title="Remove Creator Permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-sand-beige/40 backdrop-blur-md p-4 pt-10 relative h-full">
        {/* Avatar */}
        <div className="absolute -top-8 left-4 rounded-full border-[3px] border-sand-beige overflow-hidden w-16 h-16 shadow-md shadow-forest-emerald/20">
          <Image src={creator.avatarUrl} alt={creator.name} fill className="object-cover" />
        </div>

        <div className="flex justify-end absolute top-3 right-4">
          <CreatorFollowButton creatorId={creator.id} />
        </div>

        <div className="mt-2">
          <h3 className="font-bold text-[#0A2A3B] flex items-center text-lg leading-tight">
            {creator.name}
            {creator.verificationBadges.map((badge) => (
              <CreatorBadge key={badge} type={badge} />
            ))}
          </h3>
          <p className="text-forest-emerald/70 text-xs font-mono mt-0.5">@{creator.handle}</p>
        </div>

        <div className="mt-3 flex items-center text-xs text-charcoal-stone/80 font-medium">
          <MapPin className="w-3.5 h-3.5 mr-1 text-tribal-terracotta" />
          {creator.district}
          <span className="mx-2 text-charcoal-stone/30">•</span>
          <span className="font-bold">{creator.followers}</span> <span className="ml-1 opacity-70">followers</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {creator.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-forest-emerald/10 text-forest-emerald border border-forest-emerald/20">
              {cat}
            </span>
          ))}
          {creator.categories.length > 2 && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-forest-emerald/10 text-forest-emerald border border-forest-emerald/20">
              +{creator.categories.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

