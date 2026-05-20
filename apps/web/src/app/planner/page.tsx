"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Calendar, 
  Compass, 
  MapPin, 
  Trees, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  Leaf, 
  Camera, 
  UtensilsCrossed, 
  HelpCircle,
  Car,
  RotateCcw,
  BookOpen,
  ShieldCheck
} from "lucide-react";
import { DESTINATIONS, Destination } from "../data/destinations";

interface ItineraryItem {
  time: string;
  activity: string;
  location: string;
  notes: string;
  ecoTip: string;
  photoTip: string;
  categoryIcon: "nature" | "culture" | "heritage" | "food";
}

interface DayPlan {
  dayNumber: number;
  title: string;
  routeOrder: string[];
  schedule: ItineraryItem[];
  localFoodTip: string;
  carbonOffsetKg: number;
}

export default function PlannerPage() {
  // Input parameters state
  const [tripDays, setTripDays] = useState<number>(3);
  const [budget, setBudget] = useState<string>("standard");
  const [interest, setInterest] = useState<string>("nature");
  const [transport, setTransport] = useState<string>("car");
  
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<DayPlan[]>([]);
  const [earnedScore, setEarnedScore] = useState<number>(0);

  // Dynamic heuristic plan generation engine
  const handleGenerateItinerary = () => {
    // Determine target locations matching the selected category
    let matchedSpots = DESTINATIONS.filter(d => {
      if (interest === "nature") return d.category === "waterfalls" || d.category === "forests";
      if (interest === "cultural") return d.category === "villages" || d.category === "temples";
      return d.category === "temples"; // Spiritual
    });

    if (matchedSpots.length === 0) {
      matchedSpots = DESTINATIONS;
    }

    const plans: DayPlan[] = [];
    
    // Construct a custom schedule for each requested trip day
    for (let day = 1; day <= tripDays; day++) {
      // Pick dynamic locations for this day cyclically
      const primaryLoc = matchedSpots[(day - 1) % matchedSpots.length];
      const secondaryLoc = DESTINATIONS[(day + 1) % DESTINATIONS.length]; // Mix in another spot for variety
      
      const dayPlan: DayPlan = {
        dayNumber: day,
        title: `Exploring the ${primaryLoc.category === "waterfalls" ? "Primal Cascades" : primaryLoc.category === "forests" ? "Sacred Green Canopy" : "Lost Ancient Dynasties"} of ${primaryLoc.name.split(" ")[0]}`,
        routeOrder: [primaryLoc.name, secondaryLoc.name],
        localFoodTip: primaryLoc.localFood,
        carbonOffsetKg: Number((12.5 * (transport === "bike" ? 0.3 : transport === "car" ? 1.0 : 0.6)).toFixed(1)),
        schedule: [
          {
            time: "08:00 AM",
            activity: `Morning Photographic Expedition to ${primaryLoc.name}`,
            location: primaryLoc.name,
            notes: `Ideal lighting. ${primaryLoc.tagline}.`,
            ecoTip: `Stay on designated tracks. ${primaryLoc.ecoGuidance.split(".")[0]}.`,
            photoTip: primaryLoc.photographySpots,
            categoryIcon: "nature"
          },
          {
            time: "11:30 AM",
            activity: `Cultural Folklore & Oral Legends Session`,
            location: primaryLoc.name,
            notes: primaryLoc.storyTitle,
            ecoTip: `Always ask permission before filming local tribal elders.`,
            photoTip: `Capture the unique red carvings and intricate geometries.`,
            categoryIcon: "culture"
          },
          {
            time: "01:30 PM",
            activity: `Traditional Regional Gastronomy Lunch`,
            location: `Bastar Cooperative Kitchen near ${primaryLoc.name}`,
            notes: `Featuring organic tribal forest gather recipes.`,
            ecoTip: `Use compostable clay plates (Dona). Zero single-use plastics permitted.`,
            photoTip: `Top-down macro shot of the freshly steamed Chila.`,
            categoryIcon: "food"
          },
          {
            time: "03:30 PM",
            activity: `Exploration of neighboring heritage node: ${secondaryLoc.name}`,
            location: secondaryLoc.name,
            notes: secondaryLoc.tagline,
            ecoTip: secondaryLoc.ecoGuidance.split(".")[0],
            photoTip: secondaryLoc.photographySpots,
            categoryIcon: "heritage"
          }
        ]
      };
      
      plans.push(dayPlan);
    }

    setGeneratedItinerary(plans);
    // Responsible Score: 100 base + 25 points per day + 30 bonus if low carbon transport
    const score = 100 + (tripDays * 25) + (transport === "bike" ? 30 : 15);
    setEarnedScore(score);
    setIsGenerated(true);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setGeneratedItinerary([]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal-stone flex-1 flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-charcoal-stone/10 pb-6">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-forest-emerald/30 bg-forest-emerald/5 text-xs font-mono font-bold text-forest-emerald w-fit uppercase">
            <Sparkles className="w-3.5 h-3.5 text-warm-orange animate-pulse" />
            Adaptive Route Engine
          </span>
          <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-forest-emerald">
            AI Travel Itinerary Planner
          </h1>
          <p className="text-sm text-charcoal-stone/60 max-w-xl leading-relaxed">
            Generate custom, highly optimized daily travel itineraries. Our algorithm respects seasonal accessibility, ecological safety guidelines, and tribal community benefit ratios.
          </p>
        </div>

        {isGenerated && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-charcoal-stone/20 hover:bg-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-tribal-terracotta" />
            Modify Trip Parameters
          </button>
        )}
      </div>

      {/* INPUT FORM SECTION */}
      {!isGenerated ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Form Panel */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 flex flex-col gap-8">
            
            {/* Step 1: Duration */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-mono font-bold text-tribal-terracotta uppercase flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5" />
                1. Trip Duration (Days)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[2, 3, 4, 5, 6, 7].map(day => (
                  <button
                    key={day}
                    onClick={() => setTripDays(day)}
                    className={`py-3.5 rounded-xl font-mono font-bold text-sm shadow-sm cursor-pointer transition-all border ${
                      tripDays === day
                        ? "bg-forest-emerald text-sand-beige border-transparent"
                        : "bg-white/80 border-charcoal-stone/10 hover:bg-white text-charcoal-stone"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Primary Interests */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-mono font-bold text-tribal-terracotta uppercase flex items-center gap-2">
                <Compass className="w-4.5 h-4.5" />
                2. Select Exploration Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "nature", title: "Nature & Cascades", desc: "Waterfalls, forests, caves, safaris", icon: Trees },
                  { id: "cultural", title: "Tribal & Local Culture", desc: "Indigenous arts, folklore, village trails", icon: BookOpen },
                  { id: "spiritual", title: "Spiritual & Heritage", desc: "Ancient brick temples, mystical shrines", icon: CheckCircle }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setInterest(item.id)}
                      className={`p-5 rounded-2xl text-left shadow-sm cursor-pointer transition-all flex flex-col gap-2.5 border ${
                        interest === item.id
                          ? "bg-forest-emerald text-sand-beige border-transparent"
                          : "bg-white/80 border-charcoal-stone/10 hover:bg-white text-charcoal-stone"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        interest === item.id ? "bg-white/10 text-white" : "bg-forest-emerald/5 text-forest-emerald"
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-sans font-bold text-sm leading-tight">{item.title}</span>
                        <span className={`text-[10px] leading-relaxed ${
                          interest === item.id ? "text-sand-beige/70" : "text-charcoal-stone/50"
                        }`}>{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Budget tier */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-mono font-bold text-tribal-terracotta uppercase flex items-center gap-2">
                <Compass className="w-4.5 h-4.5" />
                3. Economic Scope (Budget)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "budget", label: "Budget", desc: "Local homestays & state transport" },
                  { id: "standard", label: "Standard", desc: "Comfy guest rooms & rental car" },
                  { id: "premium", label: "Premium Experience", desc: "Luxury eco-resorts & private tours" }
                ].map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setBudget(tier.id)}
                    className={`p-4 rounded-xl text-left shadow-sm cursor-pointer transition-all flex flex-col border ${
                      budget === tier.id
                        ? "bg-forest-emerald text-sand-beige border-transparent"
                        : "bg-white/80 border-charcoal-stone/10 hover:bg-white text-charcoal-stone"
                    }`}
                  >
                    <span className="font-sans font-bold text-sm leading-tight">{tier.label}</span>
                    <span className={`text-[9px] leading-tight mt-1 ${
                      budget === tier.id ? "text-sand-beige/70" : "text-charcoal-stone/40"
                    }`}>{tier.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Transport mode */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-mono font-bold text-tribal-terracotta uppercase flex items-center gap-2">
                <Car className="w-4.5 h-4.5" />
                4. Primary Mode of Transport
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "car", label: "Private Sedan / SUV", sub: "Most accessible" },
                  { id: "bike", label: "Motorbike Tour", sub: "Low emission adventurous" },
                  { id: "transit", label: "Local State Transit", sub: "Eco-first citizen standard" }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setTransport(mode.id)}
                    className={`p-4 rounded-xl text-left shadow-sm cursor-pointer transition-all flex flex-col border ${
                      transport === mode.id
                        ? "bg-forest-emerald text-sand-beige border-transparent"
                        : "bg-white/80 border-charcoal-stone/10 hover:bg-white text-charcoal-stone"
                    }`}
                  >
                    <span className="font-sans font-bold text-sm leading-tight">{mode.label}</span>
                    <span className={`text-[9px] leading-tight mt-1 ${
                      transport === mode.id ? "text-sand-beige/70" : "text-charcoal-stone/40"
                    }`}>{mode.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleGenerateItinerary}
              className="w-full py-4.5 rounded-2xl bg-tribal-terracotta hover:bg-warm-orange text-white font-bold text-sm font-sans tracking-wide shadow-lg shadow-tribal-terracotta/20 transition-all duration-300 hover:scale-[1.01] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              Generate Heuristic Travel Plan Instantly
            </button>

          </div>

          {/* Right Info Guidelines Panel */}
          <div className="flex flex-col gap-6">
            
            <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
              <h3 className="font-sans font-bold text-base text-forest-emerald mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-tribal-terracotta" />
                Responsible Tourism Score
              </h3>
              <p className="text-xs text-charcoal-stone/60 leading-relaxed mb-4">
                Each calculated travel plan grants you baseline points. By picking low-carbon transport modes (such as motorbikes or state transit), bringing zero plastic containers, and booking local tribal homestays, your score increases!
              </p>
              <div className="p-3.5 rounded-xl bg-forest-emerald/5 border border-forest-emerald/10 flex items-center gap-3">
                <span className="w-8 h-8 rounded bg-forest-emerald text-sand-beige font-mono font-bold text-xs flex items-center justify-center">
                  +30
                </span>
                <span className="text-xs font-sans text-charcoal-stone">
                  Select <strong>Motorbike Tour</strong> or <strong>State Transit</strong> for a green bonus!
                </span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
              <h3 className="font-sans font-bold text-base text-forest-emerald mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Remote Forest Safety Info
              </h3>
              <ul className="space-y-3 text-xs text-charcoal-stone/70">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  Many forest parks like Kanger Valley and Barnawapara have zero cellular signal.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  Save your generated day plans to offline browser storage using our smart cache.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  Hire government-certified local guides at park entry points for secure pathways.
                </li>
              </ul>
            </div>

          </div>

        </div>
      ) : (
        /* OUTPUT RESULTS SECTION */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Day-Wise Timeline Schedule Panel */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {generatedItinerary.map((day, idx) => (
              <div key={idx} className="glass-panel rounded-3xl shadow-lg border border-white/60 overflow-hidden">
                {/* Day Header banner */}
                <div className="bg-forest-emerald px-6 sm:px-8 py-4.5 text-sand-beige flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono tracking-widest text-warm-orange uppercase font-bold">Chronological Schedule</span>
                    <h3 className="font-sans font-bold text-lg text-white">Day {day.dayNumber}: {day.title}</h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-mono text-sand-beige/60 uppercase">Carbon Offset</span>
                      <span className="text-xs font-mono font-bold text-white">{day.carbonOffsetKg} kg CO₂e</span>
                    </div>
                  </div>
                </div>

                {/* Day Schedule Content */}
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  
                  {day.schedule.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-4 sm:gap-6 relative group">
                      
                      {/* Timeline connecting line */}
                      {itemIdx < day.schedule.length - 1 && (
                        <div className="absolute left-[15px] sm:left-[21px] top-8 bottom-[-24px] w-0.5 bg-charcoal-stone/10"></div>
                      )}

                      {/* Timeline Icon Node */}
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white border border-charcoal-stone/10 flex items-center justify-center shrink-0 shadow-sm relative z-10">
                        {item.categoryIcon === "nature" && <Trees className="w-4 h-4 sm:w-5 sm:h-5 text-forest-emerald" />}
                        {item.categoryIcon === "culture" && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
                        {item.categoryIcon === "food" && <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-tribal-terracotta" />}
                        {item.categoryIcon === "heritage" && <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-river-blue" />}
                      </div>

                      {/* Timeline Text Card */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                          <span className="font-sans font-bold text-sm sm:text-base text-forest-emerald">{item.activity}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-charcoal-stone/5 text-charcoal-stone/60">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                        </div>

                        <span className="text-[10px] text-tribal-terracotta font-mono font-bold inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </span>

                        <p className="text-xs text-charcoal-stone/70 leading-relaxed font-sans mt-0.5">
                          {item.notes}
                        </p>

                        {/* Expandable detailed guides (Photography & Eco advice) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-green-700 font-bold uppercase flex items-center gap-1">
                              <Leaf className="w-3.5 h-3.5 text-green-600" />
                              Eco Guidance
                            </span>
                            <span className="text-[10px] text-charcoal-stone/60 leading-relaxed">{item.ecoTip}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-orange-700 font-bold uppercase flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-orange-600" />
                              Photography Advice
                            </span>
                            <span className="text-[10px] text-charcoal-stone/60 leading-relaxed">{item.photoTip}</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}

                  {/* Day Footer food recommendation panel */}
                  <div className="mt-4 p-4.5 rounded-2xl bg-tribal-terracotta/5 border border-tribal-terracotta/10 flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-tribal-terracotta flex items-center justify-center text-white shrink-0">
                      <UtensilsCrossed className="w-4.5 h-4.5" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase tracking-wider">Culinary Secret Recommendations</span>
                      <span className="text-xs font-sans text-charcoal-stone/85 leading-relaxed">
                        Don&apos;t miss the local gastronomy near these spots: <strong>{day.localFoodTip}</strong>
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            ))}

          </div>

          {/* Right Metrics Panel */}
          <div className="flex flex-col gap-6">
            
            <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
              <h3 className="font-sans font-bold text-base text-forest-emerald mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Trip Safety Clearance
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                  <span className="text-xs text-charcoal-stone/65 font-sans">Traveler Score Earned</span>
                  <span className="font-mono font-bold text-sm text-green-700">{earnedScore} pts</span>
                </div>
                <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                  <span className="text-xs text-charcoal-stone/65 font-sans">Transport Risk index</span>
                  <span className="font-mono font-bold text-sm text-forest-emerald uppercase">{transport === "bike" ? "Low-Eco" : transport === "car" ? "Minimal" : "Citizen Low"}</span>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs text-charcoal-stone/65 font-sans">Estimated Route distance</span>
                  <span className="font-mono font-bold text-sm text-forest-emerald">~{tripDays * 42} km</span>
                </div>

                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-800 flex gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-green-700 mt-0.5" />
                  All route nodes are cleared by District Safety Desk. No active weather alerts.
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-4">
              <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
                <Leaf className="w-5 h-5 text-tribal-terracotta" />
                Offline Save Engine
              </h3>
              <p className="text-xs text-charcoal-stone/60 leading-relaxed">
                Save this day-by-day travel map directly to your local browser storage. This guarantees full access to schedules, emergency coordinates, and folklore notes even deep in remote valleys.
              </p>
              
              <button
                onClick={() => alert("Itinerary cached locally! Open explore page offline to view saved trips.")}
                className="w-full py-3.5 rounded-xl bg-forest-emerald hover:bg-tribal-terracotta text-white font-bold text-xs font-sans tracking-wide transition-colors cursor-pointer"
              >
                Save Cache to Device
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
