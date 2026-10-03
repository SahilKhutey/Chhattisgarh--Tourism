"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  BookOpen,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ContentType,
  CulturalSensitivityLevel,
  CreateSocialContentPayload,
} from "../types";
import { createSocialContent } from "../api/social-api";
import { useAuthStore } from "../../../store/auth-store";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CHHATTISGARH_DISTRICTS = [
  { id: "bastar", name: "Bastar (Jagdalpur)" },
  { id: "dantewada", name: "Dantewada" },
  { id: "kondagaon", name: "Kondagaon" },
  { id: "sukma", name: "Sukma" },
  { id: "bijapur", name: "Bijapur" },
  { id: "narayanpur", name: "Narayanpur" },
  { id: "kanker", name: "Kanker" },
  { id: "surguja", name: "Surguja (Ambikapur)" },
  { id: "korea", name: "Korea" },
  { id: "jashpur", name: "Jashpur" },
  { id: "surajpur", name: "Surajpur" },
  { id: "balrampur", name: "Balrampur" },
  { id: "raipur", name: "Raipur" },
  { id: "bilaspur", name: "Bilaspur" },
  { id: "durg", name: "Durg" },
  { id: "mahasamund", name: "Mahasamund" },
  { id: "rajnandgaon", name: "Rajnandgaon" },
  { id: "korba", name: "Korba" },
  { id: "janjgir-champa", name: "Janjgir-Champa" },
  { id: "raigarh", name: "Raigarh" },
  { id: "kabirdham", name: "Kabirdham" },
  { id: "dhamtari", name: "Dhamtari" },
  { id: "gariaband", name: "Gariaband" },
];

export const CreateContentModal: React.FC<CreateContentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token, user } = useAuthStore();

  const [contentType, setContentType] = useState<ContentType>("REEL");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [districtId, setDistrictId] = useState("bastar");
  const [placeSlug, setPlaceSlug] = useState("");
  const [festivalName, setFestivalName] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sensitivityLevel, setSensitivityLevel] =
    useState<CulturalSensitivityLevel>("PUBLIC");
  const [hasSacredConsent, setHasSacredConsent] = useState(false);
  const [communityAttribution, setCommunityAttribution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for your story or reel");
      return;
    }

    if (!mediaUrl.trim()) {
      toast.error("Please provide a media URL (image or video)");
      return;
    }

    // Cultural Protection Gate verification
    if (sensitivityLevel === "SACRED_TRIBAL_RITUAL") {
      if (!hasSacredConsent) {
        toast.error(
          "Sacred Tribal Rituals require confirmation of clan elder / community consent."
        );
        return;
      }
      if (!communityAttribution.trim()) {
        toast.error("Please specify community / clan attribution.");
        return;
      }
    }

    setIsSubmitting(true);

    const payload: CreateSocialContentPayload = {
      content_type: contentType,
      title: title.trim(),
      caption: caption.trim() || undefined,
      district_id: districtId,
      place_slug: placeSlug.trim() || undefined,
      festival_name: festivalName.trim() || undefined,
      cultural_sensitivity_level: sensitivityLevel,
      has_sacred_consent: hasSacredConsent,
      community_attribution: communityAttribution.trim() || undefined,
      media_items: [
        {
          media_type: contentType === "REEL" || contentType === "VIDEO" ? "VIDEO" : "IMAGE",
          media_url: mediaUrl.trim(),
          aspect_ratio: contentType === "REEL" || contentType === "STORY" ? "9:16" : "16:9",
        },
      ],
    };

    const res = await createSocialContent(payload, token);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        "Content submitted successfully! It is now in the regional moderation queue.",
        { duration: 5000 }
      );
      onSuccess?.();
      onClose();
    } else {
      toast.error(res.error || "Failed to submit content");
    }
  };

  return (
    <div
      data-testid="create-content-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Create Tourism Story / Reel
            </h2>
            <p className="text-xs text-zinc-500">
              Contribute to Chhattisgarh's living discovery layer
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          {/* Content Type Selector */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Content Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: "REEL" as ContentType, label: "Reel (9:16)", icon: Video },
                { type: "STORY" as ContentType, label: "24h Story", icon: Sparkles },
                { type: "CULTURAL_STORY" as ContentType, label: "Oral Lore", icon: BookOpen },
                { type: "POST" as ContentType, label: "Photo Post", icon: ImageIcon },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border text-center transition-all ${
                    contentType === type
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dawn at Tirathgarh Falls or Gond Woodcarving Tradition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Caption / Folklore Narrative */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {contentType === "CULTURAL_STORY"
                ? "Folklore & Oral Narrative *"
                : "Caption / Travel Description"}
            </label>
            <textarea
              rows={3}
              placeholder="Share travel tips, historical significance, local customs, or traditional legends..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* District & Destination Link */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                District *
              </label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {CHHATTISGARH_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id} className="dark:bg-zinc-900">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Destination Tag (Slug)
              </label>
              <input
                type="text"
                placeholder="e.g. chitrakote-falls"
                value={placeSlug}
                onChange={(e) => setPlaceSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Media URL */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Media URL (CDN / Video / Photo) *
            </label>
            <input
              type="url"
              required
              placeholder="https://... (video MP4 or image JPG/PNG)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Cultural Sensitivity Gate */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Cultural Heritage Classification
            </label>
            <select
              value={sensitivityLevel}
              onChange={(e) =>
                setSensitivityLevel(e.target.value as CulturalSensitivityLevel)
              }
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="PUBLIC" className="dark:bg-zinc-900">
                Public Tourist Experience (Standard)
              </option>
              <option value="CULTURAL_HERITAGE" className="dark:bg-zinc-900">
                Indigenous Cultural Heritage & Craft
              </option>
              <option value="SACRED_TRIBAL_RITUAL" className="dark:bg-zinc-900">
                Sacred Tribal Ceremony / Sacred Grove
              </option>
            </select>
          </div>

          {/* Sacred Ceremony Guardrail Requirement Box */}
          {sensitivityLevel === "SACRED_TRIBAL_RITUAL" && (
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30 flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Tribal Heritage Protection Gate</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Under Chhattisgarh Tourism OS preservation bylaws, documentation of sacred tribal ceremonies requires explicit clan permission and proper community attribution.
              </p>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1 text-[11px]">
                  Community / Clan Attribution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clan Elders of Bastar / Dhokra Guild"
                  value={communityAttribution}
                  onChange={(e) => setCommunityAttribution(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSacredConsent}
                  onChange={(e) => setHasSacredConsent(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-[11px] text-purple-900 dark:text-purple-200 font-medium">
                  I confirm that I have informed permission from clan elders or guardians of this tradition to document this narrative.
                </span>
              </label>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit for Moderation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
