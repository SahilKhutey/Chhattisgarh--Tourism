"use client";

import { useEffect, useRef } from "react";
import type { Destination } from "../app/data/destinations";

export type MapLayer = "satellite" | "terrain" | "hybrid" | "eco" | "cultural";

interface Props {
  destinations: Destination[];
  creatorSpots: { name: string; lat: number; lng: number }[];
  activeLayer: MapLayer;
  selectedId: string | null;
  onSelectDestination: (id: string) => void;
  onZoomChange?: (zoom: number) => void;
}

// ── CG bounding box ─────────────────────────────────────────────────────────
const CG_BOUNDS: [[number,number],[number,number]] = [[17.78, 80.25],[24.10, 84.40]];
const CG_CENTER: [number, number] = [20.5, 81.85];

// ── Tile sources ────────────────────────────────────────────────────────────
const TILES = {
  satellite: {
    base:   "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attr:   "Tiles © Esri — Source: Esri, Maxar, GeoEye, Earthstar Geographics",
    maxZoom: 19,
  },
  terrain: {
    base:   "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    labels: null,
    attr:   "Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap (CC-BY-SA)",
    maxZoom: 17,
  },
  hybrid: {
    base:   "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    attr:   "Tiles © Esri",
    maxZoom: 19,
  },
  eco: {
    base:   "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    labels: "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attr:   "Tiles © Esri",
    maxZoom: 13,
  },
  cultural: {
    base:   "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    labels: null,
    attr:   "© OpenStreetMap contributors",
    maxZoom: 19,
  },
};

// ── Marker colours per layer ────────────────────────────────────────────────
const PIN: Record<MapLayer, { bg: string; border: string; text: string }> = {
  satellite: { bg: "#0A3622", border: "#E67E22", text: "#fff" },
  terrain:   { bg: "#15803d", border: "#86efac", text: "#fff" },
  hybrid:    { bg: "#1A5E7A", border: "#7dd3fc", text: "#fff" },
  eco:       { bg: "#166534", border: "#4ade80", text: "#fff" },
  cultural:  { bg: "#7c3aed", border: "#c4b5fd", text: "#fff" },
};

// ── Category icons (emoji, no external deps) ────────────────────────────────
const CAT_ICON: Record<string, string> = {
  waterfalls: "💧", forests: "🌿", temples: "🛕", villages: "🏘️",
};

// ── Chhattisgarh district data ──────────────────────────────────────────────
const CG_DISTRICTS = [
  { name: "Raipur",         lat: 21.2514, lng: 81.6296, pop: "1.4M", area: "13,083 km²" },
  { name: "Bastar",         lat: 19.0748, lng: 81.9500, pop: "1.41M", area: "39,114 km²" },
  { name: "Bilaspur",       lat: 22.0796, lng: 82.1391, pop: "2.66M", area: "19,394 km²" },
  { name: "Surguja",        lat: 23.1164, lng: 83.2028, pop: "2.36M", area: "23,131 km²" },
  { name: "Durg",           lat: 21.1904, lng: 81.2849, pop: "3.34M", area: "8,702 km²" },
  { name: "Rajnandgaon",    lat: 21.0967, lng: 80.7033, pop: "1.52M", area: "8,228 km²" },
  { name: "Korba",          lat: 22.3595, lng: 82.7501, pop: "1.21M", area: "7,145 km²" },
  { name: "Raigarh",        lat: 21.8974, lng: 83.3950, pop: "1.49M", area: "7,086 km²" },
  { name: "Jashpur",        lat: 22.8850, lng: 84.1388, pop: "0.85M", area: "6,205 km²" },
  { name: "Kabirdham",      lat: 22.0159, lng: 81.2322, pop: "0.82M", area: "4,447 km²" },
  { name: "Dantewada",      lat: 18.8960, lng: 81.3480, pop: "0.28M", area: "3,410 km²" },
  { name: "Kanker",         lat: 20.2705, lng: 81.4938, pop: "0.75M", area: "5,284 km²" },
  { name: "Narayanpur",     lat: 19.7046, lng: 81.2386, pop: "0.14M", area: "7,624 km²" },
  { name: "Kondagaon",      lat: 19.5960, lng: 81.6630, pop: "0.58M", area: "7,768 km²" },
  { name: "Sukma",          lat: 18.3934, lng: 81.6601, pop: "0.25M", area: "5,660 km²" },
  { name: "Bijapur",        lat: 18.8272, lng: 80.2519, pop: "0.26M", area: "6,562 km²" },
  { name: "Mahasamund",     lat: 21.1108, lng: 82.0966, pop: "0.99M", area: "4,967 km²" },
  { name: "Balod",          lat: 20.7363, lng: 81.2065, pop: "0.83M", area: "3,527 km²" },
  { name: "Gariaband",      lat: 20.6317, lng: 82.0671, pop: "0.60M", area: "5,823 km²" },
  { name: "Mungeli",        lat: 22.0726, lng: 81.6851, pop: "0.70M", area: "2,667 km²" },
];

// ── Approx CG state boundary polygon ───────────────────────────────────────
const CG_BOUNDARY: [number,number][] = [
  [24.08,80.24],[24.10,80.72],[24.31,81.05],[24.32,81.59],[24.11,81.99],
  [24.04,82.34],[23.89,82.72],[23.82,83.12],[23.46,83.54],[23.23,83.57],
  [22.78,83.66],[22.42,83.62],[21.88,83.30],[21.58,83.07],[21.32,83.41],
  [20.82,83.02],[20.42,82.52],[20.10,82.31],[19.82,82.13],[19.45,82.04],
  [19.22,82.00],[18.72,81.72],[18.44,81.46],[18.25,81.21],[17.88,80.92],
  [17.79,80.42],[17.99,79.90],[18.38,79.70],[18.63,79.71],[18.95,79.92],
  [19.47,80.19],[19.89,80.12],[20.27,79.91],[20.56,79.86],[20.83,80.13],
  [21.05,80.51],[21.39,80.29],[21.70,80.10],[21.96,79.99],[22.47,80.14],
  [22.89,80.40],[23.18,80.36],[23.53,80.49],[23.79,80.19],[24.08,80.24],
];

// ── Hillshade overlay URL (free ESRI) ───────────────────────────────────────
const HILLSHADE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}";

function buildPopupHTML(dest: Destination, pinColor: string): string {
  const catEmoji = CAT_ICON[dest.category] || "📍";
  return `
<div style="font-family:Inter,sans-serif;min-width:260px;border-radius:14px;overflow:hidden;">
  <div style="position:relative;height:130px;overflow:hidden;">
    <img src="${dest.heroImage}" alt="${dest.name}"
      style="width:100%;height:100%;object-fit:cover;"
      onerror="this.src='https://images.unsplash.com/photo-1448375240586-882707db888b?w=500'"/>
    <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%);"></div>
    <div style="position:absolute;bottom:10px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:flex-end;">
      <span style="font-size:18px;">${catEmoji}</span>
      <span style="background:rgba(255,255,255,0.95);color:#92400e;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;">★ ${dest.rating}</span>
    </div>
  </div>
  <div style="padding:14px 15px 15px;background:#fff;">
    <h3 style="margin:0 0 3px;font-size:15px;font-weight:800;color:#0A3622;line-height:1.2;">${dest.name}</h3>
    <p style="margin:0 0 10px;font-size:11px;color:#6b7280;line-height:1.5;font-style:italic;">"${dest.tagline}"</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <div style="background:#f8f6f2;border-radius:8px;padding:7px 9px;">
        <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Best Time</div>
        <div style="font-size:10px;font-weight:600;color:#374151;">${dest.bestTime.split("(")[0].trim().split(";")[0].trim()}</div>
      </div>
      <div style="background:#f8f6f2;border-radius:8px;padding:7px 9px;">
        <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Capacity</div>
        <div style="font-size:10px;font-weight:600;color:#374151;">${dest.crowdCapacity} visitors/day</div>
      </div>
      <div style="background:#f8f6f2;border-radius:8px;padding:7px 9px;">
        <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Biodiversity</div>
        <div style="font-size:10px;font-weight:600;color:#15803d;">${dest.biodiversityScore}/100</div>
      </div>
      <div style="background:#f8f6f2;border-radius:8px;padding:7px 9px;">
        <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">District</div>
        <div style="font-size:10px;font-weight:600;color:#374151;">${dest.district || "Chhattisgarh"}</div>
      </div>
    </div>
    <div style="background:#fef3c7;border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:10px;color:#92400e;">
      <strong>🍽 Local Food:</strong> ${dest.localFood.split(",")[0]}
    </div>
    <div style="font-size:10px;color:#6b7280;margin-bottom:12px;padding:8px 10px;background:#f0fdf4;border-radius:8px;border-left:3px solid #16a34a;">
      <strong style="color:#15803d;">🌿 Eco Tip:</strong> ${dest.ecoGuidance.split(".")[0]}.
    </div>
    <div style="display:flex;gap:8px;">
      <a href="/destination/${dest.id}" style="flex:1;display:block;text-align:center;background:${pinColor};color:#fff;font-size:11px;font-weight:700;padding:9px;border-radius:9px;text-decoration:none;">
        Full Details →
      </a>
      <a href="/planner" style="display:block;text-align:center;background:#f3f4f6;color:#374151;font-size:11px;font-weight:700;padding:9px 12px;border-radius:9px;text-decoration:none;">
        Plan Trip
      </a>
    </div>
  </div>
</div>`;
}

function buildDistrictPopup(d: typeof CG_DISTRICTS[0]): string {
  return `
<div style="font-family:Inter,sans-serif;padding:12px 14px;min-width:180px;">
  <div style="font-size:8px;font-weight:700;color:#B25329;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Chhattisgarh District</div>
  <h4 style="margin:0 0 8px;font-size:15px;font-weight:800;color:#0A3622;">${d.name}</h4>
  <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#4b5563;">
    <div>👥 Population: <strong>${d.pop}</strong></div>
    <div>📐 Area: <strong>${d.area}</strong></div>
  </div>
</div>`;
}

export default function EarthMap({
  destinations, creatorSpots, activeLayer, selectedId,
  onSelectDestination, onZoomChange,
}: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<{ L: typeof import('leaflet'); map: import('leaflet').Map } | null>(null);
  const layerRefs     = useRef<{ base: import('leaflet').TileLayer | null; labels: import('leaflet').TileLayer | null; hillshade: import('leaflet').TileLayer | null }>({ base: null, labels: null, hillshade: null });
  const pinLayerRef   = useRef<import('leaflet').LayerGroup | null>(null);
  const distLayerRef  = useRef<import('leaflet').LayerGroup | null>(null);

  // ── Mount map once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;
    if (!containerRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;
      
      // Strict Mode protection: if async import resolves after another instance initialized
      const container = containerRef.current as HTMLDivElement & { _leaflet_id?: boolean };
      if (container._leaflet_id) return;

      delete (L.Icon.Default.prototype as L.Icon.Default & Record<string, unknown>)._getIconUrl;

      const map = L.map(containerRef.current, {
        center: CG_CENTER,
        zoom: 7,
        minZoom: 6,
        maxZoom: 19,
        maxBounds: [
          [17.0, 79.5],
          [24.5, 84.5]
        ],
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      });

      // Zoom control — bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Attribution — bottom left
      map.attributionControl.setPrefix("CG Tourism OS");

      // Zoom change callback
      map.on("zoomend", () => onZoomChange?.(map.getZoom()));

      // ── Initial tile layers ───────────────────────────────────────────────
      const cfg = TILES[activeLayer];
      const baseLayer = L.tileLayer(cfg.base, { maxZoom: cfg.maxZoom, attribution: cfg.attr });
      baseLayer.addTo(map);

      // Hillshade overlay (satellite / hybrid modes only, 35% opacity)
      const hillshade = L.tileLayer(HILLSHADE_URL, { maxZoom: 13, opacity: 0.35 });
      if (activeLayer === "satellite" || activeLayer === "hybrid") hillshade.addTo(map);

      // Labels overlay
      const labelsLayer = cfg.labels
        ? L.tileLayer(cfg.labels, { maxZoom: 19, opacity: 0.9, pane: "shadowPane" })
        : null;
      if (labelsLayer) labelsLayer.addTo(map);

      layerRefs.current = { base: baseLayer, labels: labelsLayer, hillshade };

      // ── CG state boundary ─────────────────────────────────────────────────
      L.polygon(CG_BOUNDARY, {
        color: "#E67E22", weight: 2, opacity: 0.8,
        fillColor: "#0A3622", fillOpacity: 0.0,
        dashArray: "8 5",
      }).addTo(map);

      // Outer glow effect (subtle)
      L.polygon(CG_BOUNDARY, {
        color: "#E67E22", weight: 8, opacity: 0.08,
        fillColor: "transparent", fillOpacity: 0,
      }).addTo(map);

      // ── District layer group ──────────────────────────────────────────────
      const distGroup = L.layerGroup();
      CG_DISTRICTS.forEach((d) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:rgba(10,54,34,0.82);backdrop-filter:blur(4px);
            color:#F4EBE1;font-size:9px;font-weight:700;
            letter-spacing:0.8px;text-transform:uppercase;
            padding:3px 7px;border-radius:20px;
            border:1px solid rgba(230,126,34,0.5);
            white-space:nowrap;pointer-events:auto;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          ">${d.name}</div>`,
          iconAnchor: [0, 0],
        });
        L.marker([d.lat, d.lng], { icon, interactive: true, zIndexOffset: -500 })
          .bindPopup(buildDistrictPopup(d), { maxWidth: 220, className: "cg-popup" })
          .addTo(distGroup);
      });
      distGroup.addTo(map);
      distLayerRef.current = distGroup;

      // ── Show/hide district labels based on zoom ───────────────────────────
      map.on("zoomend", () => {
        const z = map.getZoom();
        if (z >= 9) { distGroup.remove(); }
        else        { distGroup.addTo(map); }
      });

      mapRef.current = { L, map };

      // Initial pins
      renderDestinationPins(L, map, destinations, creatorSpots, activeLayer, selectedId, onSelectDestination, pinLayerRef);
    });

    return () => {
      mapRef.current?.map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Swap tile layers when activeLayer changes ─────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const { L, map } = mapRef.current;
    const { base, labels, hillshade } = layerRefs.current;
    const cfg = TILES[activeLayer];

    // Remove old layers
    if (base)     map.removeLayer(base);
    if (labels)   map.removeLayer(labels);

    // Add new base
    const newBase = L.tileLayer(cfg.base, { maxZoom: cfg.maxZoom, attribution: cfg.attr });
    newBase.addTo(map);

    // Hillshade toggle
    if (activeLayer === "satellite" || activeLayer === "hybrid") { hillshade?.addTo(map); }
     else { if (hillshade) { map.removeLayer(hillshade); } }

    // Labels
    const newLabels = cfg.labels
      ? L.tileLayer(cfg.labels, { maxZoom: 19, opacity: 0.9 })
      : null;
    if (newLabels) newLabels.addTo(map);

    layerRefs.current = { base: newBase, labels: newLabels, hillshade };
  }, [activeLayer]);

  // ── Re-render pins on change ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const { L, map } = mapRef.current;
    renderDestinationPins(L, map, destinations, creatorSpots, activeLayer, selectedId, onSelectDestination, pinLayerRef);
  }, [activeLayer, selectedId, destinations, creatorSpots, onSelectDestination]);

  // ── Fly to selected destination ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const dest = destinations.find((d) => d.id === selectedId);
    if (!dest) return;
    mapRef.current.map.flyTo(
      [dest.coordinates.lat, dest.coordinates.lng],
      14,
      { animate: true, duration: 1.4, easeLinearity: 0.25 }
    );
  }, [selectedId, destinations]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: 500 }} />
  );
}

// ── Pin renderer ─────────────────────────────────────────────────────────────
function renderDestinationPins(
  L: typeof import('leaflet'), map: import('leaflet').Map,
  destinations: Destination[],
  creatorSpots: { name: string; lat: number; lng: number }[],
  layer: MapLayer,
  selectedId: string | null,
  onSelect: (id: string) => void,
  pinLayerRef: React.MutableRefObject<import('leaflet').LayerGroup | null>,
) {
  // Clear previous pin group
  if (pinLayerRef.current) map.removeLayer(pinLayerRef.current);
  const group = L.layerGroup();
  const { bg, border } = PIN[layer];

  destinations.forEach((dest) => {
    const sel  = dest.id === selectedId;
    const size = sel ? 46 : 38;
    const catEmoji = (CAT_ICON as Record<string, string>)[dest.category] || "📍";

    const icon = L.divIcon({
      className: "",
      html: `
        <div style="
          position:relative;width:${size}px;height:${size + 12}px;
          filter:${sel ? `drop-shadow(0 6px 16px ${border}88)` : "drop-shadow(0 3px 6px rgba(0,0,0,0.35))"};
        ">
          <div style="
            width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
            background:linear-gradient(135deg,${sel ? border : bg} 0%,${bg} 100%);
            border:${sel ? 3 : 2}px solid ${border};
            transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:${sel ? `0 0 0 4px ${border}40` : "none"};
          ">
            <span style="transform:rotate(45deg);font-size:${sel ? 16 : 13}px;">${catEmoji}</span>
          </div>
          ${sel ? `<div style="
            position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
            background:${bg};color:#fff;font-size:8px;font-weight:700;
            padding:2px 6px;border-radius:10px;white-space:nowrap;
            border:1px solid ${border};
          ">${dest.name.split(" ")[0]}</div>` : ""}
        </div>`,
      iconSize:    [size, size + 12],
      iconAnchor:  [size / 2, size + 12],
      popupAnchor: [0, -(size + 12)],
    });

    const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng], {
      icon, zIndexOffset: sel ? 2000 : 0,
    });

    marker.bindPopup(buildPopupHTML(dest, bg), { maxWidth: 300, className: "cg-popup" });
    marker.on("click", () => onSelect(dest.id));

    if (sel) { setTimeout(() => marker.openPopup(), 300); }
    marker.addTo(group);
  });

  // Creator spots
  creatorSpots.forEach((spot) => {
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        width:34px;height:34px;border-radius:50%;
        background:linear-gradient(135deg,#E67E22,#B25329);
        border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        font-size:15px;
      ">✦</div>`,
      iconSize: [34, 34], iconAnchor: [17, 34],
    });
    L.marker([spot.lat, spot.lng], { icon, zIndexOffset: 800 })
      .bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:10px 12px;">
          <div style="font-size:8px;font-weight:700;color:#B25329;text-transform:uppercase;letter-spacing:1px;">Creator Submission</div>
          <h4 style="margin:4px 0 0;font-size:14px;color:#0A3622;font-weight:800;">${spot.name}</h4>
          <p style="margin:4px 0 0;font-size:10px;color:#6b7280;">Pending admin approval</p>
        </div>`, { maxWidth: 220 })
      .addTo(group);
  });

  group.addTo(map);
  pinLayerRef.current = group;
}
