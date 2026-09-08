"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ExperiencesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-sand-beige text-charcoal-stone p-6 text-center">
      <AlertCircle className="w-16 h-16 text-crimson-blaze" />
      <h2 className="text-2xl font-sans font-bold">Could not load marketplace</h2>
      <p className="text-charcoal-stone/70 max-w-md">{error.message || "An unexpected error occurred."}</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-emerald text-sand-beige font-semibold hover:bg-forest-emerald/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/explore"
          className="inline-flex items-center px-5 py-2.5 rounded-xl border border-charcoal-stone/20 font-semibold hover:bg-charcoal-stone/5 transition-colors"
        >
          Explore Destinations
        </Link>
      </div>
    </div>
  );
}
