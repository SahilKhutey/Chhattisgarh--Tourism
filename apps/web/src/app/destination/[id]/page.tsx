"use client";

import { use, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Compass, 
  ShieldAlert, 
  BookOpen, 
  Trees, 
  Leaf, 
  Camera, 
  UtensilsCrossed, 
  Activity, 
  Info,
  ChevronRight,
  Eye
} from "lucide-react";
import { getDestinationById, DESTINATIONS } from "../../data/destinations";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  // Resolve the dynamic params promise in Next.js 15 style
  const resolvedParams = use(params);
  const destination = getDestinationById(resolvedParams.id);
  const [activeTab, setActiveTab] = useState<"story" | "travel" | "eco" | "food">("story");

  if (!destination) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6">
        <ShieldAlert className="w-16 h-16 text-red-600 animate-bounce" />
        <h2 className="text-2xl font-sans font-bold">Destination Archive Not Found</h2>
        <p className="text-sm text-charcoal-stone/60 max-w-sm text-center">
          The requested coordinate profile does not exist in the local smart directory index.
        </p>
        <Link 
          href="/explore" 
          className="px-6 py-3 rounded-xl bg-forest-emerald text-sand-beige font-bold text-sm shadow hover:bg-tribal-terracotta transition-colors"
        >
          Return to Discovery Map
        </Link>
      </div>
    );
  }

  // Get other destinations excluding the current one for "Nearby Related Nodes" section
  const relatedDestinations = DESTINATIONS.filter(d => d.id !== destination.id).slice(0, 3);

  return (
    <div className="w-full flex flex-col bg-sand-beige text-charcoal-stone">
      
      {/* 1. CINEMATIC HERO HEADER */}
      <section className="relative w-full h-[60vh] sm:h-[65vh] flex items-end overflow-hidden bg-charcoal-stone border-b-8 border-tribal-terracotta">
        <div className="absolute inset-0 z-0">
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-stone via-charcoal-stone/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-forest-emerald/30 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-4 text-white">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur w-fit border border-white/10 transition-all text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Map Explore
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warm-orange/40 bg-warm-orange/15 text-xs font-mono font-bold tracking-widest text-warm-orange w-fit uppercase">
            ★ {destination.rating} Rating • Certified Spot
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-white drop-shadow-md">
            {destination.name}
          </h1>

          <p className="text-sm sm:text-lg text-sand-beige/85 italic max-w-2xl font-sans drop-shadow leading-relaxed">
            &quot;{destination.tagline}&quot;
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-warm-orange" />
              <span>Lat: {destination.coordinates.lat.toFixed(4)}° N</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-green-400" />
              <span>Open: {destination.timings.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Trees className="w-4 h-4 text-blue-400" />
              <span>Bio Score: {destination.biodiversityScore}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TABBED CONTENT SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Comprehensive Tabs and Core Readout */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Tab Navigation header */}
          <div className="flex border-b border-charcoal-stone/10 gap-2 overflow-x-auto pb-1">
            {[
              { id: "story", label: "Heritage & Stories", icon: BookOpen },
              { id: "travel", label: "Travel & Timing Info", icon: Compass },
              { id: "eco", label: "Ecology & Safety Guidelines", icon: Leaf },
              { id: "food", label: "Gastronomy & Secrets", icon: UtensilsCrossed }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "story" | "travel" | "eco" | "food")}
                  className={`flex items-center gap-2 text-sm font-sans font-bold px-4 py-3.5 border-b-2 cursor-pointer transition-all shrink-0 ${
                    activeTab === tab.id
                      ? "border-tribal-terracotta text-tribal-terracotta"
                      : "border-transparent text-charcoal-stone/60 hover:text-forest-emerald"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Stories & Lore */}
          {activeTab === "story" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              <div className="flex flex-col gap-1 border-b border-charcoal-stone/10 pb-4">
                <span className="text-[10px] font-mono text-tribal-terracotta font-bold uppercase">Indigenous Narrative</span>
                <h3 className="text-xl font-sans font-bold text-forest-emerald">
                  {destination.storyTitle}
                </h3>
              </div>
              <p className="text-sm text-charcoal-stone/85 leading-relaxed font-sans first-letter:text-4xl first-letter:font-bold first-letter:text-tribal-terracotta first-letter:mr-2 first-letter:float-left">
                {destination.story}
              </p>
              
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3 mt-2">
                <span className="w-9 h-9 rounded bg-purple-600 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  ★
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-purple-700 font-bold uppercase">Cultural Archiving Project Note</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed">
                    This folklore has been transcribed directly from oral chronicles shared by regional tribal community gatherers. Respect native narratives.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Travel & Logistics */}
          {activeTab === "travel" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">Operating Timings</span>
                  <div className="p-4 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                    <span className="text-sm text-charcoal-stone font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-forest-emerald" />
                      Daily Access Gate
                    </span>
                    <span className="text-xs text-charcoal-stone/60 leading-relaxed">{destination.timings}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">Best Season Parameters</span>
                  <div className="p-4 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                    <span className="text-sm text-charcoal-stone font-bold flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-forest-emerald" />
                      Seasonal Range
                    </span>
                    <span className="text-xs text-charcoal-stone/60 leading-relaxed">{destination.bestTime}</span>
                  </div>
                </div>

              </div>

              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">Route Ingress & Guidance</span>
                <p className="text-xs text-charcoal-stone/80 leading-relaxed bg-white p-4 rounded-2xl border border-charcoal-stone/10 font-sans">
                  {destination.routes}
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-forest-emerald/5 border border-forest-emerald/10 flex items-start gap-3 mt-2">
                <Info className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-forest-emerald font-bold uppercase">District Patrol Precaution</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed">
                    {destination.seasonalAdvice}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Ecology & Safety */}
          {activeTab === "eco" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="p-4 rounded-2xl bg-red-600/5 border border-red-600/15 flex gap-3.5">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-red-700 uppercase">Critical Safety Warning Directive</span>
                  <span className="text-xs text-charcoal-stone leading-relaxed">{destination.safety}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-600/5 border border-green-600/15 flex gap-3.5 mt-2">
                <Leaf className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-green-700 uppercase">Ecosystem Protection Mandate</span>
                  <span className="text-xs text-charcoal-stone leading-relaxed">{destination.ecoGuidance}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">ECOLOGICAL STRESS VALUE</span>
                  <span className="text-sm font-sans font-bold text-forest-emerald flex items-center gap-1">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    Low Stress Core
                  </span>
                </div>
                <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Visitor Carrying Capacity</span>
                  <span className="text-sm font-sans font-bold text-tribal-terracotta">
                    {destination.crowdCapacity} persons / day
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Gastronomy & Secrets */}
          {activeTab === "food" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-charcoal-stone/10">
                <span className="w-10 h-10 rounded-xl bg-tribal-terracotta flex items-center justify-center text-white shrink-0 shadow-sm">
                  <UtensilsCrossed className="w-5 h-5" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Hyperlocal Gastronomy Hub</span>
                  <span className="text-xs text-charcoal-stone/85 leading-relaxed font-sans">
                    Traditional local delicacies sold nearby by indigenous cooperative kitchens: <strong>{destination.localFood}</strong>
                  </span>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-charcoal-stone/10 mt-2">
                <span className="w-10 h-10 rounded-xl bg-forest-emerald flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Camera className="w-5 h-5" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono font-bold text-forest-emerald uppercase">Photography Spot Coordinates</span>
                  <span className="text-xs text-charcoal-stone/85 leading-relaxed font-sans">
                    Optimized camera locations for beautiful, cinematic, authentic travel records: <strong>{destination.photographySpots}</strong>
                  </span>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex items-start gap-3 mt-2">
                <Info className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-forest-emerald font-bold uppercase">Secret Local Insights</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed font-sans">
                    {destination.localInsights}
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Geographic Side Info Panel & Nearby Related Nodes */}
        <div className="flex flex-col gap-8">
          
          {/* Quick Metrics Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <Compass className="w-5 h-5 text-tribal-terracotta" />
              Geographic Telemetry
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">Category</span>
                <span className="text-xs font-mono font-bold text-forest-emerald uppercase">{destination.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">Biodiversity Index</span>
                <span className="text-xs font-mono font-bold text-green-700">{destination.biodiversityScore}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">Security Level</span>
                <span className="text-xs font-mono font-bold text-forest-emerald uppercase">Low-Risk Zone</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-stone/60">Daily Limit Caps</span>
                <span className="text-xs font-mono font-bold text-tribal-terracotta">{destination.crowdCapacity} Max</span>
              </div>
            </div>
          </div>

          {/* NEARBY RELATED NODES PANEL */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <Compass className="w-5 h-5 text-tribal-terracotta animate-spin-slow" />
              Nearby Related Nodes
            </h3>

            <div className="flex flex-col gap-4">
              {relatedDestinations.map(rel => (
                <Link
                  key={rel.id}
                  href={`/destination/${rel.id}`}
                  className="glass-panel p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center gap-4 border border-white/60 text-left group"
                >
                  <img
                    src={rel.heroImage}
                    alt={rel.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 bg-charcoal-stone"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="font-sans font-bold text-sm text-forest-emerald truncate group-hover:text-tribal-terracotta transition-colors">
                      {rel.name}
                    </span>
                    <span className="text-[10px] text-charcoal-stone/50 truncate font-sans">
                      {rel.tagline}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-tribal-terracotta shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
