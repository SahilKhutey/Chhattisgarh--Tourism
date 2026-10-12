'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, MapPin, Compass, Share2, Sparkles, User, ExternalLink } from 'lucide-react';
import { SocialContent } from '@/lib/social/types';
import { trackSocialEvent } from '@/lib/social/analytics';
import {
  getSocialCreatorPath,
  getTourismDestinationPath,
  getTourismItineraryPath,
  getSocialContentPath,
} from '@/lib/social/navigation';
import {
  SocialPrimaryButton,
  SocialSecondaryButton,
  SocialSourceButton,
  SocialIconButton,
} from '@/components/social/buttons';
import { SocialShareSheet } from './SocialShareSheet';
import { SocialPlatformBadge } from '@/components/social/SocialPlatformBadge';
import { SocialContentTypeBadge } from '@/components/social/SocialContentTypeBadge';
import { cn } from '@/lib/ui/cn';

export interface SocialMediaLightboxProps {
  content: SocialContent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SocialMediaLightbox({
  content,
  isOpen,
  onClose,
}: SocialMediaLightboxProps) {
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !content) return;

    // Track content open in analytics
    trackSocialEvent('social_content_open', {
      contentId: content.id,
      platform: content.platform,
      contentType: content.content_type,
      creatorHandle: content.creator?.handle || 'unknown',
      districtId: content.district_id,
      placeSlug: content.place_slug || undefined,
    });

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, content, onClose]);

  if (!isOpen || !content) return null;

  const creatorName = content.creator?.display_name || content.creator_name || 'Verified Explorer';
  const creatorHandle = content.creator?.handle || 'creator';
  const placeTarget = content.place_slug || content.district_id;
  const destinationUrl = getTourismDestinationPath(placeTarget);
  const itineraryUrl = getTourismItineraryPath(placeTarget);
  const contentShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${getSocialContentPath(content.id)}`
    : getSocialContentPath(content.id);

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        className="fixed inset-0 z-[400] flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className={cn(
            'relative w-full max-w-5xl max-h-[92vh] bg-zinc-950 text-white rounded-3xl overflow-hidden',
            'border border-zinc-800 shadow-2xl flex flex-col md:flex-row',
            'animate-in zoom-in-95 duration-220'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 z-20">
            <SocialIconButton
              icon={<X className="w-5 h-5 text-white" />}
              aria-label="Close media preview"
              onClick={onClose}
              className="bg-black/50 hover:bg-black/80 text-white"
            />
          </div>

          {/* Left Media Area */}
          <div className="relative flex-1 min-h-[280px] sm:min-h-[380px] md:min-h-[500px] bg-black flex items-center justify-center overflow-hidden">
            {content.thumbnail_url ? (
              <Image
                src={content.thumbnail_url}
                alt={content.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-zinc-500 gap-2">
                <Sparkles className="w-8 h-8 text-forest-emerald" />
                <span className="text-sm">Regional Tourism Media</span>
              </div>
            )}

            {/* Platform & Type Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              <SocialPlatformBadge platform={content.platform} />
              <SocialContentTypeBadge type={content.content_type} />
            </div>
          </div>

          {/* Right Details Area */}
          <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col justify-between p-5 sm:p-6 overflow-y-auto bg-zinc-900/95 border-t md:border-t-0 md:border-l border-zinc-800">
            <div className="flex flex-col gap-4">
              {/* Creator Info Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <Link
                  href={getSocialCreatorPath(creatorHandle)}
                  onClick={() => {
                    trackSocialEvent('social_creator_open', {
                      creatorHandle,
                      source: 'lightbox',
                    });
                    onClose();
                  }}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative w-10 h-10 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-forest-emerald/40 shrink-0">
                    {content.creator?.profile_image_url ? (
                      <Image
                        src={content.creator.profile_image_url}
                        alt={creatorName}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {creatorName}
                    </span>
                    <span className="text-xs text-zinc-400">@{creatorHandle}</span>
                  </div>
                </Link>

                <SocialIconButton
                  icon={<Share2 className="w-4 h-4 text-zinc-300" />}
                  aria-label="Share story"
                  onClick={() => setShareOpen(true)}
                  className="hover:bg-zinc-800 text-zinc-300"
                />
              </div>

              {/* Title & Caption */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {content.title}
                </h3>
                {content.caption && (
                  <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed max-h-36 overflow-y-auto pr-1">
                    {content.caption}
                  </p>
                )}
              </div>

              {/* Geographic Context Badge */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-forest-emerald" />
                  <span>{content.place_name || content.district_id}</span>
                </div>
                {content.district_id && content.place_name && (
                  <span className="text-xs text-zinc-400">
                    District: {content.district_id}
                  </span>
                )}
              </div>
            </div>

            {/* Tourism Action Section */}
            <div className="flex flex-col gap-3 pt-5 mt-4 border-t border-zinc-800">
              {/* Primary Gateway CTA: Plan Itinerary */}
              <Link
                href={itineraryUrl}
                onClick={() => {
                  trackSocialEvent('social_destination_click', {
                    contentId: content.id,
                    placeSlug: placeTarget,
                    action: 'plan_itinerary',
                  });
                  onClose();
                }}
              >
                <SocialPrimaryButton
                  className="w-full justify-center"
                  icon={<Compass className="w-4 h-4" />}
                >
                  Plan Visit to {content.place_name || content.district_id}
                </SocialPrimaryButton>
              </Link>

              {/* Original Platform Source Link */}
              {content.source_url && (
                <SocialSourceButton
                  sourceUrl={content.source_url}
                  provider={content.platform}
                  contentId={content.id}
                  variant="secondary"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Sheet Sub-Modal */}
      <SocialShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={content.title}
        url={contentShareUrl}
        contentId={content.id}
        creatorHandle={creatorHandle}
      />
    </>
  );
}
