"use client";
import React, { useState } from 'react';
import Image from "@/components/ui/NativeImage";

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  license?: string;
  creatorHandle?: string;
  tags?: string[];
}

export function CreatorMediaGallery({ media }: { media: MediaAsset[] }) {
  const [selectedImage, setSelectedImage] = useState<MediaAsset | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-white mb-6">Verified Creator Content</h3>
      
      {/* CSS Masonry Layout using columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {media.map((asset) => (
          <div 
            key={asset.id} 
            className="relative group rounded-xl overflow-hidden cursor-pointer break-inside-avoid border border-white/10"
            onClick={() => setSelectedImage(asset)}
          >
            <div className="relative w-full overflow-hidden bg-black/40">
              <Image 
                src={asset.url} 
                alt="Creator Media" 
                width={800} 
                height={600} 
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Attribution Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm drop-shadow-md">
                  {asset.creatorHandle || '@unknown_creator'}
                </span>
                {asset.license === 'CREATOR_LICENSED' && (
                  <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-1 rounded text-white backdrop-blur-md">
                    Licensed
                  </span>
                )}
              </div>
              {asset.tags && asset.tags.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {asset.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-white/70 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 text-white/50 hover:text-white"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image 
              src={selectedImage.url} 
              alt="Fullscreen Media" 
              width={1600} 
              height={1200} 
              className="object-contain max-h-[85vh] rounded-lg"
            />
            <div className="mt-4 flex flex-col items-center">
              <p className="text-white text-lg font-medium">
                {selectedImage.creatorHandle ? `Captured by ${selectedImage.creatorHandle}` : 'Community Asset'}
              </p>
              <p className="text-white/50 text-sm mt-1">
                License: {selectedImage.license?.replace('_', ' ') || 'STANDARD'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

