"use client";

import { useEffect, useState, useCallback } from "react";
import { Compass, MapPin, Navigation, Search, Filter, AlertCircle } from "lucide-react";
import { TourismMap } from "@/components/map/MapContainer";
import { getNearbyPlaces, getDivisions, getDistricts, getRoute } from "@/lib/geo/geo-api";
import { searchContent } from "@/lib/discovery/api";
import type { GeoDistrict, GeoDivision, MapPlace, RouteResult } from "@/lib/geo/geo-types";

export default function MapPage() {
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [divisions, setDivisions] = useState<GeoDivision[]>([]);
  const [districts, setDistricts] = useState<GeoDistrict[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial statewide destinations, administrative hierarchy, and generic published entries
  useEffect(() => {
    Promise.all([
      getNearbyPlaces(21.2514, 81.6296, 250_000, 200).catch(() => []),
      getDivisions().catch(() => []),
      getDistricts().catch(() => []),
      searchContent({ limit: 100 }).catch(() => ({ items: [] })),
    ])
      .then(([placesData, divisionsData, districtsData, discoveryData]) => {
        const discoveryPlaces: MapPlace[] = ((discoveryData as any)?.items || [])
          .filter((item: any) => typeof item.lat === 'number' && typeof item.lng === 'number')
          .map((item: any) => ({
            id: item.id,
            name: item.title,
            slug: item.slug,
            category: item.templateName,
            lat: item.lat,
            lng: item.lng,
            district: item.district || '',
            division: item.division || '',
            rating: 4.8,
            status: 'PUBLISHED',
          }));

        // Deduplicate by ID
        const combined = [...(placesData || [])];
        discoveryPlaces.forEach((dp) => {
          if (!combined.some((p) => p.id === dp.id)) {
            combined.push(dp);
          }
        });

        setPlaces(combined);
        setDivisions(divisionsData);
        setDistricts(districtsData);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load map data");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Geolocation trigger
  const handleLocateMe = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setIsLoading(true);
          getNearbyPlaces(lat, lng, 100_000, 100)
            .then(setPlaces)
            .catch(() => {})
            .finally(() => setIsLoading(false));
        },
        (err) => {
          console.warn("Geolocation denied or unavailable:", err.message);
        },
      );
    }
  }, []);

  // Routing from user location (or state capital Raipur) to selected place
  const handleCalculateRoute = useCallback(
    async (place: MapPlace) => {
      const originLat = userCoords?.lat ?? 21.2514;
      const originLng = userCoords?.lng ?? 81.6296;

      try {
        const routeData = await getRoute(originLat, originLng, place.latitude, place.longitude);
        setActiveRoute(routeData);
      } catch (err) {
        console.warn("Routing error:", err);
      }
    },
    [userCoords],
  );

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.district && p.district.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDistrict =
      selectedDistrict === "all" ||
      (p.district && p.district.toLowerCase() === selectedDistrict.toLowerCase());

    return matchesSearch && matchesDistrict;
  });

  return (
    <main className="min-h-screen bg-sand-beige flex flex-col">
      {/* Top Header */}
      <section className="bg-forest-emerald text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-3">
              <Compass className="w-4 h-4 text-tribal-terracotta" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase">
                Geospatial & Administrative Explorer
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Chhattisgarh Interactive Regional Map
            </h1>
            <p className="mt-2 text-sand-beige/80 text-sm max-w-xl">
              Official 5 Revenue Divisions & 33 Districts geospatial platform with verified PostGIS proximity search and road routing.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLocateMe}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-forest-emerald rounded-xl text-sm font-bold shadow-md hover:bg-sand-beige transition-all"
            >
              <Navigation className="w-4 h-4 text-tribal-terracotta" />
              Find Near Me
            </button>
          </div>
        </div>
      </section>

      {/* Main Map Explorer Body */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 pb-12 flex-1 flex flex-col">
        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-charcoal-stone/10 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-stone/40" />
              <input
                type="text"
                placeholder="Search destinations, corridors, or districts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-sand-beige/30 rounded-xl border border-charcoal-stone/10 text-sm focus:outline-none focus:border-forest-emerald"
              />
            </div>

            {/* Division Filter */}
            {divisions.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
                <span className="text-xs font-bold text-charcoal-stone/60 uppercase">Division:</span>
                <select
                  value={selectedDivision}
                  onChange={(e) => {
                    setSelectedDivision(e.target.value);
                    setSelectedDistrict("all");
                  }}
                  className="px-3 py-2 bg-sand-beige/30 rounded-xl border border-charcoal-stone/10 text-xs font-semibold text-charcoal-stone"
                >
                  <option value="all">All Divisions (5)</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.slug}>
                      {d.name} ({d.nameHi ?? ""})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* District Filter */}
            {districts.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
                <span className="text-xs font-bold text-charcoal-stone/60 uppercase">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3 py-2 bg-sand-beige/30 rounded-xl border border-charcoal-stone/10 text-xs font-semibold text-charcoal-stone"
                >
                  <option value="all">All Districts ({districts.length})</option>
                  {districts
                    .filter((d) => selectedDivision === "all" || d.divisionId === selectedDivision || d.slug.includes(selectedDivision))
                    .map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h3 className="font-bold text-red-900">Map Service Unavailable</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        ) : (
          <div className="relative flex-1">
            <TourismMap
              places={filteredPlaces}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={(place) => {
                setSelectedPlaceId(place.id);
                handleCalculateRoute(place);
              }}
              route={activeRoute}
              height={680}
            />

            {/* Live Count HUD */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-charcoal-stone/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-xl border border-white/20">
              Showing {filteredPlaces.length} Destinations
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
