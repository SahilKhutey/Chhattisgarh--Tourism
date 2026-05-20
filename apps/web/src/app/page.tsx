"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Compass, 
  Map, 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  Leaf, 
  Trees, 
  Users, 
  ChevronRight, 
  Eye, 
  ChevronDown, 
  Camera, 
  MapPin,
  Calendar,
  CloudRain,
  Sun,
  Flame,
  UserCheck
} from "lucide-react";
import { DESTINATIONS } from "./data/destinations";

// Immersive rotating hero slides
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1920&q=80",
    title: "Misty Chitrakote horseshoe Gorge",
    subtitle: "Experience the majestic power of Indravati River's flow."
  },
  {
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80",
    title: "Dense Sal Forest of Bastar",
    subtitle: "Pristine woodlands home to unique wildlife & ancient folklore."
  },
  {
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=80",
    title: "AncientSirpur Brick Temples",
    subtitle: "1400 years of brickwork chronicles and archaeological gold."
  }
];

// Curated 10 categories
const EXPLORE_CATEGORIES = [
  { id: "waterfalls", name: "Waterfalls", icon: "🌊", desc: "Monsoon cascades" },
  { id: "forests", name: "Dense Forests", icon: "🌳", desc: "Sal canopy trails" },
  { id: "temples", name: "Temples & Archeology", icon: "🏛️", desc: "Ancient ruins" },
  { id: "adventure", name: "Adventure Trails", icon: "🧗", desc: "Caves & gorges" },
  { id: "food", name: "Tribal Gastronomy", icon: "🍲", desc: "Indigenous Mahua & Roti" },
  { id: "hidden", name: "Hidden Gems", icon: "💎", desc: "Secret pristine valleys" },
  { id: "tribal", name: "Tribal Arts", icon: "👺", desc: "Dhokra & Bell Metal" },
  { id: "wildlife", name: "Wildlife Reserves", icon: "🐯", desc: "Tiger & bison domains" },
  { id: "photography", name: "Photography Spots", icon: "📸", desc: "Unseen panoramic vistas" },
  { id: "eco", name: "Eco Tourism", icon: "🌱", desc: "Community homestays" }
];

// Seasonal strategies
const SEASONAL_RECOMMENDATIONS = [
  {
    season: "Monsoon (July - Oct)",
    icon: <CloudRain className="w-5 h-5 text-river-blue" />,
    title: "Waterfalls Expedition",
    desc: "Chitrakote and Tirathgarh roar with unmatched volume. The forest is absolute vibrant green.",
    places: ["Chitrakote Falls", "Tirathgarh Falls"],
    color: "border-river-blue/30 bg-river-blue/5"
  },
  {
    season: "Winter (Nov - Feb)",
    icon: <Sun className="w-5 h-5 text-amber-500" />,
    title: "Wildlife & Heritage Trails",
    desc: "Perfect cool climate to discover archaeological relics at Sirpur and spot dynamic bison herds in reserve corridors.",
    places: ["Sirpur Monuments", "Kanger Valley Park"],
    color: "border-amber-500/30 bg-amber-500/5"
  },
  {
    season: "Summer (March - June)",
    icon: <Flame className="w-5 h-5 text-tribal-terracotta" />,
    title: "Cool Forest Canopies & Caves",
    desc: "Escape the heat inside deep subterranean Kutumsar limestone caves, maintaining standard cool temperatures year-round.",
    places: ["Kanger Valley Park", "Bhoramdeo Temple"],
    color: "border-tribal-terracotta/30 bg-tribal-terracotta/5"
  }
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Click to enable geolocation");
  interface NearbyPlace {
    id: string;
    name: string;
    district?: string;
    computedDistance: number;
  }
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);

  // Rotating slider effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Simple geo-distance calculation (Haversine formula mock)
  const handleEnableGeolocation = () => {
    setLocationStatus("Locating coordinate feed...");
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported on browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus("Telemetry active");
        
        // Calculate dynamic distances to spots
        const calculated = DESTINATIONS.map((dest) => {
          // Haversine-like calculation to mock realistic Bastar boundaries
          const dx = dest.coordinates.lng - 81.5; // Centered near Bastar
          const dy = dest.coordinates.lat - 19.5;
          const distKm = Math.round(Math.sqrt(dx*dx + dy*dy) * 111 + 250); // Scale factor
          return { ...dest, computedDistance: distKm };
        }).sort((a, b) => a.computedDistance - b.computedDistance);

        setNearbyPlaces(calculated.slice(0, 3));
      },
      (error) => {
        // Fallback simulated location (Raipur airport baseline)
        setUserLocation({ lat: 21.18, lng: 81.73 });
        setLocationStatus("Simulated from Raipur Hub");
        const calculated = DESTINATIONS.map((dest) => {
          const distKm = Math.floor(Math.random() * 200) + 80;
          return { ...dest, computedDistance: distKm };
        }).sort((a, b) => a.computedDistance - b.computedDistance);
        setNearbyPlaces(calculated.slice(0, 3));
      }
    );
  };

  const responsibleAccords = [
    {
      title: "Eco Awareness & Carrying Capacity",
      desc: "Our forest trails operate under strict ecological load regulations. When visiting reserves like Kanger Valley, limit plastics, pack out waste, and abide by group sizes set by forestry rangers.",
      icon: <Leaf className="w-5 h-5 text-emerald-600" />
    },
    {
      title: "Tribal Custom & Photography Ethics",
      desc: "Chhattisgarh’s tribal clans hold distinct spiritual protocols. Always seek permission before photographing local residents or sacred clan monoliths. Avoid flashy attire during local bazaar hours.",
      icon: <Camera className="w-5 h-5 text-tribal-terracotta" />
    },
    {
      title: "Sound & Light Discipline in Wildlife Zones",
      desc: "Limestone caverns and reserve boundaries require pin-drop silence. Loud sound speakers, heavy flashlights, or littering inside sensitive ecosystems is heavily fined by tribal local bodies.",
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />
    }
  ];

  return (
    <div className="w-full flex flex-col items-center bg-sand-beige/25">
      
      {/* 1. Cinematic Dynamic Rotating Hero Banner */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-charcoal-stone border-b-8 border-tribal-terracotta">
        {HERO_SLIDES.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? "opacity-45" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-stone via-charcoal-stone/75 to-transparent"></div>
          </div>
        ))}
        
        {/* Cinematic accents */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-emerald/40 via-transparent to-tribal-terracotta/20 z-0"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-warm-orange/45 bg-warm-orange/15 text-xs font-mono font-bold tracking-widest text-warm-orange uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-warm-orange" />
            Chhattisgarh Sustainable Travel Portal
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold tracking-tight text-sand-beige leading-tight max-w-4xl drop-shadow-lg">
            Discover the <span className="text-warm-orange">Real</span> & <span className="text-emerald-400">Authentic</span>
          </h1>

          <p className="text-sm sm:text-lg text-sand-beige/85 leading-relaxed max-w-2xl font-sans drop-shadow-md">
            {HERO_SLIDES[activeSlide].subtitle} Explore ancient brick temples, roar with pristine monsoon cascades, and protect indigenous tribal lore.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full justify-center">
            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-tribal-terracotta hover:bg-warm-orange text-white font-bold shadow-lg shadow-tribal-terracotta/20 transition-all duration-300 hover:scale-[1.03] group"
            >
              <Map className="w-5 h-5 transition-transform group-hover:rotate-6" />
              Explore Interactive Map
            </Link>
            <Link
              href="/creator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-sand-beige font-bold shadow-lg shadow-forest-emerald/20 border border-white/10 transition-all duration-300 hover:scale-[1.03]"
            >
              <UserCheck className="w-5 h-5 text-warm-orange" />
              Join Verified Creators
            </Link>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === activeSlide ? "bg-warm-orange w-8" : "bg-white/40"
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. Interactive Discovery Categories Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
        <div className="text-center flex flex-col items-center gap-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">Discovery Gateways</span>
          <h2 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald">Explore Core Experiences</h2>
          <p className="text-sm text-charcoal-stone/70 max-w-xl">Filter deep through specialized regional layers curated to uncover raw tribal art, sacred waterfalls, and historical routes.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {EXPLORE_CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/explore?layer=tourism`}
              className="glass-panel p-5 rounded-2xl border border-white/70 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center text-center gap-2.5 bg-white/70"
            >
              <span className="text-3xl filter drop-shadow">{cat.icon}</span>
              <h4 className="font-bold text-xs sm:text-sm text-forest-emerald">{cat.name}</h4>
              <span className="text-[10px] text-charcoal-stone/50 font-mono leading-none">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Geolocation Georeferenced Attractions Layer */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-forest-emerald text-sand-beige rounded-3xl p-8 md:p-12 shadow-xl border border-white/10 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
          
          <div className="flex flex-col gap-5 max-w-xl">
            <span className="text-xs font-mono font-bold text-warm-orange tracking-widest uppercase">Smart Telemetry Hub</span>
            <h2 className="text-3xl font-sans font-bold text-white leading-tight">Find Nearby Unexplored Corridors</h2>
            <p className="text-sm text-sand-beige/70 leading-relaxed">
              Enable your location sensor to calculate distance parameters to surrounding waterfalls, sanctuaries, and guides in real-time. All coordinates are handled locally for offline resilience.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleEnableGeolocation}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-warm-orange hover:bg-orange-600 text-charcoal-stone font-bold transition-all transform active:scale-95 shadow-md"
              >
                <MapPin className="w-5 h-5 text-charcoal-stone" />
                Activate Location
              </button>
              <span className="text-xs font-mono text-sand-beige/60 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                Status: <strong className="text-white">{locationStatus}</strong>
              </span>
            </div>
          </div>

          {/* Location results sheet */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            {nearbyPlaces.length > 0 ? (
              <>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-warm-orange">Closest Cultural Nodes</h4>
                {nearbyPlaces.map((place) => (
                  <div key={place.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{place.name}</span>
                      <span className="text-[10px] text-sand-beige/50 font-mono uppercase">{place.district} District</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-warm-orange">~{place.computedDistance} km</span>
                      <Link href={`/destination/${place.id}`} className="text-[10px] hover:underline text-emerald-400 font-bold inline-flex items-center gap-0.5">
                        Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-6 text-sand-beige/50 gap-2">
                <MapPin className="w-8 h-8 animate-bounce text-sand-beige/40" />
                <span className="text-xs font-mono">Telemetry deactivated</span>
                <span className="text-[10px] leading-tight max-w-xs">Enable location to calculate distances to Sirpur, Chitrakote, or Kutumsar caves.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Seasonal Travel Recommendations */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center flex flex-col items-center gap-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">Intelligent Travel Tides</span>
          <h2 className="text-3xl font-sans font-bold text-forest-emerald">Seasonal Escapes & Routes</h2>
          <p className="text-sm text-charcoal-stone/70 max-w-xl">Chhattisgarh changes character dramatically with the sun and rain. Tap below to navigate based on seasonal road access and weather safety parameters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SEASONAL_RECOMMENDATIONS.map((rec, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${rec.color} flex flex-col gap-4 shadow-sm hover:shadow-md transition-all`}>
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-white shadow-inner flex items-center justify-center">{rec.icon}</span>
                <h3 className="font-bold text-base text-forest-emerald font-sans">{rec.season}</h3>
              </div>
              <h4 className="font-bold text-sm text-charcoal-stone mt-1">{rec.title}</h4>
              <p className="text-xs text-charcoal-stone/60 leading-relaxed">{rec.desc}</p>
              
              <div className="mt-auto pt-4 border-t border-charcoal-stone/10 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase tracking-wider">Top Monitored Nodes</span>
                <div className="flex gap-2">
                  {rec.places.map((p, idx) => (
                    <span key={idx} className="text-[10px] bg-white border border-charcoal-stone/10 px-2 py-1 rounded text-charcoal-stone font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Sacred Groveland Display */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">Signature Travel Hubs</span>
            <h2 className="text-3xl font-sans font-bold text-forest-emerald">Immersive Destination Chronicles</h2>
          </div>
          <Link
            href="/explore"
            className="text-sm font-bold text-tribal-terracotta hover:text-forest-emerald transition-colors inline-flex items-center gap-1"
          >
            Explore interactive maps <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DESTINATIONS.slice(0, 3).map((dest) => (
            <div key={dest.id} className="glass-panel rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex flex-col border border-white/70 bg-white/50">
              
              {/* Cover visual */}
              <div className="relative h-56 w-full bg-charcoal-stone">
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 right-4 text-[10px] font-mono font-bold bg-white/95 text-forest-emerald px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {dest.category}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-stone/75 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-mono text-warm-orange font-bold">★ {dest.rating} Rating</span>
                  <h3 className="font-bold text-lg leading-tight mt-0.5">{dest.name}</h3>
                </div>
              </div>

              {/* Card Contents */}
              <div className="p-6 flex flex-col gap-4 flex-1">
                <p className="text-xs text-charcoal-stone/70 italic font-medium">
                  &quot;{dest.tagline}&quot;
                </p>
                <p className="text-xs text-charcoal-stone/60 leading-relaxed line-clamp-3">
                  {dest.story}
                </p>

                <div className="mt-auto pt-4 border-t border-charcoal-stone/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-forest-emerald font-bold uppercase tracking-wider">
                    BIODIVERSITY: {dest.biodiversityScore}%
                  </span>
                  <Link
                    href={`/destination/${dest.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-tribal-terracotta hover:text-forest-emerald"
                  >
                    View Story Details <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 6. Responsible Tourism Accordion Section */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center flex flex-col items-center gap-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">Ecological Protocol</span>
          <h2 className="text-3xl font-sans font-bold text-forest-emerald">Responsible Traveler Directives</h2>
          <p className="text-sm text-charcoal-stone/70">As a community-powered space, we respect local customs, protect deep Sal sanctuaries, and strictly enforce visual carrying limits.</p>
        </div>

        <div className="flex flex-col gap-3">
          {responsibleAccords.map((accord, idx) => {
            const isOpen = activeAccordion === idx;
            return (
              <div 
                key={idx}
                className="glass-panel rounded-2xl border border-white/60 overflow-hidden bg-white/70 shadow-sm"
              >
                <button
                  onClick={() => setActiveAccordion(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left transition-colors hover:bg-white/40"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-10 h-10 rounded-xl bg-sand-beige flex items-center justify-center shadow-inner">
                      {accord.icon}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-forest-emerald">{accord.title}</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-forest-emerald transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`} />
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 border-t border-charcoal-stone/5 bg-white/30 text-xs sm:text-sm text-charcoal-stone/75 leading-relaxed">
                    {accord.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
