import React from 'react';

interface TransportProps {
  nearestAirport?: string;
  airportDistance?: number;
  nearestStation?: string;
  dynamicRoutes?: any[];
}

export function TransitOverviewCard({ transport }: { transport?: TransportProps }) {
  if (!transport || (!transport.nearestAirport && !transport.nearestStation)) return null;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col gap-6 w-full mt-4">
      <h3 className="text-xl font-bold text-white mb-2">Getting There</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transport.nearestAirport && (
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <p className="text-white/60 text-sm">Nearest Airport</p>
              <p className="text-white font-medium">{transport.nearestAirport}</p>
              {transport.airportDistance && (
                <p className="text-emerald-400 text-sm mt-1">{transport.airportDistance} km away</p>
              )}
            </div>
          </div>
        )}

        {transport.nearestStation && (
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-white/60 text-sm">Nearest Railway Station</p>
              <p className="text-white font-medium">{transport.nearestStation}</p>
            </div>
          </div>
        )}
      </div>

      {transport.dynamicRoutes && transport.dynamicRoutes.length > 0 && (
        <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5">
          <p className="text-white/80 text-sm mb-2">Live Route Estimations (Mapbox):</p>
          {transport.dynamicRoutes.map((route, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-emerald-300">{route.destination}</span>
              <span className="text-white font-mono">{route.durationMins} mins driving</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
