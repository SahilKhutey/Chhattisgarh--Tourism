"use client";

import React from "react";

export interface LegendItem {
  shape: string;
  symbol: string;
  label: string;
  color: string;
  description: string;
}

export const DEFAULT_LEGEND_ITEMS: LegendItem[] = [
  {
    shape: "diamond",
    symbol: "◆",
    label: "Destination",
    color: "#2D5A27",
    description: "Key tourist attraction or landmark",
  },
  {
    shape: "circle",
    symbol: "●",
    label: "Experience",
    color: "#0D9488",
    description: "Activity, wildlife, or craft center",
  },
  {
    shape: "star",
    symbol: "★",
    label: "Festival / Event",
    color: "#D97706",
    description: "Cultural celebration or fair",
  },
  {
    shape: "line",
    symbol: "━",
    label: "Corridor Route",
    color: "#C85A32",
    description: "Scenic road or curated circuit",
  },
  {
    shape: "ring",
    symbol: "⊙",
    label: "Service",
    color: "#475569",
    description: "Stay, food, or amenities",
  },
  {
    shape: "shield",
    symbol: "▣",
    label: "Safety / SOS",
    color: "#DC2626",
    description: "Medical, police, emergency post",
  },
];

export interface LayerLegendProps {
  className?: string;
  compact?: boolean;
}

export function LayerLegend({ className = "", compact = false }: LayerLegendProps) {
  return (
    <div
      aria-label="Map symbology legend"
      className={`rounded-xl border border-neutral-200/80 bg-white/95 p-3 shadow-md backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between border-b border-neutral-100 pb-1.5 dark:border-neutral-800">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Map Symbology
        </span>
      </div>

      <ul className={`grid gap-1.5 ${compact ? "grid-cols-2" : "grid-cols-1"}`} role="list">
        {DEFAULT_LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs">
            <span
              className="flex h-5 w-5 items-center justify-center font-bold text-sm leading-none"
              style={{ color: item.color }}
              aria-hidden="true"
            >
              {item.symbol}
            </span>
            <span className="font-medium text-foreground">{item.label}</span>
            {!compact && (
              <span className="ml-auto text-[10px] text-muted-foreground hidden sm:inline">
                {item.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
