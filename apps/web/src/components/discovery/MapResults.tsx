'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DiscoveryResult } from '../../lib/discovery/types';

interface MapResultsProps {
  items: DiscoveryResult[];
  height?: string;
  onSelect?: (item: DiscoveryResult) => void;
}

export function MapResults({
  items,
  height = '500px',
  onSelect,
}: MapResultsProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter items that possess valid numeric coordinates
  const geoItems = items.filter(
    (item) =>
      typeof item.lat === 'number' &&
      typeof item.lng === 'number' &&
      !isNaN(item.lat) &&
      !isNaN(item.lng),
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.2514, 81.6296], // Chhattisgarh Centroid
        zoom: 7,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const customIcon = L.icon({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const bounds = L.latLngBounds([]);

    geoItems.forEach((item) => {
      const marker = L.marker([item.lat!, item.lng!], { icon: customIcon });

      const locationStr = [item.district, item.region].filter(Boolean).join(', ');

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
          <div style="font-size: 10px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 2px;">
            ${item.templateName}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #1c1917; margin-bottom: 4px;">
            ${item.title}
          </div>
          ${locationStr ? `<div style="color: #78716c; font-size: 11px; margin-bottom: 6px;">📍 ${locationStr}</div>` : ''}
          <div>
            <a href="/content/${item.templateSlug}/${item.slug}" style="color: #059669; font-weight: 600; text-decoration: underline;">
              View Details &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onSelect) {
        marker.on('click', () => onSelect(item));
      }

      layerGroup.addLayer(marker);
      bounds.extend([item.lat!, item.lng!]);
    });

    if (geoItems.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else {
      map.setView([21.2514, 81.6296], 7);
    }
  }, [geoItems, onSelect]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="z-10"
      />
      {geoItems.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-xs p-4 text-center">
          <p className="text-xs text-stone-500 font-medium">
            No geographic coordinates available for the current search results.
          </p>
        </div>
      )}
    </div>
  );
}

export default MapResults;
