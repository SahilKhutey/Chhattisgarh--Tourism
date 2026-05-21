"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Leaf, Sparkles, MapPin } from "lucide-react";
import { Creator, VerificationBadge } from "../../app/data/creators";

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorBadge = ({ type }: { type: VerificationBadge }) => {
  if (type === "BLUE") return <CheckCircle className="w-4 h-4 text-blue-500 fill-white ml-1" />;
  if (type === "GREEN") return <Leaf className="w-4 h-4 text-green-500 fill-green-50 ml-1" />;
  if (type === "CULTURAL") return <Sparkles className="w-4 h-4 text-orange-500 fill-orange-50 ml-1" />;
  return null;
};

export default function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link href={`/creators/${creator.id}`} className="block w-[280px] shrink-0 group relative overflow-hidden rounded-3xl shadow-lg border border-white/10 transition-transform hover:scale-[1.02]">
      {/* Banner */}
      <div className="h-24 w-full relative">
        <Image src={creator.bannerUrl} alt="Banner" fill className="object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 p-4 pt-10 relative">
        {/* Avatar */}
        <div className="absolute -top-8 left-4 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden w-16 h-16 shadow-md">
          <Image src={creator.avatarUrl} alt={creator.name} fill className="object-cover" />
        </div>

        <div className="flex justify-end absolute top-3 right-4">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-sm">
            Follow
          </button>
        </div>

        <div className="mt-2">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center text-lg leading-tight">
            {creator.name}
            {creator.verificationBadges.map((badge) => (
              <CreatorBadge key={badge} type={badge} />
            ))}
          </h3>
          <p className="text-zinc-500 text-sm">{creator.handle}</p>
        </div>

        <div className="mt-3 flex items-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          {creator.district}
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">•</span>
          {creator.followers} followers
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {creator.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {cat}
            </span>
          ))}
          {creator.categories.length > 2 && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              +{creator.categories.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
