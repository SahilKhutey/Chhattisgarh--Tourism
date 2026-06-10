"use client";

import { useEffect, useState } from "react";
import { fetchPendingDiscoveries, approvePlace, Destination } from "../../data/api";
import { Check, X, Compass, MapPin } from "lucide-react";
import Image from "@/components/ui/NativeImage";

export default function DiscoveriesPage() {
  const [places, setPlaces] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDiscoveries().then(data => {
      setPlaces(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id: string, level: string) => {
    try {
      await approvePlace(id, level);
      setPlaces(places.filter(p => p.id !== id));
    } catch (e) {
      alert("Failed to approve place");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Compass className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-medium text-white tracking-tight">AI Discoveries Queue</h1>
          <p className="text-slate-400 text-sm">Review locations automatically identified by the Discovery Engine.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-teal-500 animate-pulse">Loading queue...</div>
      ) : places.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
          <Compass className="w-12 h-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Queue Empty</h3>
          <p className="text-slate-500 text-sm mt-1">The ATIS Discovery Engine has not found any new unverified nodes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {places.map((place) => (
            <div key={place.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-slate-800">
                <Image src={place.heroImage} alt={place.name} fill className="object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4 bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/30 font-medium backdrop-blur-md">
                  AI ESTIMATED (CONFIDENCE: 78%)
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-medium text-white mb-1">{place.name}</h3>
                <div className="flex items-center text-slate-400 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {place.district} • Detected via Instagram Clustering
                </div>
                <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">
                  {place.tagline}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button 
                    onClick={() => handleApprove(place.id, 'COMMUNITY')}
                    className="flex items-center justify-center py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium transition-colors border border-emerald-500/20">
                    <Check className="w-4 h-4 mr-2" />
                    Approve as Community
                  </button>
                  <button 
                    onClick={() => handleApprove(place.id, 'REJECTED')}
                    className="flex items-center justify-center py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-medium transition-colors border border-rose-500/20">
                    <X className="w-4 h-4 mr-2" />
                    Reject (False Positive)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

