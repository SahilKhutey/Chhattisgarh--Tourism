"use client";

import React, { useState } from "react";
import { useAuthStore } from "../../store/auth-store";
import { getApiBase } from "../../app/data/api-config";
import { Flag, X, AlertTriangle, Loader2 } from "lucide-react";

interface ReportContentButtonProps {
  targetType: "VIDEO" | "COMMENT" | "FOLKLORE" | "CREATOR";
  targetId: string;
  className?: string;
  variant?: "icon" | "text";
}

const REPORT_REASONS = [
  "Inappropriate or harmful content",
  "Misleading or false tourism information",
  "Spam, bot, or commercial advertisement",
  "Harassment or hate speech",
  "Copyright or intellectual property infringement",
  "Other policy violation",
];

export default function ReportContentButton({
  targetType,
  targetId,
  className = "",
  variant = "icon",
}: ReportContentButtonProps) {
  const { user, token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      alert("Please log in to submit a content report.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${getApiBase()}/community/reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setDetails("");
        }, 1500);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Failed to submit report.");
      }
    } catch {
      alert("Network error submitting report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          title="Report this content"
          aria-label="Report content"
          className={`p-1.5 rounded-full hover:bg-red-50 text-charcoal-stone/60 hover:text-red-600 transition-colors ${className}`}
        >
          <Flag className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={`inline-flex items-center gap-1.5 text-xs text-charcoal-stone/70 hover:text-red-600 transition-colors font-medium ${className}`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-charcoal-stone/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-stone/10">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg text-charcoal-stone">Report Content</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-charcoal-stone/50 hover:text-charcoal-stone rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-charcoal-stone">Report Received</h4>
                <p className="text-sm text-charcoal-stone/70">
                  Our moderation team will review this content against CG Tourism guidelines.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                    Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide additional context or timestamp..."
                    className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-full border border-charcoal-stone/20 text-sm font-bold text-charcoal-stone hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
