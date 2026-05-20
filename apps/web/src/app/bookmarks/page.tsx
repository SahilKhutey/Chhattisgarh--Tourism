"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, 
  Trash2, 
  Sparkles, 
  MapPin, 
  CloudLightning,
  CheckCircle,
  WifiOff,
  FolderPlus,
  Compass,
  ArrowRight,
  Eye,
  BookOpen,
  Volume2
} from "lucide-react";
import { DESTINATIONS } from "../data/destinations";

// Default collections for high aesthetic MVP state
const DEFAULT_COLLECTIONS = [
  {
    name: "My Bastar Expedition",
    desc: "Tribal crafts and waterfall corridors",
    places: ["chitrakote-falls", "tirathgarh-falls", "kanger-valley"],
    color: "from-forest-emerald/20 to-emerald-800/10 border-forest-emerald/30"
  },
  {
    name: "Sacred Temple Circuit",
    desc: "Ancient archaeological relics & architecture",
    places: ["sirpur-monuments", "bhoramdeo-temple"],
    color: "from-tribal-terracotta/20 to-amber-700/10 border-tribal-terracotta/30"
  }
];

interface Collection {
  name: string;
  desc: string;
  places: string[];
  color: string;
}

export default function BookmarksPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>("My Bastar Expedition");
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [showAddCol, setShowAddCol] = useState(false);

  // Offline Caching States
  const [offlineSyncing, setOfflineSyncing] = useState<string | null>(null);
  const [offlineProgress, setOfflineProgress] = useState(0);
  const [syncedCollections, setSyncedCollections] = useState<string[]>([]);

  // Load existing collections
  useEffect(() => {
    setTimeout(() => {
      const saved = localStorage.getItem("cg_saved_collections");
      if (saved) {
        setCollections(JSON.parse(saved));
      } else {
        setCollections(DEFAULT_COLLECTIONS);
        localStorage.setItem("cg_saved_collections", JSON.stringify(DEFAULT_COLLECTIONS));
      }

      // Load offline synced lists
      const synced = localStorage.getItem("cg_synced_collections");
      if (synced) setSyncedCollections(JSON.parse(synced));
    }, 0);
  }, []);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName) return;

    const newCol = {
      name: newColName,
      desc: newColDesc || "Custom travel pathway",
      places: ["kanger-valley"], // Default start spot
      color: "from-river-blue/20 to-sky-800/10 border-river-blue/30"
    };

    const updated = [...collections, newCol];
    setCollections(updated);
    localStorage.setItem("cg_saved_collections", JSON.stringify(updated));
    setActiveCollection(newColName);
    
    // Reset Form
    setNewColName("");
    setNewColDesc("");
    setShowAddCol(false);
  };

  const handleDeleteCollection = (name: string) => {
    const updated = collections.filter(c => c.name !== name);
    setCollections(updated);
    localStorage.setItem("cg_saved_collections", JSON.stringify(updated));
    if (activeCollection === name && updated.length > 0) {
      setActiveCollection(updated[0].name);
    }
  };

  // Simulate offline download micro-animation
  const handleOfflineSync = (colName: string) => {
    setOfflineSyncing(colName);
    setOfflineProgress(10);

    const interval = setInterval(() => {
      setOfflineProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setOfflineSyncing(null);
          
          const updatedSynced = [...syncedCollections, colName];
          setSyncedCollections(updatedSynced);
          localStorage.setItem("cg_synced_collections", JSON.stringify(updatedSynced));
          return 100;
        }
        return prev + 15;
      });
    }, 450);
  };

  // Find saved places inside active folder
  const currentCollection = collections.find(c => c.name === activeCollection) || collections[0];
  const savedPlaces = currentCollection 
    ? DESTINATIONS.filter(d => currentCollection.places.includes(d.id))
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 text-charcoal-stone bg-sand-beige/20 min-h-[85vh]">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-charcoal-stone/10 pb-6 md:flex-row md:justify-between md:items-end">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">
            Sovereign Travel Planner
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald flex items-center gap-2.5">
            <Heart className="w-9 h-9 text-tribal-terracotta fill-tribal-terracotta" />
            My Saved Journeys
          </h1>
          <p className="text-sm text-charcoal-stone/75 leading-relaxed max-w-xl">
            Organize discovery locations into custom circuits and sync details locally to enable 100% offline navigation in deep forest zones.
          </p>
        </div>

        <button
          onClick={() => setShowAddCol(!showAddCol)}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-sand-beige text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          Create New Collection
        </button>
      </div>

      {/* Creation Accordion Form */}
      {showAddCol && (
        <form onSubmit={handleCreateCollection} className="glass-panel p-6 rounded-2xl border border-white/60 bg-white/70 max-w-md flex flex-col gap-4 animate-fade-in">
          <h3 className="font-bold text-sm text-forest-emerald">Create Trip Collection</h3>
          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-charcoal-stone/75">Collection Title</label>
            <input
              type="text"
              placeholder="e.g. Bastar Waterfall Circuit"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="p-3 rounded-xl bg-white border border-charcoal-stone/15 text-charcoal-stone font-semibold focus:outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-charcoal-stone/75">Brief Description</label>
            <input
              type="text"
              placeholder="e.g. Photography locations for winter escapes"
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              className="p-3 rounded-xl bg-white border border-charcoal-stone/15 text-charcoal-stone font-semibold focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddCol(false)}
              className="px-4 py-2.5 rounded-xl border border-charcoal-stone/15 font-bold hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-tribal-terracotta hover:bg-warm-orange text-white font-bold transition-colors"
            >
              Add Folder
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: COLLECTIONS SELECTOR LIST */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold tracking-wider text-charcoal-stone/40 uppercase">
            Trip Folders ({collections.length})
          </span>

          <div className="flex flex-col gap-3">
            {collections.map((col, index) => {
              const isSelected = activeCollection === col.name;
              const isSynced = syncedCollections.includes(col.name);
              
              return (
                <div 
                  key={index}
                  onClick={() => setActiveCollection(col.name)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden bg-gradient-to-br shadow ${
                    isSelected 
                      ? `${col.color} border-tribal-terracotta shadow-md scale-[1.01]` 
                      : "from-white/70 to-white/30 border-white/50 hover:bg-white/90"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="font-sans font-bold text-sm sm:text-base text-forest-emerald">{col.name}</h3>
                      <span className="text-[10px] text-charcoal-stone/60 font-medium leading-relaxed mt-0.5">{col.desc}</span>
                    </div>

                    {collections.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(col.name);
                        }}
                        className="text-charcoal-stone/40 hover:text-red-600 transition-colors p-1"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-charcoal-stone/5 pt-3.5 mt-1">
                    <span className="text-[10px] font-mono font-bold text-forest-emerald/75 uppercase tracking-wider">
                      {col.places.length} Locations Saved
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isSynced ? (
                        <span className="text-[9px] font-mono font-bold text-green-700 bg-green-100/90 px-2 py-1 rounded-full uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-700" /> Offline Synced
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOfflineSync(col.name);
                          }}
                          disabled={offlineSyncing === col.name}
                          className="text-[9px] font-mono font-bold text-forest-emerald bg-forest-emerald/10 hover:bg-forest-emerald hover:text-sand-beige px-2 py-1 rounded-full uppercase flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                        >
                          <WifiOff className="w-3 h-3" /> Sync Offline
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sync progress bar */}
                  {offlineSyncing === col.name && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-charcoal-stone/5">
                      <div 
                        className="h-full bg-forest-emerald transition-all duration-300"
                        style={{ width: `${offlineProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SAVED SPOTS IN FOLDER */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold tracking-wider text-charcoal-stone/40 uppercase">
              Circuit Routes Inside: <strong className="text-forest-emerald font-sans font-bold">{activeCollection}</strong>
            </span>
            {syncedCollections.includes(activeCollection) && (
              <span className="text-xs font-mono text-green-700 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" /> Offline Cached Storage Active
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {savedPlaces.map((place) => (
              <div 
                key={place.id}
                className="glass-panel p-5 rounded-2xl border border-white/60 bg-white/70 shadow flex flex-col sm:flex-row gap-5 hover:scale-[1.005] transition-all"
              >
                {/* Photo cover */}
                <div className="w-full sm:w-36 h-28 bg-charcoal-stone rounded-xl overflow-hidden shrink-0 relative">
                  <img
                    src={place.heroImage}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 text-[8px] font-mono font-bold bg-white text-forest-emerald px-1.5 py-0.5 rounded-full uppercase">
                    {place.category}
                  </span>
                </div>

                {/* Body details */}
                <div className="flex flex-col gap-2 flex-1 justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h4 className="font-sans font-bold text-base text-forest-emerald leading-tight">{place.name}</h4>
                      <span className="text-[10px] font-mono text-tribal-terracotta uppercase font-bold mt-0.5">{place.district || "Bastar"} District</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">★ {place.rating}</span>
                  </div>

                  <p className="text-xs text-charcoal-stone/75 leading-relaxed italic mt-1 line-clamp-2">
                    &quot;{place.tagline}&quot;
                  </p>

                  <div className="flex flex-wrap items-center gap-3 border-t border-charcoal-stone/5 pt-3 mt-1.5 text-[9px] font-mono text-charcoal-stone/50">
                    <span className="flex items-center gap-0.5 text-forest-emerald font-bold">
                      <Volume2 className="w-3.5 h-3.5" /> Lore Audio Cached
                    </span>
                    <span className="flex items-center gap-0.5 text-river-blue font-bold">
                      <MapPin className="w-3.5 h-3.5" /> GIS Georeferenced
                    </span>
                    <Link
                      href={`/destination/${place.id}`}
                      className="ml-auto text-xs font-bold text-tribal-terracotta hover:underline inline-flex items-center gap-0.5"
                    >
                      Insights <Eye className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {savedPlaces.length === 0 && (
              <div className="text-center py-16 border border-dashed border-charcoal-stone/20 rounded-2xl bg-white/20 flex flex-col items-center justify-center gap-3 text-charcoal-stone/40">
                <Compass className="w-10 h-10 text-charcoal-stone/30 animate-spin-slow" />
                <span className="font-sans text-sm font-bold">No saved tracks in this circuit</span>
                <span className="text-xs max-w-xs leading-normal">Explore the active state vector map deck to save primordial waterfalls and heritage ruins to your trip folder!</span>
                <Link href="/explore" className="px-5 py-2.5 rounded-xl bg-forest-emerald text-sand-beige text-xs font-bold mt-2 hover:bg-emerald-800 transition-colors inline-flex items-center gap-1 shadow">
                  Open Interactive Map <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
