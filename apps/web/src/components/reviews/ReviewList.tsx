"use client";

import React, { useState, useEffect } from "react";
import Image from "@/components/ui/NativeImage";
import { getApiBase } from "@/app/data/api-config";
import { Star, MessageSquareQuote, ShieldCheck } from "lucide-react";

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  lang: string;
  helpful: number;
  createdAt: string;
  reviewer: {
    fullName: string;
    avatar?: string | null;
  };
}

export interface ReviewFeedSummary {
  totalReviews: number;
  averageRating: number;
  distribution: Record<number, number>;
}

export interface ReviewListProps {
  placeId: string;
  placeName: string;
}

export function ReviewList({ placeId, placeName }: ReviewListProps) {
  const [summary, setSummary] = useState<ReviewFeedSummary>({
    totalReviews: 0,
    averageRating: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`${getApiBase()}/reviews/place/${placeId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          if (data.summary) setSummary(data.summary);
          if (data.reviews) setReviews(data.reviews);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [placeId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-charcoal-stone/60">
        Loading verified traveller reviews...
      </div>
    );
  }

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-sans font-bold text-forest-emerald flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-tribal-terracotta" />
          Traveller Reviews & Feedback
        </h3>
        <span className="text-xs font-semibold text-charcoal-stone/70">
          {summary.totalReviews} Verified Review{summary.totalReviews !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Aggregate Rating Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-sand-beige/50 border border-charcoal-stone/10 items-center">
        <div className="text-center md:border-r border-charcoal-stone/15 md:pr-6">
          <div className="text-4xl font-extrabold text-charcoal-stone">
            {summary.averageRating > 0 ? summary.averageRating.toFixed(2) : "New"}
          </div>
          <div className="flex justify-center gap-1 my-2 text-tribal-terracotta">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(summary.averageRating)
                    ? "fill-tribal-terracotta text-tribal-terracotta"
                    : "text-charcoal-stone/30"
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-charcoal-stone/60">
            Based on {summary.totalReviews} verified visit{summary.totalReviews !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="col-span-2 space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((ratingNum) => {
            const count = summary.distribution[ratingNum] || 0;
            const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
            return (
              <div key={ratingNum} className="flex items-center gap-3">
                <span className="w-6 text-right font-bold text-charcoal-stone">{ratingNum}★</span>
                <div className="flex-1 h-2 rounded-full bg-charcoal-stone/10 overflow-hidden">
                  <div
                    className="h-full bg-forest-emerald rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-charcoal-stone/60">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Feed */}
      {reviews.length === 0 ? (
        <div className="py-8 text-center rounded-2xl border border-dashed border-charcoal-stone/20 p-6 text-charcoal-stone/60 text-sm">
          No traveller reviews recorded yet for {placeName}. Completed visit reservations will unlock verified review submissions.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-charcoal-stone/10 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rev.reviewer.avatar ? (
                    <Image
                      src={rev.reviewer.avatar}
                      alt={rev.reviewer.fullName}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-forest-emerald/20 text-forest-emerald font-bold flex items-center justify-center text-xs">
                      {rev.reviewer.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-stone leading-none">
                      {rev.reviewer.fullName}
                    </h4>
                    <span className="text-[10px] text-charcoal-stone/50 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-tribal-terracotta">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? "fill-tribal-terracotta text-tribal-terracotta"
                            : "text-charcoal-stone/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-forest-emerald bg-forest-emerald/10 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>

              <p className="text-sm text-charcoal-stone/90 leading-relaxed pt-1">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ReviewList;
