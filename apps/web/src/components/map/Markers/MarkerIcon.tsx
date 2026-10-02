"use client";

import L from "leaflet";
import type { MapEntityType } from "@/core/ui/map/entities";
import { getMarkerCategoryShape } from "@/core/ui/map/markers";

export interface MarkerIconOptions {
  type: MapEntityType;
  label: string;
  isSelected?: boolean;
  priority?: number;
}

export function createTourismIcon({
  type,
  label,
  isSelected = false,
}: MarkerIconOptions): L.DivIcon {
  const shape = getMarkerCategoryShape(type);

  // Palette mapped to semantic tokens
  const colors: Record<MapEntityType, { primary: string; secondary: string }> = {
    place: { primary: "#2D5A27", secondary: "#1A3817" }, // Forest Emerald
    experience: { primary: "#0D9488", secondary: "#0F766E" }, // Teal
    event: { primary: "#D97706", secondary: "#B45309" }, // Amber
    service: { primary: "#475569", secondary: "#334155" }, // Slate
    safety: { primary: "#DC2626", secondary: "#991B1B" }, // Crimson
    guide: { primary: "#7C3AED", secondary: "#6D28D9" }, // Purple
    route: { primary: "#C85A32", secondary: "#9C4223" }, // Terracotta
    division: { primary: "#3B82F6", secondary: "#1D4ED8" },
    district: { primary: "#2563EB", secondary: "#1E40AF" },
    zone: { primary: "#059669", secondary: "#047857" },
  };

  const activeColor = isSelected ? "#C85A32" : colors[type]?.primary || "#2D5A27";
  const size = isSelected ? 40 : type === "place" ? 34 : 28;
  const half = size / 2;

  let shapeSvg = "";

  switch (shape) {
    case "diamond":
      shapeSvg = `
        <polygon 
          points="${half},3 ${size - 3},${half} ${half},${size - 3} 3,${half}" 
          fill="${activeColor}" 
          stroke="#FFFFFF" 
          stroke-width="2.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
        />
        <circle cx="${half}" cy="${half}" r="${size * 0.18}" fill="#FFFFFF" />
      `;
      break;

    case "shield":
      shapeSvg = `
        <path 
          d="M${half} 3 L${size - 4} 7 V${half} C${size - 4} ${size - 6} ${half} ${size - 2} ${half} ${size - 2} C${half} ${size - 2} 4 ${size - 6} 4 ${half} V7 Z" 
          fill="${activeColor}" 
          stroke="#FFFFFF" 
          stroke-width="2.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
        />
        <circle cx="${half}" cy="${half * 0.9}" r="${size * 0.16}" fill="#FFFFFF" />
      `;
      break;

    case "star":
      shapeSvg = `
        <polygon 
          points="${half},2 ${half * 1.3},${half * 0.7} ${size - 2},${half * 0.8} ${half * 1.45},${half * 1.3} ${half * 1.65},${size - 2} ${half},${half * 1.5} ${half * 0.35},${size - 2} ${half * 0.55},${half * 1.3} 2,${half * 0.8} ${half * 0.7},${half * 0.7}" 
          fill="${activeColor}" 
          stroke="#FFFFFF" 
          stroke-width="2"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
        />
      `;
      break;

    case "ring":
      shapeSvg = `
        <circle 
          cx="${half}" 
          cy="${half}" 
          r="${half - 3}" 
          fill="#FFFFFF" 
          stroke="${activeColor}" 
          stroke-width="3"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
        />
        <circle cx="${half}" cy="${half}" r="${half * 0.45}" fill="${activeColor}" />
      `;
      break;

    case "flag":
      shapeSvg = `
        <path 
          d="M6 ${size - 2} V4 L${size - 4} ${half * 0.7} L6 ${half * 1.3}" 
          fill="${activeColor}" 
          stroke="#FFFFFF" 
          stroke-width="2"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
        />
      `;
      break;

    case "circle":
    default:
      shapeSvg = `
        <circle 
          cx="${half}" 
          cy="${half}" 
          r="${half - 3}" 
          fill="${activeColor}" 
          stroke="#FFFFFF" 
          stroke-width="2.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
        />
        <circle cx="${half}" cy="${half}" r="${size * 0.18}" fill="#FFFFFF" />
      `;
      break;
  }

  const selectionPulse = isSelected
    ? `<div class="cg-marker-pulse" style="width: ${size + 14}px; height: ${size + 14}px; top: -7px; left: -7px; border: 2px solid ${activeColor}; border-radius: 9999px; position: absolute; pointer-events: none;"></div>`
    : "";

  const html = `
    <div 
      class="cg-marker-container relative flex items-center justify-center transition-transform hover:scale-110 focus:scale-110" 
      style="width: ${size}px; height: ${size}px;"
      role="button"
      tabindex="0"
      aria-label="${label}, ${type}"
    >
      ${selectionPulse}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 ${size} ${size}" 
        width="${size}" 
        height="${size}"
        class="${isSelected ? "cg-map-marker-selected" : ""}"
      >
        ${shapeSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: `cg-tourism-marker-icon ${isSelected ? "is-selected" : ""}`,
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half],
  });
}
