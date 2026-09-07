import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Shield, Calendar, Clock } from "lucide-react";
import { getPlace } from "@/data/api/places";
import { ApiError } from "@/data/api/client";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const place = await getPlace(slug);
    return {
      title: `${place.name} | CG Tourism`,
      description: place.description ?? `Discover ${place.name} — a verified destination in Chhattisgarh.`,
    };
  } catch {
    return { title: "Destination | CG Tourism" };
  }
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;

  let place;
  try {
    place = await getPlace(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const districtName =
    typeof place.district === "object"
      ? place.district?.name ?? "Chhattisgarh"
      : (place.district as string) ?? "Chhattisgarh";

  const imageUrl = place.imageUrl ?? place.heroImage ?? null;

  return (
    <main className="min-h-screen bg-sand-beige">
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest-emerald hover:text-tribal-terracotta transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explorer
          </Link>
        </nav>

        {/* Hero Image */}
        {imageUrl && (
          <div className="relative overflow-hidden rounded-3xl aspect-[21/9] mb-10 shadow-xl">
            <img
              src={imageUrl}
              alt={place.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            {place.verified && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-forest-emerald px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                <Shield className="h-3.5 w-3.5" />
                Verified Destination
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="max-w-4xl">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {place.category && (
              <span className="rounded-full bg-forest-emerald/10 px-3 py-1 text-xs font-semibold text-forest-emerald capitalize">
                {place.category.name}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-charcoal-stone/60">
              <MapPin className="h-4 w-4" />
              {districtName}, Chhattisgarh
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-charcoal-stone sm:text-5xl">
            {place.name}
          </h1>

          {place.description && (
            <p className="mt-6 text-lg leading-8 text-charcoal-stone/70">
              {place.description}
            </p>
          )}

          {/* Stats grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {place.rating != null && (
              <div className="rounded-2xl border border-charcoal-stone/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-mono text-charcoal-stone/50 uppercase tracking-wider">Rating</p>
                <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-charcoal-stone">
                  <Star className="h-5 w-5 fill-tribal-terracotta text-tribal-terracotta" />
                  {Number(place.rating).toFixed(1)}
                </p>
              </div>
            )}
            {place.durationMinutes != null && (
              <div className="rounded-2xl border border-charcoal-stone/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-mono text-charcoal-stone/50 uppercase tracking-wider">Suggested Duration</p>
                <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-charcoal-stone">
                  <Clock className="h-5 w-5 text-forest-emerald" />
                  {place.durationMinutes} min
                </p>
              </div>
            )}
            {place.bestSeason && (
              <div className="rounded-2xl border border-charcoal-stone/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-mono text-charcoal-stone/50 uppercase tracking-wider">Best Season</p>
                <p className="mt-2 flex items-center gap-1.5 text-base font-bold text-charcoal-stone">
                  <Calendar className="h-5 w-5 text-tribal-terracotta" />
                  {place.bestSeason}
                </p>
              </div>
            )}
          </div>

          {/* Story / History */}
          {place.history && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-charcoal-stone mb-4">The Story</h2>
              <p className="text-charcoal-stone/70 leading-8">{place.history}</p>
            </section>
          )}

          {/* Highlights */}
          {place.highlights && place.highlights.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-charcoal-stone mb-4">Highlights</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {place.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-charcoal-stone/80 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-tribal-terracotta" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Practical info */}
          {(place.safetyInfo || place.rules) && (
            <section className="mt-10 rounded-2xl border border-forest-emerald/15 bg-forest-emerald/5 p-6">
              <h2 className="text-lg font-bold text-charcoal-stone mb-3">Visitor Information</h2>
              {place.safetyInfo && (
                <p className="text-sm text-charcoal-stone/70 mb-2"><strong>Safety:</strong> {place.safetyInfo}</p>
              )}
              {place.rules && (
                <p className="text-sm text-charcoal-stone/70"><strong>Rules:</strong> {place.rules}</p>
              )}
            </section>
          )}

          {/* Media gallery */}
          {place.media && place.media.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-charcoal-stone mb-4">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {place.media.slice(0, 6).map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-2xl aspect-square bg-charcoal-stone/5">
                    <img
                      src={m.url}
                      alt={place.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Coordinates */}
          <div className="mt-10 rounded-2xl border border-charcoal-stone/10 bg-white p-5 shadow-sm inline-block">
            <p className="text-xs font-mono text-charcoal-stone/50 uppercase tracking-wider mb-1">Coordinates</p>
            <p className="text-sm font-medium text-charcoal-stone">
              {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
