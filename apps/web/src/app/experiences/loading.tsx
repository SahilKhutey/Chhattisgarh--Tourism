"use client";

import { Loader2 } from "lucide-react";

export default function ExperiencesLoading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6">
      <Loader2 className="w-12 h-12 text-forest-emerald animate-spin" />
      <p className="text-lg font-sans font-semibold">Loading Verified Regional Experiences...</p>
    </div>
  );
}
