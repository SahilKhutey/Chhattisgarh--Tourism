"use client";

import React, { useState } from "react";
import { useAuthStore } from "../../store/auth-store";
import { getApiBase } from "../../app/data/api-config";
import { Video, X, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface CreateCommunityVideoProps {
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Waterfalls",
  "Heritage",
  "Nature",
  "Culture",
  "Food Trails",
  "Adventure",
  "Wildlife",
  "Spiritual",
];

const DISTRICTS = [
  "Bastar",
  "Dantewada",
  "Kanker",
  "Kondagaon",
  "Narayanpur",
  "Bijapur",
  "Sukma",
  "Raipur",
  "Bilaspur",
  "Surguja",
  "Durg",
  "Rajnandgaon",
  "Korba",
  "Janjgir-Champa",
  "Raigarh",
  "Kabirdham",
  "Mahasamund",
  "Dhamtari",
  "Gariaband",
  "Balod",
  "Bemetara",
  "Baloda Bazar",
  "Mungeli",
  "Surajpur",
  "Balrampur",
  "Koriya",
  "Jashpur",
  "Gaurela-Pendra-Marwahi",
  "Khairagarh-Chhuikhadan-Gandai",
  "Mohla-Manpur-Ambagarh Chowki",
  "Sarangarh-Bilaigarh",
  "Sakti",
  "Manendragarh-Chirmiri-Bharatpur",
];

export default function CreateCommunityVideo({ onSuccess }: CreateCommunityVideoProps) {
  const { user, token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    district: DISTRICTS[0],
    category: CATEGORIES[0],
    language: "en",
    videoUrl: "",
    thumbnailUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || !user) {
      setError("Please log in to submit a video.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${getApiBase()}/community/videos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
        onSuccess?.();
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setForm({
            title: "",
            location: "",
            district: DISTRICTS[0],
            category: CATEGORIES[0],
            language: "en",
            videoUrl: "",
            thumbnailUrl: "",
          });
        }, 2000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Failed to submit video.");
      }
    } catch {
      setError("Network error submitting video.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-forest-emerald hover:bg-forest-emerald/90 text-white font-bold py-2.5 px-6 rounded-full transition-all shadow-md hover:shadow-lg text-sm"
      >
        <Video className="w-4 h-4" />
        <span>Submit Creator Story</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-charcoal-stone/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-stone/10">
              <div className="flex items-center gap-2 text-forest-emerald font-bold">
                <UploadCloud className="w-5 h-5" />
                <h3 className="text-lg text-[#0A2A3B]">Submit Creator Video</h3>
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
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-forest-emerald mx-auto" />
                <h4 className="text-xl font-bold text-[#0A2A3B]">Submission Received!</h4>
                <p className="text-sm text-charcoal-stone/80 max-w-sm mx-auto">
                  Your video has been placed in the moderation queue (status: PENDING). Once reviewed by the CG Tourism team, it will appear on the live community feed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hidden Caves of Kanger Valley"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                      District *
                    </label>
                    <select
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                      Location / Spot *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kotumsar Cave"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                      Language
                    </label>
                    <select
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="cg">Chhattisgarhi</option>
                      <option value="halbi">Halbi</option>
                      <option value="gondi">Gondi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                    Video Stream URL (MP4 / HLS) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://storage.cgtourism.gov.in/videos/story.mp4"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-stone/70 mb-1">
                    Thumbnail Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://storage.cgtourism.gov.in/thumbnails/cover.jpg"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-sand-beige/40 border border-charcoal-stone/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-emerald"
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
                    className="flex-1 px-4 py-2.5 rounded-full bg-forest-emerald hover:bg-forest-emerald/90 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-75 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit for Review</span>
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
