import React, { useState } from "react";

export interface GeoMapPoint {
  id: string;
  name: string;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
  tourism_type: string;
  validation_status: string;
}

export interface GeoMapEdge {
  source: string;
  target: string;
  type: string;
  status: string;
  distance_km?: number | null;
}

export interface GeoValidationMapProps {
  destinations: GeoMapPoint[];
  relationships?: GeoMapEdge[];
  onSelectDestination?: (dest: GeoMapPoint) => void;
  selectedDestinationId?: string;
}

export function GeoValidationMap({
  destinations,
  relationships = [],
  onSelectDestination,
  selectedDestinationId,
}: GeoValidationMapProps) {
  const [activeNode, setActiveNode] = useState<GeoMapPoint | null>(null);

  // Geographic bounds default centered on Chhattisgarh (lat ~17.5 to 24.0, lon ~80.0 to 84.5)
  // Or for Bastar pilot: lat ~18.5 to 20.0, lon ~81.0 to 82.5
  const lats = destinations.map((d) => d.latitude).filter((l): l is number => typeof l === "number");
  const lons = destinations.map((d) => d.longitude).filter((l): l is number => typeof l === "number");

  const minLat = lats.length > 0 ? Math.min(...lats) - 0.15 : 18.7;
  const maxLat = lats.length > 0 ? Math.max(...lats) + 0.15 : 19.4;
  const minLon = lons.length > 0 ? Math.min(...lons) - 0.2 : 81.2;
  const maxLon = lons.length > 0 ? Math.max(...lons) + 0.2 : 82.2;

  const latSpan = maxLat - minLat || 1;
  const lonSpan = maxLon - minLon || 1;

  // Convert lat/lon to SVG viewBox coordinate (500 x 380)
  const project = (lat?: number | null, lon?: number | null, idx: number = 0) => {
    if (lat == null || lon == null) {
      // Fallback deterministic pseudo-position
      const angle = (idx / (destinations.length || 1)) * 2 * Math.PI;
      return {
        x: 250 + 160 * Math.cos(angle),
        y: 190 + 120 * Math.sin(angle),
      };
    }
    const x = 40 + ((lon - minLon) / lonSpan) * 420;
    // Invert Y because latitude increases northward (upward)
    const y = 340 - ((lat - minLat) / latSpan) * 280;
    return { x, y };
  };

  const getTourismColor = (type: string) => {
    switch (type) {
      case "WATERFALL":
        return "#0284c7"; // Sky 600
      case "HERITAGE":
        return "#b45309"; // Amber 700
      case "WILDLIFE":
        return "#15803d"; // Green 700
      case "CULTURE":
        return "#7e22ce"; // Purple 700
      case "TEMPLE":
        return "#c2410c"; // Orange 700
      default:
        return "#475569"; // Slate 600
    }
  };

  const handleNodeClick = (dest: GeoMapPoint) => {
    setActiveNode(dest);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Geographic Relationship Map</h3>
          <p className="text-xs text-slate-500">
            Interactive Spatial Cluster & Corridor Visualizer (Bastar Pilot Zone)
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
            <span className="text-slate-600">Waterfall</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-700 inline-block"></span>
            <span className="text-slate-600">Wildlife</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-700 inline-block"></span>
            <span className="text-slate-600">Heritage</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-700 inline-block"></span>
            <span className="text-slate-600">Temple</span>
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-80 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
        <svg viewBox="0 0 500 380" className="w-full h-full">
          {/* Subtle grid background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="500" height="380" fill="url(#grid)" />

          {/* Render Relationship Lines */}
          {relationships.map((rel, idx) => {
            const srcIdx = destinations.findIndex((d) => d.id === rel.source);
            const tgtIdx = destinations.findIndex((d) => d.id === rel.target);
            const srcPoint = destinations[srcIdx];
            const tgtPoint = destinations[tgtIdx];
            if (!srcPoint || !tgtPoint) return null;

            const p1 = project(srcPoint.latitude, srcPoint.longitude, srcIdx);
            const p2 = project(tgtPoint.latitude, tgtPoint.longitude, tgtIdx);

            return (
              <line
                key={`edge-${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={rel.status === "VALIDATED" ? "#10b981" : "#64748b"}
                strokeWidth={rel.type === "SAME_TRIP_CLUSTER" ? "2.5" : "1.5"}
                strokeDasharray={rel.type === "ALONG_ROUTE" ? "4 3" : undefined}
                strokeOpacity="0.7"
              />
            );
          })}

          {/* Render Destination Nodes */}
          {destinations.map((dest, idx) => {
            const pt = project(dest.latitude, dest.longitude, idx);
            const isSelected =
              selectedDestinationId === dest.id || activeNode?.id === dest.id;
            const nodeColor = getTourismColor(dest.tourism_type);

            return (
              <g
                key={dest.id}
                onClick={() => handleNodeClick(dest)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="14"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="7"
                  fill={nodeColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="600"
                  className="select-none pointer-events-none drop-shadow"
                >
                  {dest.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating node info card */}
        {activeNode && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700 text-white rounded p-3 text-xs space-y-1 shadow-lg max-w-xs">
            <div className="font-bold text-sm text-emerald-400">{activeNode.name}</div>
            <div className="text-slate-300">
              {activeNode.district} &bull; {activeNode.tourism_type}
            </div>
            <div className="text-slate-400 font-mono text-[10px]">
              Coord: {activeNode.latitude?.toFixed(4)}, {activeNode.longitude?.toFixed(4)}
            </div>
            <div className="pt-1 text-[11px] text-slate-300">
              Status: <span className="font-semibold text-emerald-300">{activeNode.validation_status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
