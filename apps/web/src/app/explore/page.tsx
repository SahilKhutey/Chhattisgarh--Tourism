"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Filter, Layers, Droplets, Trees, Landmark, Users,
  Eye, MapPin, Star, Leaf, ShieldCheck, Palette, ChevronRight, ChevronLeft,
  AlertCircle, Compass, X, SlidersHorizontal,
} from "lucide-react";
import { getPlaces } from "@/data/api/places";
import type { Place } from "@/data/api/types";
import type { MapLayer } from "../../components/ChhattisgardhMap";

const ChhattisgardhMap = dynamic(
  () => import("../../components/ChhattisgardhMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sand-beige to-forest-emerald/5 rounded-2xl gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-forest-emerald/20 border-t-forest-emerald animate-spin" />
        <p className="text-sm font-mono text-forest-emerald/60 font-bold">Loading Chhattisgarh Map…</p>
      </div>
    ),
  }
);

const CATEGORIES = [
  { id: "all",        label: "All Destinations",  icon: Compass,  color: "text-charcoal-stone" },
  { id: "waterfalls", label: "Waterfalls",         icon: Droplets, color: "text-river-blue" },
  { id: "forests",    label: "Forests & Wildlife", icon: Trees,    color: "text-forest-emerald" },
  { id: "temples",    label: "Temples & Heritage", icon: Landmark, color: "text-tribal-terracotta" },
  { id: "villages",   label: "Tribal Villages",   icon: Users,    color: "text-warm-orange" },
];

const LAYERS: { id: MapLayer; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: "satellite", label: "Satellite View",    desc: "ESRI high-res Earth imagery",          icon: Compass,     color: "text-forest-emerald" },
  { id: "eco",       label: "Eco Zones",         desc: "Biodiversity hotspots & protected areas", icon: Leaf,     color: "text-green-600" },
  { id: "cultural",  label: "Cultural Heritage", desc: "Ancient temples & tribal corridors",   icon: Palette,     color: "text-purple-600" },
  { id: "terrain",   label: "Terrain Elevation", desc: "Topographic hills and valleys",        icon: ShieldCheck, color: "text-orange-600" },
];

const DISTRICTS = ["All", "Bastar", "Raipur", "Bilaspur", "Kawardha", "Surguja", "Raigarh", "Durg"];

// Convert new Place type to shape expected by ChhattisgardhMap (Destination)
function toDestination(p: Place) {
  const lat = p.latitude;
  const lng = p.longitude;
  const mapX = ((lng - 80.2) / (84.4 - 80.2)) * 100;
  const mapY = 100 - ((lat - 17.8) / (24.1 - 17.8)) * 100;
  const districtName =
    typeof p.district === "object" ? p.district?.name ?? "" : String(p.district ?? "");

  return {
    id: p.slug,
    name: p.name,
    category: p.category?.slug ?? "waterfalls",
    district: districtName,
    tagline: p.description ?? "",
    coordinates: { lat, lng, mapX, mapY },
    heroImage: p.imageUrl ?? p.heroImage ?? "",
    storyTitle: `The Story of ${p.name}`,
    story: p.history ?? "",
    timings: "6:00 AM - 6:00 PM",
    routes: "Well connected by road.",
    bestTime: p.bestSeason ?? "Year round",
    seasonalAdvice: "Check local weather before visiting.",
    safety: p.safetyInfo ?? "Standard safety precautions apply.",
    nearby: [] as string[],
    localInsights: "A truly magnificent location.",
    ecoGuidance: p.rules ?? "Leave no trace.",
    biodiversityScore: 88,
    crowdCapacity: 500,
    rating: p.rating ?? 4.8,
    localFood: "Local tribal thali available nearby.",
    photographySpots: "Best during sunrise.",
    media: (p.media ?? []) as { id: string; url: string; type: string }[],
    highlights: p.highlights ?? [],
    experienceTypes: p.experienceTypes ?? [],
    platformFeatures: p.platformFeatures ?? [],
    verificationLevel: p.verificationLevel ?? "UNVERIFIED",
  };
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLayer, setActiveLayer] = useState<MapLayer>("satellite");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [creatorSpots, setCreatorSpots] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    getPlaces({ verified: true, limit: 100 })
      .then((res) => {
        setPlaces(res.data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load destinations"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem("cg_approved_places");
        if (raw) {
          const parsed = JSON.parse(raw);
          const mapped = parsed.map((p: { name?: string; mapY: number; mapX: number }) => ({
            name: p.name || "Creator Spot",
            lat: 24.05 - (p.mapY / 100) * (24.05 - 17.78),
            lng: 80.25 + (p.mapX / 100) * (84.40 - 80.25),
          })).filter((s: { lat: number }) => !isNaN(s.lat));
          setCreatorSpots(mapped);
        }
      } catch (e) {
        console.warn("Failed to parse creator spots", e);
      }
    }, 0);
  }, []);

  const destinations = places.map(toDestination);

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || dest.category === activeCategory;
    const matchesDistrict = selectedDistrict === "All" || dest.district === selectedDistrict;
    return matchesSearch && matchesCategory && matchesDistrict;
  });

  const handleSelectDestination = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-sand-beige relative overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="w-full bg-forest-emerald text-sand-beige pt-12 pb-24 relative overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
              <Compass className="w-4 h-4 text-tribal-terracotta" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-white">Interactive State Map</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold text-white tracking-tight mb-3">
              Explore Chhattisgarh
            </h1>
            <p className="text-sand-beige/80 max-w-xl text-sm leading-relaxed">
              Discover verified eco-corridors, ancient tribal heritage sites, and breathtaking natural reserves.
            </p>
          </div>
          <div className="w-full lg:w-96 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-forest-emerald/50" />
            </div>
            <input
              type="text"
              placeholder="Search destinations, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-white text-charcoal-stone rounded-2xl shadow-lg border-2 border-transparent focus:outline-none focus:border-tribal-terracotta transition-all placeholder:text-charcoal-stone/40 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-4 flex items-center">
                <X className="h-5 w-5 text-charcoal-stone/40 hover:text-tribal-terracotta transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 flex-1 pb-12 flex flex-col">
        <div className="bg-white rounded-3xl shadow-xl border border-forest-emerald/10 overflow-hidden flex-1 flex flex-col h-[85vh]">

          {/* Map Area */}
          <div className="flex-1 relative bg-charcoal-stone flex flex-col h-full min-h-[300px]">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white rounded-xl shadow-lg border border-charcoal-stone/10 flex items-center justify-center text-charcoal-stone hover:text-tribal-terracotta transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
            </button>

            {/* Layer Controls */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-forest-emerald/10 p-2 w-[220px]">
              <div className="px-2 pb-2 mb-2 border-b border-forest-emerald/10 flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest-emerald" />
                <span className="text-xs font-bold text-charcoal-stone uppercase tracking-wider">Map Layers</span>
              </div>
              <div className="flex flex-col gap-1">
                {LAYERS.map((layer) => {
                  const Icon = layer.icon;
                  const isActive = activeLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                      className={`flex items-start gap-3 p-2 rounded-xl transition-all text-left ${isActive ? "bg-forest-emerald/10 border border-forest-emerald/20" : "hover:bg-sand-beige border border-transparent"}`}
                    >
                      <div className={`mt-0.5 ${isActive ? "text-forest-emerald" : "text-charcoal-stone/40"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isActive ? "text-forest-emerald" : "text-charcoal-stone"}`}>{layer.label}</span>
                        <span className="text-[9px] text-charcoal-stone/60 leading-tight mt-0.5">{layer.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error overlay */}
            {error && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-charcoal-stone/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 text-center max-w-sm shadow-2xl">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <h3 className="font-bold text-charcoal-stone mb-1">Failed to load destinations</h3>
                  <p className="text-xs text-charcoal-stone/60 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      getPlaces({ verified: true, limit: 100 })
                        .then((res) => setPlaces(res.data))
                        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
                        .finally(() => setIsLoading(false));
                    }}
                    className="px-4 py-2 bg-forest-emerald text-white rounded-xl text-sm font-bold hover:bg-tribal-terracotta transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div className="w-full h-full relative z-0">
              <ChhattisgardhMap
                destinations={filteredDestinations}
                creatorSpots={creatorSpots}
                activeLayer={activeLayer}
                selectedId={selectedId}
                onSelectDestination={handleSelectDestination}
              />
            </div>

            {/* Stats HUD */}
            <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none flex justify-center">
              <div className="bg-charcoal-stone/90 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-2xl pointer-events-auto">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Active Pins</span>
                  <span className="text-lg font-bold text-white">{isLoading ? "…" : filteredDestinations.length}</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Creator Spots</span>
                  <span className="text-lg font-bold text-tribal-terracotta">{creatorSpots.length}</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Avg Rating</span>
                  <span className="text-lg font-bold text-green-400 flex items-center gap-1">
                    ★{filteredDestinations.length > 0
                      ? (filteredDestinations.reduce((a, d) => a + (d.rating || 0), 0) / filteredDestinations.length).toFixed(1)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div className={`flex flex-col bg-sand-beige/30 border-t border-forest-emerald/10 transition-all duration-300 ease-in-out shrink-0 ${sidebarOpen ? "h-[360px]" : "h-0 overflow-hidden"}`}>
            <div className="p-4 border-b border-forest-emerald/10 bg-white/50 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 ${isActive ? "bg-forest-emerald text-white shadow-md" : "bg-white text-charcoal-stone border border-forest-emerald/10 hover:border-forest-emerald/30 hover:bg-forest-emerald/5"}`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-tribal-terracotta" : cat.color}`} />
                      <span className="text-sm font-bold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-2 overflow-x-auto scrollbar-hide pb-1">
                <Filter className="w-3.5 h-3.5 text-forest-emerald/60 shrink-0 mr-1" />
                {DISTRICTS.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setSelectedDistrict(dist)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${selectedDistrict === dist ? "bg-tribal-terracotta text-white" : "bg-white text-charcoal-stone/70 border border-charcoal-stone/10 hover:bg-sand-beige"}`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 relative flex items-center">
              {filteredDestinations.length > 0 && (
                <>
                  <button onClick={() => scrollCarousel("left")} className="absolute left-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-charcoal-stone hover:text-tribal-terracotta hover:scale-105 transition-all border border-charcoal-stone/10">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={() => scrollCarousel("right")} className="absolute right-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-charcoal-stone hover:text-tribal-terracotta hover:scale-105 transition-all border border-charcoal-stone/10">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              <div ref={carouselRef} className="w-full h-full overflow-x-auto overflow-y-hidden px-16 py-4 flex gap-6 relative scroll-smooth items-center scrollbar-hide">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[280px] h-[230px] bg-white/60 animate-pulse rounded-2xl" />
                  ))
                ) : filteredDestinations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full h-full text-center px-4 shrink-0">
                    <AlertCircle className="w-8 h-8 text-forest-emerald/40 mb-3" />
                    <h3 className="text-charcoal-stone font-bold">No destinations found</h3>
                    <p className="text-xs text-charcoal-stone/60 mt-1">Try adjusting your filters or search query.</p>
                    <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); setSelectedDistrict("All"); }} className="mt-4 text-xs font-bold text-tribal-terracotta hover:underline">
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  filteredDestinations.map((dest) => {
                    const isSelected = selectedId === dest.id;
                    return (
                      <div
                        key={dest.id}
                        onClick={() => handleSelectDestination(dest.id)}
                        className={`group flex flex-col shrink-0 w-[280px] bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? "border-tribal-terracotta shadow-lg shadow-tribal-terracotta/10 scale-105" : "border-forest-emerald/10 hover:border-forest-emerald/30 hover:shadow-md"}`}
                      >
                        <div
                          className="relative h-32 w-full overflow-hidden group/img"
                          onClick={(e) => { e.stopPropagation(); router.push(`/destinations/${dest.id}`); }}
                        >
                          <img
                            src={dest.heroImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG"}
                            referrerPolicy="no-referrer"
                            alt={dest.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-stone/80 to-transparent" />
                          <div className="absolute bottom-3 left-3 flex flex-col">
                            <span className="text-white font-bold text-sm drop-shadow-md">{dest.name}</span>
                            <span className="text-white/80 text-[10px] font-mono tracking-widest uppercase flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {dest.district || "Chhattisgarh"}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-charcoal-stone shadow-sm">
                            <Star className="w-3.5 h-3.5 text-tribal-terracotta fill-tribal-terracotta" />
                            {dest.rating}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="p-4 bg-sand-beige/20 border-t border-forest-emerald/10">
                            <p className="text-xs text-charcoal-stone/80 italic mb-3 leading-relaxed">&quot;{dest.tagline}&quot;</p>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-forest-emerald/5">
                                <Leaf className="w-4 h-4 text-green-600" />
                                <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-mono text-charcoal-stone/50 font-bold">Biodiversity</span>
                                  <span className="text-xs font-bold text-charcoal-stone">{dest.biodiversityScore}/100</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-forest-emerald/5">
                                <Users className="w-4 h-4 text-blue-600" />
                                <div className="flex flex-col">
                                  <span className="text-[9px] uppercase font-mono text-charcoal-stone/50 font-bold">Capacity</span>
                                  <span className="text-xs font-bold text-charcoal-stone">{dest.crowdCapacity} pax</span>
                                </div>
                              </div>
                            </div>
                            <Link href={`/destinations/${dest.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-forest-emerald hover:bg-tribal-terracotta text-white rounded-xl text-sm font-bold transition-colors">
                              <Eye className="w-4 h-4" /> View Full Details
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
