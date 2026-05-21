"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Filter, Layers, Droplets, Trees, Landmark, Users,
  Eye, MapPin, Star, Leaf, ShieldCheck, Palette, ChevronRight,
  AlertCircle, Compass, Binoculars, X, SlidersHorizontal,
} from "lucide-react";
import { DESTINATIONS, type Destination } from "../data/destinations";
import type { MapLayer } from "../../components/ChhattisgardhMap";

// ── Lazy-load the Leaflet map component (SSR: false) ──────────────────────
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

// ── Category definitions ───────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",        label: "All Destinations",  icon: Compass,   color: "text-charcoal-stone" },
  { id: "waterfalls", label: "Waterfalls",         icon: Droplets,  color: "text-river-blue" },
  { id: "forests",    label: "Forests & Wildlife", icon: Trees,     color: "text-forest-emerald" },
  { id: "temples",    label: "Temples & Heritage", icon: Landmark,  color: "text-tribal-terracotta" },
  { id: "villages",   label: "Tribal Villages",   icon: Users,     color: "text-warm-orange" },
];

// ── Layer definitions ──────────────────────────────────────────────────────
const LAYERS: { id: MapLayer; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  {
    id: "satellite",
    label: "Satellite View",
    desc: "ESRI high-res Earth imagery",
    icon: Compass,
    color: "text-forest-emerald",
  },
  {
    id: "eco",
    label: "Eco Zones",
    desc: "Biodiversity hotspots & protected areas",
    icon: Leaf,
    color: "text-green-600",
  },
  {
    id: "cultural",
    label: "Cultural Heritage",
    desc: "Ancient temples & tribal corridors",
    icon: Palette,
    color: "text-purple-600",
  },
  {
    id: "terrain",
    label: "Terrain Elevation",
    desc: "Topographic hills and valleys",
    icon: ShieldCheck,
    color: "text-orange-600",
  },
];

// ── Sub-filters ────────────────────────────────────────────────────────────
const DISTRICTS = ["All", "Bastar", "Raipur", "Bilaspur", "Kawardha", "Surguja", "Raigarh", "Durg"];
const EXPERIENCES = ["Family-Friendly", "Eco-First", "Photography", "Offbeat"];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLayer, setActiveLayer] = useState<MapLayer>("satellite");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [creatorSpots, setCreatorSpots] = useState<{ name: string; lat: number; lng: number }[]>([]);

  // Load verified creator spots from local storage
  useEffect(() => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem("cg_approved_places");
        if (raw) {
          const places = JSON.parse(raw);
          const mapped = places.map((p: { name?: string; mapY: number; mapX: number }) => ({
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

  // ── Compute filtered results ─────────────────────────────────────────────
  const filteredDestinations = DESTINATIONS.filter((dest) => {
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

  return (
    <div className="w-full min-h-screen bg-sand-beige relative overflow-hidden flex flex-col">
      {/* ── Top Header Section ────────────────────────────────────────────── */}
      <div className="w-full bg-forest-emerald text-sand-beige pt-12 pb-24 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
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
              Discover verified eco-corridors, ancient tribal heritage sites, and breathtaking natural reserves through our interactive intelligence map.
            </p>
          </div>

          {/* Search Bar */}
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

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 flex-1 pb-12 flex flex-col">
        <div className="bg-white rounded-3xl shadow-xl border border-forest-emerald/10 overflow-hidden flex-1 flex flex-col lg:flex-row h-[800px]">
          
          {/* ── Left Sidebar (Destinations) ─────────────────────────────────── */}
          <div className={`flex flex-col bg-sand-beige/30 border-r border-forest-emerald/10 transition-all duration-300 ease-in-out shrink-0 ${sidebarOpen ? 'w-full lg:w-[420px]' : 'w-0 overflow-hidden lg:w-0'}`}>
            
            {/* Category Tabs */}
            <div className="p-4 border-b border-forest-emerald/10 bg-white/50 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 ${isActive ? 'bg-forest-emerald text-white shadow-md' : 'bg-white text-charcoal-stone border border-forest-emerald/10 hover:border-forest-emerald/30 hover:bg-forest-emerald/5'}`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-tribal-terracotta' : cat.color}`} />
                      <span className="text-sm font-bold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-filters (District) */}
              <div className="flex items-center gap-2 mt-2 overflow-x-auto scrollbar-hide pb-1">
                <Filter className="w-3.5 h-3.5 text-forest-emerald/60 shrink-0 mr-1" />
                {DISTRICTS.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setSelectedDistrict(dist)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${selectedDistrict === dist ? 'bg-tribal-terracotta text-white' : 'bg-white text-charcoal-stone/70 border border-charcoal-stone/10 hover:bg-sand-beige'}`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth">
              {filteredDestinations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-forest-emerald/5 flex items-center justify-center mb-3">
                    <AlertCircle className="w-8 h-8 text-forest-emerald/40" />
                  </div>
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
                      className={`group flex flex-col bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? 'border-tribal-terracotta shadow-lg shadow-tribal-terracotta/10 scale-[1.02]' : 'border-forest-emerald/10 hover:border-forest-emerald/30 hover:shadow-md'}`}
                    >
                      <div className="relative h-32 w-full overflow-hidden">
                        <Image
                          src={dest.heroImage || "/images/bastar/bastar-hero.webp"}
                          alt={dest.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
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
                          <Link href={`/destination/${dest.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-forest-emerald hover:bg-tribal-terracotta text-white rounded-xl text-sm font-bold transition-colors">
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

          {/* ── Right Map Area ──────────────────────────────────────────────── */}
          <div className="flex-1 relative bg-charcoal-stone flex flex-col h-full min-h-[400px]">
            {/* Toggle Sidebar Button (Mobile/Desktop) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white rounded-xl shadow-lg border border-charcoal-stone/10 flex items-center justify-center text-charcoal-stone hover:text-tribal-terracotta transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
            </button>

            {/* Map Layer Controls HUD */}
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
                      className={`flex items-start gap-3 p-2 rounded-xl transition-all text-left ${isActive ? 'bg-forest-emerald/10 border border-forest-emerald/20' : 'hover:bg-sand-beige border border-transparent'}`}
                    >
                      <div className={`mt-0.5 ${isActive ? 'text-forest-emerald' : 'text-charcoal-stone/40'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${isActive ? 'text-forest-emerald' : 'text-charcoal-stone'}`}>{layer.label}</span>
                        <span className="text-[9px] text-charcoal-stone/60 leading-tight mt-0.5">{layer.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Component */}
            <div className="w-full h-full relative z-0">
              <ChhattisgardhMap
                destinations={filteredDestinations}
                creatorSpots={creatorSpots}
                activeLayer={activeLayer}
                selectedId={selectedId}
                onSelectDestination={handleSelectDestination}
              />
            </div>
            
            {/* Live Stats Footer (HUD) */}
            <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none flex justify-center">
              <div className="bg-charcoal-stone/90 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-2xl pointer-events-auto">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Active Pins</span>
                  <span className="text-lg font-bold text-white">{filteredDestinations.length}</span>
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
                    ★{(filteredDestinations.reduce((acc, curr) => acc + curr.rating, 0) / Math.max(1, filteredDestinations.length)).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
