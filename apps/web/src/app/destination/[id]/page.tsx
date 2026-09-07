"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/ui/NativeImage";
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
  Eye,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  X
} from "lucide-react";
import { fetchPlaceBySlug, fetchPlaces, type Destination } from "../../data/api";
import { useLanguage } from "../../../context/LanguageContext";
import BookingWidget from "../../../components/BookingWidget";
import { ReviewList } from "../../../components/reviews/ReviewList";
import { WeatherAlertBanner } from "../../../components/WeatherAlertBanner";
import { TransitOverviewCard } from "../../../components/TransitOverviewCard";
import { TrustVerificationBadge } from "../../../components/TrustVerificationBadge";
import { CreatorMediaGallery } from "../../../components/CreatorMediaGallery";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  // Resolve the dynamic params promise in Next.js 15 style
  const resolvedParams = use(params);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"story" | "travel" | "eco" | "food" | "images">("story");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  useEffect(() => {
    Promise.all([
      fetchPlaceBySlug(resolvedParams.id),
      fetchPlaces()
    ]).then(([dest, all]) => {
      setDestination(dest);
      setDestinations(all);
      setIsLoading(false);
    });
  }, [resolvedParams.id]);

  const {
    lang, t, speakText, stopSpeaking, isSpeaking, tDynamic,
    isPlayingAudio, audioProgress, audioDuration, audioNarrator,
    playAudioFile, pauseAudioFile, stopAudioFile,
  } = useLanguage();

  // Stop speaking when user navigates away or tab changes to prevent speech continuing inappropriately
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopAudioFile();
    };
  }, [stopSpeaking, stopAudioFile]);

  useEffect(() => {
    stopSpeaking();
    stopAudioFile();
  }, [activeTab, stopSpeaking, stopAudioFile]);

  // Format seconds → MM:SS display
  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

  if (isLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6 animate-pulse">
        <Compass className="w-16 h-16 text-forest-emerald animate-spin-slow" />
        <h2 className="text-2xl font-sans font-bold">Loading Destination Profile...</h2>
      </div>
    );
  }

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

  const getLocalizedVal = (entityId: string, field: string, en: string, hi?: string, cg?: string) => {
    const dbVal = tDynamic(entityId, field, "");
    if (dbVal) return dbVal;
    if (lang === "hi" && hi) return hi;
    if (lang === "cg" && cg) return cg;
    return en;
  };

  const localizedName = getLocalizedVal(destination.id, "name", destination.name, (destination as any).name_hi, (destination as any).name_cg);
  const localizedTagline = getLocalizedVal(destination.id, "tagline", destination.tagline, (destination as any).tagline_hi, (destination as any).tagline_cg);
  const localizedStoryTitle = getLocalizedVal(destination.id, "storyTitle", destination.storyTitle, (destination as any).storyTitle_hi, (destination as any).storyTitle_cg);
  const localizedStory = getLocalizedVal(destination.id, "story", destination.story, (destination as any).story_hi, (destination as any).story_cg);
  const localizedTimings = getLocalizedVal(destination.id, "timings", destination.timings, (destination as any).timings_hi, (destination as any).timings_cg);
  const localizedRoutes = getLocalizedVal(destination.id, "routes", destination.routes, (destination as any).routes_hi, (destination as any).routes_cg);
  const localizedBestTime = getLocalizedVal(destination.id, "bestTime", destination.bestTime, (destination as any).bestTime_hi, (destination as any).bestTime_cg);
  const localizedSeasonalAdvice = getLocalizedVal(destination.id, "seasonalAdvice", destination.seasonalAdvice, (destination as any).seasonalAdvice_hi, (destination as any).seasonalAdvice_cg);
  const localizedSafety = getLocalizedVal(destination.id, "safety", destination.safety, (destination as any).safety_hi, (destination as any).safety_cg);
  const localizedEcoGuidance = getLocalizedVal(destination.id, "ecoGuidance", destination.ecoGuidance, (destination as any).ecoGuidance_hi, (destination as any).ecoGuidance_cg);
  const localizedLocalInsights = getLocalizedVal(destination.id, "localInsights", destination.localInsights, (destination as any).localInsights_hi, (destination as any).localInsights_cg);
  const localizedLocalFood = getLocalizedVal(destination.id, "localFood", destination.localFood, (destination as any).localFood_hi, (destination as any).localFood_cg);
  const localizedPhotographySpots = getLocalizedVal(destination.id, "photographySpots", destination.photographySpots, (destination as any).photographySpots_hi, (destination as any).photographySpots_cg);

  // Get other destinations excluding the current one for "Nearby Related Nodes" section
  const relatedDestinations = destinations.filter(d => d.id !== destination.id).slice(0, 3);

  return (
    <div className="w-full flex flex-col bg-sand-beige text-charcoal-stone">
      
      {/* 1. CINEMATIC HERO HEADER */}
      <section className="relative w-full h-[60vh] sm:h-[65vh] flex items-end overflow-hidden bg-charcoal-stone border-b-8 border-tribal-terracotta">
        <div className="absolute inset-0 z-0">
          <img
            src={destination.heroImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG"}
            referrerPolicy="no-referrer"
            alt={localizedName}
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
            {t("detail.back")}
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warm-orange/40 bg-warm-orange/15 text-xs font-mono font-bold tracking-widest text-warm-orange w-fit uppercase">
            ★ {destination.rating} {t("detail.rating")} • {t("detail.certified")}
            {destination.priorityPhase && ` • ${destination.priorityPhase}`}
          </span>

          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-white drop-shadow-md">
              {localizedName}
            </h1>
            <TrustVerificationBadge level={destination.verificationLevel} />
          </div>

          <p className="text-sm sm:text-lg text-sand-beige/85 italic max-w-2xl font-sans drop-shadow leading-relaxed">
            &quot;{localizedTagline}&quot;
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-warm-orange" />
              <span>Lat: {destination.coordinates.lat.toFixed(4)}° N</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-green-400" />
              <span>{t("detail.open")}: {localizedTimings.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Trees className="w-4 h-4 text-blue-400" />
              <span>{t("detail.bio_score")}: {destination.biodiversityScore}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TABBED CONTENT SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Comprehensive Tabs and Core Readout */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <WeatherAlertBanner weather={destination.weather} />

          {/* Tab Navigation header */}
          <div className="flex border-b border-charcoal-stone/10 gap-2 overflow-x-auto pb-1">
            {[
              { id: "story", label: t("detail.tab_story") || "Story", icon: BookOpen },
              { id: "images", label: t("detail.tab_images") || "Gallery", icon: ImageIcon },
              { id: "travel", label: t("detail.tab_travel") || "Travel", icon: Compass },
              { id: "eco", label: t("detail.tab_eco") || "Eco", icon: Leaf },
              { id: "food", label: t("detail.tab_food") || "Food", icon: UtensilsCrossed }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "story" | "travel" | "eco" | "food" | "images")}
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
              <div className="flex justify-between items-start border-b border-charcoal-stone/10 pb-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.story_subtitle")}</span>
                  <h3 className="text-xl font-sans font-bold text-forest-emerald">
                    {localizedStoryTitle}
                  </h3>
                </div>

                {/* Inclusive Audio Narration Readout Toggle Button */}
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(`${localizedStoryTitle}. ${localizedStory}`);
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow border cursor-pointer shrink-0 ${
                    isSpeaking
                      ? "bg-red-600 text-white border-red-700 animate-pulse"
                      : "bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige border-forest-emerald/20"
                  }`}
                  aria-label={isSpeaking ? "Stop Narration" : "Listen Narration"}
                  id="tts-narration-trigger"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? t("detail.stop_listen") : t("detail.listen")}</span>
                </button>
              </div>

              {/* ── Pre-Recorded Audio Guide Player ── */}
              {destination.audioUrl && (
                <div className="flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br from-[#0b3a22]/5 to-[#0b3a22]/10 border border-[#0b3a22]/15 mt-1">
                  {/* Guide Label + Narrator */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-forest-emerald text-sand-beige flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow">
                        {(audioNarrator || destination.audioNarrator || "A").charAt(0)}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-forest-emerald/70 uppercase font-bold">Audio Guide</span>
                        <span className="text-xs font-sans font-bold text-charcoal-stone leading-tight">
                          {lang === "cg"
                            ? `${audioNarrator || destination.audioNarrator} के सुरीली आवाज म`
                            : lang === "hi"
                            ? `${audioNarrator || destination.audioNarrator} की आवाज़ में`
                            : `Narrated by ${audioNarrator || destination.audioNarrator}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Play / Pause / Stop controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Stop */}
                      <button
                        onClick={() => stopAudioFile()}
                        className="w-8 h-8 rounded-lg bg-charcoal-stone/5 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-charcoal-stone/50 transition-all cursor-pointer border border-charcoal-stone/10"
                        aria-label="Stop audio guide"
                        title="Stop"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12"><rect width="12" height="12" rx="2"/></svg>
                      </button>

                      {/* Play / Pause */}
                      <button
                        onClick={() => {
                          if (isPlayingAudio) {
                            pauseAudioFile();
                          } else {
                            playAudioFile(
                              destination.audioUrl!,
                              destination.audioNarrator,
                            );
                          }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-[1.06] cursor-pointer ${
                          isPlayingAudio
                            ? "bg-tribal-terracotta shadow-tribal-terracotta/25"
                            : "bg-forest-emerald shadow-forest-emerald/25"
                        }`}
                        aria-label={isPlayingAudio ? "Pause audio guide" : "Play audio guide"}
                        id="audio-guide-play-btn"
                      >
                        {isPlayingAudio
                          ? <VolumeX className="w-4 h-4 text-white" />
                          : <Volume2 className="w-4 h-4 text-white" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {audioDuration > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="w-full h-1.5 bg-forest-emerald/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-forest-emerald rounded-full transition-all duration-300"
                          style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-charcoal-stone/40">
                        <span>{formatTime(audioProgress)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>
                  )}

                  {isPlayingAudio && (
                    <div className="text-[10px] font-mono text-forest-emerald/70 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-emerald animate-pulse inline-block" />
                      {lang === "cg" ? "ऑडियो बजत हे..." : lang === "hi" ? "ऑडियो चल रहा है..." : "Playing audio guide..."}
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-charcoal-stone/85 leading-relaxed font-sans first-letter:text-4xl first-letter:font-bold first-letter:text-tribal-terracotta first-letter:mr-2 first-letter:float-left">
                {localizedStory}
              </p>
              
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3 mt-2">
                <span className="w-9 h-9 rounded bg-purple-600 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  ★
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-purple-700 font-bold uppercase">{t("detail.story_note_title")}</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed">
                    {t("detail.story_note_desc")}
                  </span>
                </div>
              </div>

              {destination.highlights && destination.highlights.length > 0 && (
                <div className="flex flex-col gap-3 mt-4 border-t border-charcoal-stone/10 pt-4">
                  <h4 className="text-xs font-mono font-bold text-forest-emerald uppercase">Core Highlights</h4>
                  <ul className="list-disc list-inside text-sm text-charcoal-stone/85 leading-relaxed font-sans grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {destination.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB: Images Gallery */}
          {activeTab === "images" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              <div className="flex items-center gap-3 border-b border-charcoal-stone/10 pb-4">
                <ImageIcon className="w-6 h-6 text-forest-emerald" />
                <h3 className="text-xl font-sans font-bold text-forest-emerald">
                  Visual Gallery
                </h3>
              </div>
              
              <CreatorMediaGallery media={destination.media} />
            </div>
          )}

          {/* TAB 2: Travel & Logistics */}
          {activeTab === "travel" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.operating_timings")}</span>
                  <div className="p-4 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                    <span className="text-sm text-charcoal-stone font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-forest-emerald" />
                      {t("detail.access_gate")}
                    </span>
                    <span className="text-xs text-charcoal-stone/60 leading-relaxed">{localizedTimings}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.best_season")}</span>
                  <div className="p-4 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                    <span className="text-sm text-charcoal-stone font-bold flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-forest-emerald" />
                      {t("detail.seasonal_range")}
                    </span>
                    <span className="text-xs text-charcoal-stone/60 leading-relaxed">{localizedBestTime}</span>
                  </div>
                </div>

              </div>

              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.route_ingress")}</span>
                <p className="text-xs text-charcoal-stone/80 leading-relaxed bg-white p-4 rounded-2xl border border-charcoal-stone/10 font-sans">
                  {localizedRoutes}
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-forest-emerald/5 border border-forest-emerald/10 flex items-start gap-3 mt-2">
                <Info className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-forest-emerald font-bold uppercase">{t("detail.patrol_precaution")}</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed">
                    {localizedSeasonalAdvice}
                  </span>
                </div>
              </div>

              {destination.experienceTypes && destination.experienceTypes.length > 0 && (
                <div className="flex flex-col gap-2 mt-4 border-t border-charcoal-stone/10 pt-4">
                  <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">Experience Types</span>
                  <div className="flex flex-wrap gap-2">
                    {destination.experienceTypes.map((ext, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white border border-charcoal-stone/10 rounded-full text-xs font-sans font-bold text-forest-emerald shadow-sm">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <TransitOverviewCard transport={destination.transport} />

            </div>
          )}

          {/* TAB 3: Ecology & Safety */}
          {activeTab === "eco" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="p-4 rounded-2xl bg-red-600/5 border border-red-600/15 flex gap-3.5">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-red-700 uppercase">{t("detail.safety_warning")}</span>
                  <span className="text-xs text-charcoal-stone leading-relaxed">{localizedSafety}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-600/5 border border-green-600/15 flex gap-3.5 mt-2">
                <Leaf className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-green-700 uppercase">{t("detail.eco_mandate")}</span>
                  <span className="text-xs text-charcoal-stone leading-relaxed">{localizedEcoGuidance}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{t("detail.eco_stress")}</span>
                  <span className="text-sm font-sans font-bold text-forest-emerald flex items-center gap-1">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    {t("detail.low_stress")}
                  </span>
                </div>
                <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{t("detail.carrying_capacity")}</span>
                  <span className="text-sm font-sans font-bold text-tribal-terracotta">
                    {destination.crowdCapacity} {t("detail.carrying_capacity_value")}
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
                  <span className="text-xs font-mono font-bold text-tribal-terracotta uppercase">{t("detail.gastronomy_hub")}</span>
                  <span className="text-xs text-charcoal-stone/85 leading-relaxed font-sans">
                    {t("detail.gastronomy_hub")}: <strong>{localizedLocalFood}</strong>
                  </span>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-charcoal-stone/10 mt-2">
                <span className="w-10 h-10 rounded-xl bg-forest-emerald flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Camera className="w-5 h-5" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono font-bold text-forest-emerald uppercase">{t("detail.photography_coordinates")}</span>
                  <span className="text-xs text-charcoal-stone/85 leading-relaxed font-sans">
                    {t("detail.photography_coordinates")}: <strong>{localizedPhotographySpots}</strong>
                  </span>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex items-start gap-3 mt-2">
                <Info className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-forest-emerald font-bold uppercase">{t("detail.secret_insights")}</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed font-sans">
                    {localizedLocalInsights}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Verified Community Reviews */}
          <ReviewList placeId={destination.placeId || destination.id} placeName={localizedName} />

        </div>

        {/* Right Column: Geographic Side Info Panel & Nearby Related Nodes */}
        <div className="flex flex-col gap-8">
          
          {/* Booking Widget */}
          <BookingWidget
            placeId={destination.placeId || destination.id}
            placeName={localizedName}
            pricePerGuestPaise={destination.bookingPricePaise ?? 50000}
            maxGuests={destination.bookingMaxGuests ?? 20}
          />

          {/* Quick Metrics Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <Compass className="w-5 h-5 text-tribal-terracotta" />
              {t("detail.geo_telemetry")}
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">{t("detail.category")}</span>
                <span className="text-xs font-mono font-bold text-forest-emerald uppercase">{t(`categories.${destination.category}`)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">{t("detail.biodiversity_index")}</span>
                <span className="text-xs font-mono font-bold text-green-700">{destination.biodiversityScore}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">{t("detail.security_level")}</span>
                <span className="text-xs font-mono font-bold text-forest-emerald uppercase">{t("detail.security_low_risk")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-stone/60">{t("detail.daily_limits")}</span>
                <span className="text-xs font-mono font-bold text-tribal-terracotta">{destination.crowdCapacity} {t("detail.max")}</span>
              </div>

              {destination.platformFeatures && destination.platformFeatures.length > 0 && (
                <div className="flex flex-col gap-2 pt-3 border-t border-charcoal-stone/10 mt-1">
                  <span className="text-[10px] font-mono text-charcoal-stone/60 uppercase font-bold">Suggested Features</span>
                  <div className="flex flex-wrap gap-1.5">
                    {destination.platformFeatures.map((pf, idx) => (
                      <span key={idx} className="text-[9px] bg-forest-emerald/10 text-forest-emerald font-bold px-2 py-1 rounded border border-forest-emerald/20">
                        {pf}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NEARBY RELATED NODES PANEL */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <Compass className="w-5 h-5 text-tribal-terracotta animate-spin-slow" />
              {t("detail.nearby_nodes")}
            </h3>

            <div className="flex flex-col gap-4">
              {relatedDestinations.map(rel => {
                const relName = getLocalizedVal(rel.id, "name", rel.name, (rel as any).name_hi, (rel as any).name_cg);
                const relTagline = getLocalizedVal(rel.id, "tagline", rel.tagline, (rel as any).tagline_hi, (rel as any).tagline_cg);
                return (
                  <Link
                    key={rel.id}
                    href={`/destination/${rel.id}`}
                    className="glass-panel p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center gap-4 border border-white/60 text-left group"
                  >
                    <img
                      src={rel.heroImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bhoramdeo_Temple%2C_Kawardha.jpg/1280px-Bhoramdeo_Temple%2C_Kawardha.jpg"}
                      referrerPolicy="no-referrer"
                      alt={relName}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 bg-charcoal-stone"
                    />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-sans font-bold text-sm text-forest-emerald truncate group-hover:text-tribal-terracotta transition-colors">
                        {relName}
                      </span>
                      <span className="text-[10px] text-charcoal-stone/50 truncate font-sans">
                        {relTagline}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-tribal-terracotta shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </section>

      {/* LIGHTBOX OVERLAY */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8" onClick={() => setLightboxImage(null)}>
          <button 
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <img
              src={lightboxImage}
              referrerPolicy="no-referrer"
              alt="Fullscreen view"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
