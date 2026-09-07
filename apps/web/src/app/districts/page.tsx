import Link from "next/link";
import { MapPin, Compass } from "lucide-react";
import { getDistricts } from "@/data/api/districts";
import { EmptyState } from "@/components/states/EmptyState";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Districts | CG Tourism",
  description: "Explore all 33 districts of Chhattisgarh and discover verified tourism destinations.",
};

export default async function DistrictsPage() {
  const response = await getDistricts();

  return (
    <main className="min-h-screen bg-sand-beige">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-emerald/10 mb-4">
            <MapPin className="w-4 h-4 text-forest-emerald" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-forest-emerald">Regional Guide</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-charcoal-stone sm:text-5xl">
            Districts of Chhattisgarh
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-charcoal-stone/60">
            Explore verified destinations across all districts of Chhattisgarh.
          </p>
        </header>

        {response.data.length === 0 ? (
          <EmptyState
            title="No districts found"
            description="District data is being loaded. Check back soon."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {response.data.map((district) => (
              <Link
                key={district.id}
                href={`/districts/${district.slug}`}
                className="group block rounded-2xl border border-charcoal-stone/10 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-charcoal-stone group-hover:text-forest-emerald transition-colors">
                    {district.name}
                  </h3>
                  {district.placeCount !== undefined && district.placeCount > 0 && (
                    <span className="shrink-0 rounded-full bg-forest-emerald/10 px-2 py-0.5 text-xs font-semibold text-forest-emerald">
                      {district.placeCount}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-charcoal-stone/60 line-clamp-2">
                  {district.description ?? `Explore destinations in ${district.name}, Chhattisgarh.`}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-tribal-terracotta group-hover:underline">
                  <Compass className="h-3.5 w-3.5" />
                  Explore district
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
