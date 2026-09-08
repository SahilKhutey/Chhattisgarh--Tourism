'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Tag,
  Share2,
  Accessibility,
} from 'lucide-react';
import { ContentEntry, TemplateFieldConfig } from '../template-builder/types';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface ContentRendererProps {
  entry: ContentEntry;
  fields?: TemplateFieldConfig[];
  isModerator?: boolean;
  onReview?: (status: 'PUBLISHED' | 'REJECTED', note?: string) => Promise<void>;
  isLoading?: boolean;
}

export function ContentRenderer({
  entry,
  fields,
  isModerator = false,
  onReview,
  isLoading = false,
}: ContentRendererProps) {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'PUBLISHED' | 'REJECTED'>('PUBLISHED');

  const data = entry.data || {};
  const templateFields = fields || entry.template?.fields || [];

  // Extract common metadata
  const title = (data.title as string) || (data.name as string) || 'Tourism Experience';
  const summary = (data.summary as string) || (data.shortDescription as string);
  const description = (data.description as string) || (data.story as string);
  const heroImage = (data.heroImage as string) || (data.image as string);
  const gallery = Array.isArray(data.gallery) ? (data.gallery as string[]) : [];
  const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];
  const district = (data.district as string) || entry.region;
  const category = (data.category as string);
  const entryFee = typeof data.entryFee === 'number' ? data.entryFee : null;
  const bestSeason = (data.bestSeason as string) || (data.bestTime as string);
  const isAccessible = Boolean(data.isAccessible);

  // Geographic coordinates
  const lat = entry.lat ?? (data.location?.lat as number | undefined);
  const lng = entry.lng ?? (data.location?.lng as number | undefined);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleConfirmReview = async () => {
    if (onReview) {
      await onReview(reviewAction, reviewNote);
      setShowReviewModal(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Moderator Action Bar */}
      {isModerator && entry.status === 'PENDING_REVIEW' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 text-sm font-medium">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>This entry is pending moderation review.</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setReviewAction('REJECTED');
                setShowReviewModal(true);
              }}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setReviewAction('PUBLISHED');
                setShowReviewModal(true);
              }}
            >
              Approve & Publish
            </Button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      {heroImage && (
        <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-md border border-charcoal-stone/10 bg-sand-beige/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {entry.template?.name && (
                <span className="px-2.5 py-1 rounded-full bg-forest-emerald text-white text-xs font-bold uppercase tracking-wider">
                  {entry.template.name}
                </span>
              )}
              {district && (
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {district}
                </span>
              )}
              {category && (
                <span className="px-2.5 py-1 rounded-full bg-sand-beige/30 backdrop-blur-md text-sand-beige text-xs font-semibold">
                  {category}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          </div>
        </div>
      )}

      {/* Header Info without Hero Image */}
      {!heroImage && (
        <div className="space-y-3 border-b border-charcoal-stone/10 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {entry.template?.name && (
              <span className="px-2.5 py-1 rounded-full bg-forest-emerald/10 text-forest-emerald text-xs font-bold uppercase tracking-wider">
                {entry.template.name}
              </span>
            )}
            {district && (
              <span className="px-2.5 py-1 rounded-full bg-sand-beige/40 text-charcoal-stone text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-forest-emerald" />
                {district}
              </span>
            )}
            {entry.status === 'PUBLISHED' && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified & Published
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-charcoal-stone">{title}</h1>
        </div>
      )}

      {/* Quick Attributes Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-sand-beige/15 border border-charcoal-stone/10">
        {lat !== undefined && lng !== undefined && (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-forest-emerald/10 text-forest-emerald shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-charcoal-stone/60 font-medium">GPS Location</div>
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-forest-emerald hover:underline flex items-center gap-1"
              >
                {lat.toFixed(3)}, {lng.toFixed(3)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {bestSeason && (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sand-beige text-charcoal-stone shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-charcoal-stone/60 font-medium">Best Season</div>
              <div className="text-xs font-bold text-charcoal-stone">{bestSeason}</div>
            </div>
          </div>
        )}

        {entryFee !== null && (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-forest-emerald/10 text-forest-emerald shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-charcoal-stone/60 font-medium">Entry Fee</div>
              <div className="text-xs font-bold text-charcoal-stone">
                {entryFee === 0 ? 'Free Entry' : `₹${entryFee}`}
              </div>
            </div>
          </div>
        )}

        {isAccessible && (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-charcoal-stone/60 font-medium">Accessibility</div>
              <div className="text-xs font-bold text-charcoal-stone">Wheelchair Friendly</div>
            </div>
          </div>
        )}
      </div>

      {/* Narrative & Summary */}
      {summary && (
        <div className="text-base sm:text-lg font-medium text-charcoal-stone/90 leading-relaxed border-l-4 border-forest-emerald pl-4 py-1">
          {summary}
        </div>
      )}

      {description && (
        <div className="prose max-w-none text-charcoal-stone/80 text-sm sm:text-base leading-relaxed space-y-4">
          {description.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Dynamic Fields Display (Any custom fields not in top summary) */}
      {templateFields.length > 0 && (
        <div className="pt-6 border-t border-charcoal-stone/10 space-y-4">
          <h3 className="text-base font-bold text-charcoal-stone">Attributes & Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templateFields
              .filter(
                (f) =>
                  !['title', 'summary', 'description', 'heroImage', 'gallery', 'tags', 'location', 'district', 'bestSeason', 'entryFee', 'isAccessible'].includes(
                    f.key,
                  ) && data[f.key] !== undefined,
              )
              .map((field) => (
                <div
                  key={field.key}
                  className="p-3.5 rounded-xl border border-charcoal-stone/10 bg-white"
                >
                  <span className="text-xs font-medium text-charcoal-stone/50 block">
                    {field.label}
                  </span>
                  <span className="text-sm font-semibold text-charcoal-stone mt-0.5 block">
                    {typeof data[field.key] === 'boolean'
                      ? data[field.key]
                        ? 'Yes'
                        : 'No'
                      : String(data[field.key])}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {gallery.length > 0 && (
        <div className="pt-6 border-t border-charcoal-stone/10 space-y-4">
          <h3 className="text-base font-bold text-charcoal-stone">Photo Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gallery.map((img, i) => (
              <div
                key={img + i}
                onClick={() => setSelectedGalleryImage(img)}
                className="relative rounded-2xl overflow-hidden aspect-video cursor-pointer group border border-charcoal-stone/15 bg-sand-beige/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="pt-4 flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-charcoal-stone/50 mr-1" />
          {tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full bg-sand-beige/40 text-charcoal-stone text-xs font-medium"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Share & Actions Footer */}
      <div className="pt-6 border-t border-charcoal-stone/10 flex items-center justify-between">
        <span className="text-xs text-charcoal-stone/50">
          Template: {entry.template?.name || 'Generic Entry'} &bull; Updated{' '}
          {new Date(entry.updatedAt).toLocaleDateString()}
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleShare}
          className="flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share Experience
        </Button>
      </div>

      {/* Gallery Modal */}
      {selectedGalleryImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedGalleryImage}
              alt="Enlarged"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Moderator Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-charcoal-stone">
              {reviewAction === 'PUBLISHED' ? 'Approve & Publish Entry' : 'Reject Entry'}
            </h3>
            <p className="text-xs text-charcoal-stone/60">
              Provide feedback or review notes for the creator.
            </p>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="e.g. Verified coordinates and tribal cultural authenticity..."
              className="w-full p-3 rounded-xl border border-charcoal-stone/20 text-xs focus:outline-none focus:ring-2 focus:ring-forest-emerald/40"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={reviewAction === 'PUBLISHED' ? 'primary' : 'danger'}
                isLoading={isLoading}
                onClick={handleConfirmReview}
              >
                Confirm {reviewAction === 'PUBLISHED' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
