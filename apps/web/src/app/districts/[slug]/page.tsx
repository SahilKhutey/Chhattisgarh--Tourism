import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Compass, MapPin, ArrowLeft } from "lucide-react";
import { getDistrictPlaces, getDistrict } from "@/data/api/districts";
import { PlaceCard } from "@/components/tourism/PlaceCard";
import { EmptyState } from "@/components/states/EmptyState";
import type { Metadata as NextMetadata } from "next";

interface DistrictPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: DistrictPageProps): Promise<NextMetadata> {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${capitalized} District | CG Tourism`,
    description: `Discover hidden waterfalls, tribal heritage, temples, and untouched wilderness in ${capitalized} District, Chhattisgarh.`,
  };
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);

  const [district, places] = await Promise.all([
    getDistrict(slug),
    getDistrictPlaces(capitalized),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: places.map((place, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "TouristAttraction",
        name: place.name,
        description: place.description,
        image: place.imageUrl,
        geo: {
          "@type": "GeoCoordinates",
          latitude: place.latitude,
          longitude: place.longitude,
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-sand-beige text-charcoal-stone">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-forest-emerald hover:text-tribal-terracotta font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explorer
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Compass className="w-6 h-6 text-tribal-terracotta" />
            <span className="text-tribal-terracotta font-semibold tracking-wider uppercase text-xs">
              Chhattisgarh Territory Guide
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal-stone mb-4">
            {district.name} District
          </h1>
          <div className="flex items-center gap-2 text-charcoal-stone/60 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Chhattisgarh, India</span>
            <span className="mx-2">·</span>
            <span>{places.length} verified destination{places.length !== 1 ? "s" : ""}</span>
          </div>
          {district.description && (
            <p className="mt-4 max-w-2xl text-charcoal-stone/70 leading-7">
              {district.description}
            </p>
          )}
        </header>

        {/* Destinations grid */}
        {places.length === 0 ? (
          <EmptyState
            title="No destinations found"
            description={`No verified destinations are currently listed for ${district.name} District.`}
            icon={<Compass className="h-6 w-6" />}
          />
        ) : (
          <section aria-label={`Destinations in ${district.name}`}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
