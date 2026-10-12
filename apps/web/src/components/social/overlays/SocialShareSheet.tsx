'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Share2, MessageCircle } from 'lucide-react';
import { trackSocialEvent } from '@/lib/social/analytics';
import { SocialIconButton } from '@/components/social/buttons';
import { cn } from '@/lib/ui/cn';

export interface SocialShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  contentId?: string;
  creatorHandle?: string;
}

export function SocialShareSheet({
  isOpen,
  onClose,
  title,
  url,
  contentId,
  creatorHandle,
}: SocialShareSheetProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        trackSocialEvent('social_share', {
          contentId,
          creatorHandle,
          targetUrl: url,
          method: 'clipboard',
        });
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        trackSocialEvent('social_share', {
          contentId,
          creatorHandle,
          targetUrl: url,
          method: 'native',
        });
        onClose();
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`Explore this story on Chhattisgarh Tourism: ${title}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-sheet-title"
      className="fixed inset-0 z-[450] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl',
          'border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-250'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-forest-emerald" />
            <h2 id="share-sheet-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Share Discovery
            </h2>
          </div>
          <SocialIconButton
            icon={<X className="w-4 h-4" />}
            aria-label="Close share sheet"
            onClick={onClose}
          />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 line-clamp-2">
          {title}
        </p>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 min-h-[70px] active:scale-95 transition-all text-xs font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <Share2 className="w-5 h-5 text-forest-emerald" />
              <span>Native Share</span>
            </button>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackSocialEvent('social_share', {
                contentId,
                creatorHandle,
                targetUrl: url,
                method: 'whatsapp',
              });
            }}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 min-h-[70px] active:scale-95 transition-all text-xs font-semibold text-emerald-800 dark:text-emerald-300"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackSocialEvent('social_share', {
                contentId,
                creatorHandle,
                targetUrl: url,
                method: 'twitter',
              });
            }}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60 min-h-[70px] active:scale-95 transition-all text-xs font-semibold text-sky-800 dark:text-sky-300"
          >
            <span className="font-bold text-lg leading-none text-sky-600">𝕏</span>
            <span>Post</span>
          </a>
        </div>

        {/* Copy Link field */}
        <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <input
            type="text"
            readOnly
            value={url}
            aria-label="Discovery URL"
            className="flex-1 bg-transparent px-2 text-xs text-zinc-700 dark:text-zinc-300 truncate focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors',
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-forest-emerald hover:bg-forest-emerald/90 text-white'
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
