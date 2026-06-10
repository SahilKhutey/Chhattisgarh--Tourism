"use client";

import React from "react";
import Image from "@/components/ui/NativeImage";
import { Sparkles, MapPin } from "lucide-react";

interface SpotlightProps {
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  category: string;
}

export default function CulturalSpotlight({ title, description, imageUrl, location, category }: SpotlightProps) {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden group cursor-pointer shadow-2xl">
      <Image src={imageUrl} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      <div className="absolute top-4 left-4">
        <span className="bg-tribal-terracotta/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
        <div className="flex items-center gap-2 text-sand-beige/80 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4 text-forest-emerald" />
          {location}
        </div>
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 drop-shadow-md">{title}</h3>
        <p className="text-sand-beige/90 text-sm md:text-base line-clamp-2 md:line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          {description}
        </p>
      </div>
    </div>
  );
}

