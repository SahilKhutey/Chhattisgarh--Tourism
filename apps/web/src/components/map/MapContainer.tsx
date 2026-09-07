"use client";

import dynamic from "next/dynamic";
import { Compass } from "lucide-react";

export const TourismMap = dynamic(
  () => import("./TourismMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full flex flex-col items-center justify-center bg-sand-beige/40 rounded-2xl border border-charcoal-stone/10 gap-3 animate-pulse"
        style={{ height: 650 }}
      >
        <div className="w-12 h-12 rounded-full border-4 border-forest-emerald/20 border-t-forest-emerald animate-spin" />
        <p className="text-sm font-mono font-bold text-forest-emerald">Loading Regional Geospatial Map…</p>
      </div>
    ),
  },
);
