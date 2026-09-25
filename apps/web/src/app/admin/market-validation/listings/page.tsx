"use client";

import React, { useEffect, useState } from "react";
import { ListingCompletion, ListingData } from "@/components/market-validation/ListingCompletion";

export default function ListingsAdminPage() {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/listings", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        setListings(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setListings([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handlePublish = (listingId: string) => {
    fetch(`/api/v1/market-validation/listings/${listingId}/publish`, {
      method: "POST",
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject(err));
        return res.json();
      })
      .then(() => fetchListings())
      .catch((err) => alert(err.detail || "Failed to publish listing"));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Listing Validation • MV3
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Listing Quality Experiments
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Test whether providers supply required media, coordinates, pricing, and contact details to achieve publishable listing scores.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          No listing experiments found. Create a listing experiment from a provider profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((l) => (
            <ListingCompletion key={l.id} listing={l} onPublish={handlePublish} />
          ))}
        </div>
      )}
    </div>
  );
}
