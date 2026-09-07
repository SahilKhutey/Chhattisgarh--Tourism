"use client";

import React, { FormEvent, useState } from "react";
import { getApiBase } from "@/app/data/api-config";
import { useAuthStore } from "@/store/auth-store";
import { Star, CheckCircle, Loader2 } from "lucide-react";

export interface ReviewFormProps {
  placeId: string;
  bookingId: string;
  token?: string;
  onSubmitted?: () => void;
}

export function ReviewForm({
  placeId,
  bookingId,
  token: explicitToken,
  onSubmitted,
}: ReviewFormProps) {
  const { token: authStoreToken } = useAuthStore();
  const token = explicitToken || authStoreToken;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submitReview(event: FormEvent) {
    event.preventDefault();

    if (!token) {
      setError("Please log in to submit your verified review.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiBase()}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          placeId,
          bookingId,
          rating,
          comment: comment.trim(),
          lang: "en",
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message ?? "Review submission failed"
        );
      }

      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-forest-emerald/30 bg-forest-emerald/5 p-6 text-center space-y-2">
        <CheckCircle className="w-10 h-10 text-forest-emerald mx-auto" />
        <h4 className="font-bold text-forest-emerald">Review Submitted</h4>
        <p className="text-sm text-charcoal-stone/80">
          Thank you. Your verified review has been submitted and added to the traveller rating summary.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submitReview} className="space-y-4 rounded-2xl border border-charcoal-stone/15 p-5 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-charcoal-stone">Review Your Visit</h3>
        <span className="text-xs text-forest-emerald font-bold bg-forest-emerald/10 px-2 py-0.5 rounded-full">
          Verified Visit
        </span>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-2">
          Rating
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 text-tribal-terracotta hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= rating ? "fill-tribal-terracotta text-tribal-terracotta" : "text-charcoal-stone/30"
                }`}
              />
            </button>
          ))}
          <span className="text-sm font-semibold text-charcoal-stone/70 ml-2">
            {rating === 5 && "★★★★★ Excellent"}
            {rating === 4 && "★★★★☆ Very Good"}
            {rating === 3 && "★★★☆☆ Good"}
            {rating === 2 && "★★☆☆☆ Needs Improvement"}
            {rating === 1 && "★☆☆☆☆ Poor"}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
          Your Experience (10-500 characters) *
        </label>
        <textarea
          required
          minLength={10}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about the views, paths, guides, or atmosphere to help other travellers..."
          className="min-h-28 w-full rounded-xl border border-charcoal-stone/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald"
        />
        <div className="text-right text-[10px] text-charcoal-stone/50 mt-0.5">
          {comment.length}/500
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-bold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-forest-emerald hover:bg-[#0A2A3B] text-white py-2.5 font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Review...</span>
          </>
        ) : (
          "Submit Verified Review"
        )}
      </button>
    </form>
  );
}

export default ReviewForm;
