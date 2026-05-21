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
  UserCheck,
  Mic,
  MicOff,
  Volume2
} from "lucide-react";
import { DESTINATIONS } from "./data/destinations";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");
  
  interface NearbyPlace {
    id: string;
    name: string;
    district?: string;
    computedDistance: number;
    name_hi?: string;
    name_cg?: string;
  }
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const { lang, t, isListening, startVoiceListening, stopVoiceListening, voiceResult, voiceErrorMsg, accessibilityMode, toggleAccessibilityMode } = useLanguage();

  // Immersive rotating hero slides references
  const heroSlidesData = [
    {
      image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1920&q=80",
      titleKey: "home.slide0_title",
      subtitleKey: "home.slide0_subtitle"
    },
    {
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80",
      titleKey: "home.slide1_title",
      subtitleKey: "home.slide1_subtitle"
    },
    {
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=80",
      titleKey: "home.slide2_title",
      subtitleKey: "home.slide2_subtitle"
    }
  ];

  // Curated 10 categories
  const exploreCategoriesData = [
    { id: "waterfalls", icon: "🌊" },
    { id: "forests", icon: "🌳" },
    { id: "temples", icon: "🏛️" },
    { id: "adventure", icon: "🧗" },
    { id: "food", icon: "🍲" },
    { id: "hidden", icon: "💎" },
    { id: "tribal", icon: "👺" },
    { id: "wildlife", icon: "🐯" },
    { id: "photography", icon: "📸" },
    { id: "eco", icon: "🌱" }
  ];

  // Seasonal strategies
  const seasonalRecommendationsData = [
    {
      key: "monsoon",
      icon: <CloudRain className="w-5 h-5 text-river-blue" />,
      titleKey: "home.monsoon_title",
      descKey: "home.monsoon_desc",
      places: ["Chitrakote Falls", "Tirathgarh Falls"],
      color: "border-river-blue/30 bg-river-blue/5"
    },
    {
      key: "winter",
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      titleKey: "home.winter_title",
      descKey: "home.winter_desc",
      places: ["Sirpur Monuments", "Kanger Valley Park"],
      color: "border-amber-500/30 bg-amber-500/5"
    },
    {
      key: "summer",
      icon: <Flame className="w-5 h-5 text-tribal-terracotta" />,
      titleKey: "home.summer_title",
      descKey: "home.summer_desc",
      places: ["Kanger Valley Park", "Bhoramdeo Temple"],
      color: "border-tribal-terracotta/30 bg-tribal-terracotta/5"
    }
  ];

  const responsibleAccords = [
    {
      titleKey: "home.responsible_accord_1_title",
      descKey: "home.responsible_accord_1_desc",
      icon: <Leaf className="w-5 h-5 text-emerald-600" />
    },
    {
      titleKey: "home.responsible_accord_2_title",
      descKey: "home.responsible_accord_2_desc",
      icon: <Camera className="w-5 h-5 text-tribal-terracotta" />
    },
    {
      titleKey: "home.responsible_accord_3_title",
      descKey: "home.responsible_accord_3_desc",
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />
    }
  ];

  // Set default telemetry instructions dynamically once component mounts
  useEffect(() => {
    setLocationStatus(t("home.telemetry_deactivated_desc"));
  }, [lang]);

  // Rotating slider effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlidesData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Simple geo-distance calculation (Haversine formula mock)
  const handleEnableGeolocation = () => {
    setLocationStatus(lang === "en" ? "Locating coordinate feed..." : lang === "cg" ? "तीर के रद्दा खोजत हंव..." : "स्थान खोजा जा रहा है...");
    if (!navigator.geolocation) {
      setLocationStatus(lang === "en" ? "Geolocation not supported." : lang === "cg" ? "स्थान खोज काम नई करत हे।" : "स्थान खोजना समर्थित नहीं है।");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus(lang === "en" ? "Telemetry active" : lang === "cg" ? "लोकेशन मिलगे" : "टेलीमेट्री सक्रिय");
        
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
        setLocationStatus(lang === "en" ? "Simulated from Raipur Hub" : lang === "cg" ? "रायपुर हब से अनुमानित" : "रायपुर हब से अनुमानित");
        const calculated = DESTINATIONS.map((dest) => {
          const distKm = Math.floor(Math.random() * 200) + 80;
          return { ...dest, computedDistance: distKm };
        }).sort((a, b) => a.computedDistance - b.computedDistance);
        setNearbyPlaces(calculated.slice(0, 3));
      }
    );
  };

  return (
    <div className="w-full flex flex-col items-center bg-sand-beige/25">
      
      {/* 1. Cinematic Dynamic Rotating Hero Banner */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-charcoal-stone border-b-8 border-tribal-terracotta">
        {heroSlidesData.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? "opacity-45" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={t(slide.titleKey)}
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
            {t("home.banner")}
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-bold tracking-tight text-sand-beige leading-tight max-w-4xl drop-shadow-lg font-mukta">
            {t("home.heading_real")}<span className="text-warm-orange">{t("home.heading_and")}</span><span className="text-emerald-400">{t("home.heading_authentic")}</span>
          </h1>

          <p className="text-sm sm:text-lg text-sand-beige/85 leading-relaxed max-w-2xl font-sans drop-shadow-md font-mukta">
            {t(heroSlidesData[activeSlide].subtitleKey)}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full justify-center">
            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-tribal-terracotta hover:bg-warm-orange text-white font-bold shadow-lg shadow-tribal-terracotta/20 transition-all duration-300 hover:scale-[1.03] group"
            >
              <Map className="w-5 h-5 transition-transform group-hover:rotate-6" />
              {t("home.interactive_map")}
            </Link>
            <Link
              href="/creator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-sand-beige font-bold shadow-lg shadow-forest-emerald/20 border border-white/10 transition-all duration-300 hover:scale-[1.03]"
            >
              <UserCheck className="w-5 h-5 text-warm-orange" />
              {t("home.join_creators")}
            </Link>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {heroSlidesData.map((_, i) => (
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

      {/* Low-Literacy / Easy Read Dashboard */}
      {accessibilityMode && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-20">
          <div className="bg-tribal-terracotta/10 border-4 border-tribal-terracotta p-8 rounded-3xl flex flex-col gap-6 shadow-lg text-center bg-white/90 backdrop-blur">
            <h2 className="text-3xl font-bold text-forest-emerald font-mukta">
              {lang === "hi" ? "आसान नेविगेशन (सुगम मोड)" : lang === "cg" ? "आसान नेविगेशन (सुगम मोड)" : "Easy Navigation (Low-Literacy UI)"}
            </h2>
            <p className="text-base text-charcoal-stone/85 font-semibold font-mukta">
              {lang === "hi" ? "जानकारी प्राप्त करने के लिए नीचे दिए गए किसी भी बड़े बटन को दबाएं या नीचे दिए गए आवाज बटन को दबाएं:" : lang === "cg" ? "जानकारी पाए बर नीचे के कोनो भी बड़े बटन ला दबाओ या आवाज बटन ला दबाओ:" : "Click any of the large buttons below to get information directly, or click the voice assistant at the bottom-right:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Link
                href="/explore"
                className="flex items-center justify-center gap-4 bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige font-sans font-bold text-xl py-6 px-8 rounded-2xl shadow-md border-2 border-forest-emerald/20 hover:scale-[1.02] transition-all min-h-[80px]"
              >
                <span className="text-4xl">🏞️</span>
                <span>{lang === "hi" ? "पर्यटन स्थल" : lang === "cg" ? "घूमइ के जगह" : "Explore Places"}</span>
              </Link>
              <Link
                href="/planner"
                className="flex items-center justify-center gap-4 bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige font-sans font-bold text-xl py-6 px-8 rounded-2xl shadow-md border-2 border-forest-emerald/20 hover:scale-[1.02] transition-all min-h-[80px]"
              >
                <span className="text-4xl">📅</span>
                <span>{lang === "hi" ? "यात्रा प्लानर" : lang === "cg" ? "टिकट/प्लानर" : "Trip Planner"}</span>
              </Link>
              <Link
                href="/stories"
                className="flex items-center justify-center gap-4 bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige font-sans font-bold text-xl py-6 px-8 rounded-2xl shadow-md border-2 border-forest-emerald/20 hover:scale-[1.02] transition-all min-h-[80px]"
              >
                <span className="text-4xl">📖</span>
                <span>{lang === "hi" ? "लोककथा कहानियां" : lang === "cg" ? "पुरखा कहानी मन" : "Folklore Stories"}</span>
              </Link>
              <Link
                href="/explore?layer=food"
                className="flex items-center justify-center gap-4 bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige font-sans font-bold text-xl py-6 px-8 rounded-2xl shadow-md border-2 border-forest-emerald/20 hover:scale-[1.02] transition-all min-h-[80px]"
              >
                <span className="text-4xl">🍛</span>
                <span>{lang === "hi" ? "बस्तर भोजन" : lang === "cg" ? "छत्तीसगढ़ी कलेवा" : "Bastar Food"}</span>
              </Link>
              <Link
                href="/sos"
                className="flex items-center justify-center gap-4 bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xl py-6 px-8 rounded-2xl shadow-md border-4 border-white hover:scale-[1.02] transition-all min-h-[80px] animate-pulse"
              >
                <span className="text-4xl animate-bounce">🚨</span>
                <span>{lang === "hi" ? "आपातकालीन सुरक्षा (SOS)" : lang === "cg" ? "आपातकालीन सुरक्षा (SOS)" : "Emergency SOS"}</span>
              </Link>
              <button
                onClick={() => startVoiceListening()}
                className="flex items-center justify-center gap-4 bg-warm-orange hover:bg-orange-600 text-charcoal-stone font-sans font-bold text-xl py-6 px-8 rounded-2xl shadow-md border-2 border-warm-orange/20 hover:scale-[1.02] transition-all min-h-[80px] cursor-pointer"
              >
                <span className="text-4xl">🎙️</span>
                <span>{lang === "hi" ? "बोलकर खोजें" : lang === "cg" ? "गोठिया के खोजव" : "Speak to Search"}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Interactive Discovery Categories Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
        <div className="text-center flex flex-col items-center gap-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">{t("home.gateways_subtitle")}</span>
          <h2 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald font-mukta">{t("home.gateways_title")}</h2>
          <p className="text-sm text-charcoal-stone/70 max-w-xl font-mukta">{t("home.gateways_desc")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {exploreCategoriesData.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/explore?layer=tourism`}
              className="glass-panel p-5 rounded-2xl border border-white/70 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center text-center gap-2.5 bg-white/70"
            >
              <span className="text-3xl filter drop-shadow">{cat.icon}</span>
              <h4 className="font-bold text-xs sm:text-sm text-forest-emerald font-mukta">{t("categories." + cat.id)}</h4>
              <span className="text-[10px] text-charcoal-stone/50 font-mono leading-none">{t("categories_desc." + cat.id)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Geolocation Georeferenced Attractions Layer */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-forest-emerald text-sand-beige rounded-3xl p-8 md:p-12 shadow-xl border border-white/10 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
          
          <div className="flex flex-col gap-5 max-w-xl">
            <span className="text-xs font-mono font-bold text-warm-orange tracking-widest uppercase">{t("home.telemetry_subtitle")}</span>
            <h2 className="text-3xl font-sans font-bold text-white leading-tight font-mukta">{t("home.telemetry_title")}</h2>
            <p className="text-sm text-sand-beige/70 leading-relaxed font-mukta">
              {t("home.telemetry_desc")}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="geo-trigger-btn"
                onClick={handleEnableGeolocation}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-warm-orange hover:bg-orange-600 text-charcoal-stone font-bold transition-all transform active:scale-95 shadow-md cursor-pointer"
              >
                <MapPin className="w-5 h-5 text-charcoal-stone" />
                {t("home.telemetry_btn")}
              </button>
              <span className="text-xs font-mono text-sand-beige/60 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                {t("home.telemetry_status")} <strong className="text-white font-mukta">{locationStatus}</strong>
              </span>
            </div>
          </div>

          {/* Location results sheet */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            {nearbyPlaces.length > 0 ? (
              <>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-warm-orange">{t("home.closest_nodes")}</h4>
                {nearbyPlaces.map((place) => {
                  const placeName = lang === "hi" ? (place.name_hi || place.name) : lang === "cg" ? (place.name_cg || place.name) : place.name;
                  return (
                    <div key={place.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white font-mukta">{placeName}</span>
                        <span className="text-[10px] text-sand-beige/50 font-mono uppercase">{place.district} District</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono font-bold text-warm-orange">~{place.computedDistance} km</span>
                        <Link href={`/destination/${place.id}`} className="text-[10px] hover:underline text-emerald-400 font-bold inline-flex items-center gap-0.5">
                          Details <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-6 text-sand-beige/50 gap-2">
                <MapPin className="w-8 h-8 animate-bounce text-sand-beige/40" />
                <span className="text-xs font-mono">{t("home.telemetry_deactivated")}</span>
                <span className="text-[10px] leading-tight max-w-xs font-mukta">{t("home.telemetry_deactivated_desc")}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Seasonal Travel Recommendations */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center flex flex-col items-center gap-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">{t("home.seasonal_subtitle")}</span>
          <h2 className="text-3xl font-sans font-bold text-forest-emerald font-mukta">{t("home.seasonal_title")}</h2>
          <p className="text-sm text-charcoal-stone/70 max-w-xl font-mukta">{t("home.seasonal_desc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {seasonalRecommendationsData.map((rec, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${rec.color} flex flex-col gap-4 shadow-sm hover:shadow-md transition-all`}>
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-white shadow-inner flex items-center justify-center">{rec.icon}</span>
                <h3 className="font-bold text-base text-forest-emerald font-mukta">{t("home." + rec.key)}</h3>
              </div>
              <h4 className="font-bold text-sm text-charcoal-stone mt-1 font-mukta">{t(rec.titleKey)}</h4>
              <p className="text-xs text-charcoal-stone/60 leading-relaxed font-mukta">{t(rec.descKey)}</p>
              
              <div className="mt-auto pt-4 border-t border-charcoal-stone/10 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase tracking-wider">Top Monitored Nodes</span>
                <div className="flex gap-2">
                  {rec.places.map((p, idx) => {
                    const matchedDest = DESTINATIONS.find(d => d.name === p || d.name_hi === p || d.id.includes(p.toLowerCase().split(" ")[0]));
                    const displayPlaceName = matchedDest 
                      ? (lang === "hi" ? (matchedDest.name_hi || matchedDest.name) : lang === "cg" ? (matchedDest.name_cg || matchedDest.name) : matchedDest.name) 
                      : p;
                    return (
                      <span key={idx} className="text-[10px] bg-white border border-charcoal-stone/10 px-2 py-1 rounded text-charcoal-stone font-medium font-mukta">
                        {displayPlaceName}
                      </span>
                    );
                  })}
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
            <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">{t("home.destinations_subtitle")}</span>
            <h2 className="text-3xl font-sans font-bold text-forest-emerald font-mukta">{t("home.destinations_title")}</h2>
          </div>
          <Link
            href="/explore"
            className="text-sm font-bold text-tribal-terracotta hover:text-forest-emerald transition-colors inline-flex items-center gap-1 font-mukta"
          >
            {t("home.destinations_link")} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DESTINATIONS.slice(0, 3).map((dest) => {
            const destName = lang === "hi" ? (dest.name_hi || dest.name) : lang === "cg" ? (dest.name_cg || dest.name) : dest.name;
            const destTagline = lang === "hi" ? (dest.tagline_hi || dest.tagline) : lang === "cg" ? (dest.tagline_cg || dest.tagline) : dest.tagline;
            const destStory = lang === "hi" ? (dest.story_hi || dest.story) : lang === "cg" ? (dest.story_cg || dest.story) : dest.story;

            return (
              <div key={dest.id} className="glass-panel rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex flex-col border border-white/70 bg-white/50 animate-fade-in">
                
                {/* Cover visual */}
                <div className="relative h-56 w-full bg-charcoal-stone">
                  <img
                    src={dest.heroImage}
                    alt={destName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 right-4 text-[10px] font-mono font-bold bg-white/95 text-forest-emerald px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    {t("categories." + dest.category)}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-stone/75 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-mono text-warm-orange font-bold">★ {dest.rating} {t("home.rating")}</span>
                    <h3 className="font-bold text-lg leading-tight mt-0.5 font-mukta">{destName}</h3>
                  </div>
                </div>

                {/* Card Contents */}
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <p className="text-xs text-charcoal-stone/70 italic font-medium font-mukta">
                    &quot;{destTagline}&quot;
                  </p>
                  <p className="text-xs text-charcoal-stone/60 leading-relaxed line-clamp-3 font-mukta">
                    {destStory}
                  </p>

                  <div className="mt-auto pt-4 border-t border-charcoal-stone/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-forest-emerald font-bold uppercase tracking-wider">
                      {t("home.biodiversity")}: {dest.biodiversityScore}%
                    </span>
                    <Link
                      href={`/destination/${dest.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-tribal-terracotta hover:text-forest-emerald font-mukta"
                    >
                      {t("home.view_details")} <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Responsible Tourism Accordion Section */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-24 animate-fade-in">
        <div className="text-center flex flex-col items-center gap-3 mb-12">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">{t("home.responsible_subtitle")}</span>
          <h2 className="text-3xl font-sans font-bold text-forest-emerald font-mukta">{t("home.responsible_title")}</h2>
          <p className="text-sm text-charcoal-stone/70 font-mukta">{t("home.responsible_desc")}</p>
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
                  className="w-full p-5 flex items-center justify-between text-left transition-colors hover:bg-white/40 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-10 h-10 rounded-xl bg-sand-beige flex items-center justify-center shadow-inner">
                      {accord.icon}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-forest-emerald font-mukta">{t(accord.titleKey)}</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-forest-emerald transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`} />
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 border-t border-charcoal-stone/5 bg-white/30 text-xs sm:text-sm text-charcoal-stone/75 leading-relaxed font-mukta">
                    {t(accord.descKey)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Floating Voice Accessibility Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 max-w-sm">
        {/* Floating instruction/transcription speech bubble */}
        {(isListening || voiceResult || voiceErrorMsg) && (
          <div className="dark-glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl text-white flex flex-col gap-2 w-72 md:w-80 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] font-mono tracking-wider text-warm-orange font-bold uppercase">
                {isListening ? t("home.voice_listening") : "Voice Assistant / आवाज"}
              </span>
              {isListening && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            
            {voiceErrorMsg ? (
              <p className="text-xs text-red-400 font-medium font-mukta">{voiceErrorMsg}</p>
            ) : voiceResult ? (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/50 font-mono">You said:</span>
                <p className="text-xs font-semibold text-sand-beige italic font-mukta">"{voiceResult}"</p>
              </div>
            ) : (
              <p className="text-xs text-white/80 leading-relaxed font-mukta">
                {t("home.voice_instructions")}
              </p>
            )}
          </div>
        )}


      </div>

    </div>
  );
}
