import Link from "next/link";
import { MapPin, Star, Shield } from "lucide-react";
import type { Place } from "@/data/api/types";
import { Card } from "@/components/ui/Card";

interface PlaceCardProps {
  place: Place;
  className?: string;
}

export function PlaceCard({ place, className = "" }: PlaceCardProps) {
  const imageUrl = place.imageUrl || place.heroImage || null;
  const districtName =
    typeof place.district === "object"
      ? place.district?.name
      : (place.district as string) || null;

  return (
    <Link
      href={`/destinations/${place.slug}`}
      className={`group block h-full ${className}`}
    >
      <Card className="h-full transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-stone/5">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={place.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center text-sm text-charcoal-stone/40"
              aria-label="Image unavailable"
            >
              Image unavailable
            </div>
          )}
          {place.verified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-forest-emerald px-2 py-1 text-[10px] font-bold text-white shadow-sm">
              <Shield className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-charcoal-stone group-hover:underline decoration-1 underline-offset-2">
              {place.name}
            </h3>
          </div>

          {districtName && (
            <p className="mt-1.5 flex items-center gap-1 text-sm text-charcoal-stone/60">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {districtName}
            </p>
          )}

          {place.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-charcoal-stone/70">
              {place.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between text-sm">
            {place.rating != null ? (
              <span className="flex items-center gap-1 font-semibold text-charcoal-stone">
                <Star className="h-4 w-4 fill-tribal-terracotta text-tribal-terracotta" />
                {Number(place.rating).toFixed(1)}
              </span>
            ) : (
              <span className="text-charcoal-stone/40">No rating yet</span>
            )}
            {place.durationMinutes ? (
              <span className="text-xs text-charcoal-stone/50">
                {place.durationMinutes} min
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
