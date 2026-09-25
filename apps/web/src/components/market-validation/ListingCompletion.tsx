import React from "react";

export interface ListingData {
  id: string;
  provider_id: string;
  template_id?: string;
  status: string;
  information_score: number;
  media_score: number;
  location_score: number;
  service_score: number;
  contact_score: number;
  trust_score: number;
  listing_quality_score: number;
  published_at?: string;
}

export interface ListingCompletionProps {
  listing: ListingData;
  onPublish?: (listingId: string) => void;
}

export function ListingCompletion({ listing, onPublish }: ListingCompletionProps) {
  const scores = [
    { label: "Information", val: listing.information_score },
    { label: "Media & Photos", val: listing.media_score },
    { label: "Location & Coordinates", val: listing.location_score },
    { label: "Service Details", val: listing.service_score },
    { label: "Direct Contact", val: listing.contact_score },
    { label: "Trust & Verification", val: listing.trust_score },
  ];

  const canPublish =
    listing.status !== "PUBLISHED" &&
    listing.location_score > 0 &&
    listing.contact_score > 0 &&
    listing.listing_quality_score >= 40;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Listing Quality Analysis</div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">Listing Quality Score</h3>
          <p className="text-xs text-slate-500">Template: {listing.template_id || "STANDARD_V1"}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900">{listing.listing_quality_score}</div>
          <span
            className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              listing.status === "PUBLISHED"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}
          >
            {listing.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {scores.map((s) => (
          <div key={s.label} className="p-3 bg-slate-50 border border-slate-100 rounded">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">{s.label}</span>
              <span className="font-bold text-slate-900">{s.val} / 100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${s.val > 70 ? "bg-emerald-500" : s.val > 40 ? "bg-amber-500" : "bg-rose-500"}`}
                style={{ width: `${s.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {onPublish && listing.status !== "PUBLISHED" && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {canPublish
              ? "All critical criteria satisfied. Ready to publish."
              : "Location and Contact details (>0) are required to publish."}
          </span>
          <button
            onClick={() => onPublish(listing.id)}
            disabled={!canPublish}
            className={`px-4 py-2 text-xs font-bold rounded shadow-sm transition ${
              canPublish
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Publish Listing
          </button>
        </div>
      )}
    </div>
  );
}
