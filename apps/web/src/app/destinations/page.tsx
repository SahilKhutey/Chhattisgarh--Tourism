import Link from "next/link";
import { Compass } from "lucide-react";
import { getPlaces } from "@/data/api/places";
import { PlaceCard } from "@/components/tourism/PlaceCard";
import { EmptyState } from "@/components/states/EmptyState";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations | CG Tourism",
  description: "Browse verified tourist destinations across Chhattisgarh.",
};

export default async function DestinationsPage() {
  const response = await getPlaces({ verified: true, limit: 48 });

  return (
    <main className="min-h-screen bg-sand-beige">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-emerald/10 mb-4">
            <Compass className="w-4 h-4 text-forest-emerald" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-forest-emerald">CG Tourism OS</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-charcoal-stone sm:text-5xl">
            Verified Destinations
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-charcoal-stone/60">
            Discover authentic, verified destinations and experiences across Chhattisgarh.
          </p>
        </header>

        {response.data.length === 0 ? (
          <EmptyState
            title="No destinations found"
            description="There are currently no verified destinations available. Check back soon."
            icon={<Compass className="h-6 w-6" />}
          />
        ) : (
          <>
            <p className="text-sm text-charcoal-stone/50 mb-6">{response.total} destinations available</p>
            <div
              aria-label="Tourism destinations"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {response.data.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
