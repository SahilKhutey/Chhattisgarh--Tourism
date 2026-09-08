'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GenericMapProps {
  lat?: number | null;
  lng?: number | null;
  title?: string;
  zoom?: number;
  height?: string;
  geoJson?: any;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export const GenericMap: React.FC<GenericMapProps> = ({
  lat,
  lng,
  title,
  zoom = 10,
  height = '320px',
  geoJson,
  interactive = false,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default to Chhattisgarh centroid (Raipur) if no coordinates provided
  const centerLat = lat ?? 21.2514;
  const centerLng = lng ?? 81.6296;
  const hasPoint = lat !== null && lat !== undefined && lng !== null && lng !== undefined;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Fix leaflet marker icon paths
    const iconRetinaUrl =
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
    const iconUrl =
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
    const shadowUrl =
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

    const customIcon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add marker if coordinates present
    if (hasPoint) {
      const marker = L.marker([centerLat, centerLng], {
        icon: customIcon,
        draggable: interactive,
      }).addTo(map);

      if (title) {
        marker.bindPopup(`<strong>${title}</strong>`).openPopup();
      }

      if (interactive && onLocationSelect) {
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          onLocationSelect(
            Math.round(pos.lat * 1000000) / 1000000,
            Math.round(pos.lng * 1000000) / 1000000,
          );
        });
      }

      markerRef.current = marker;
    }

    // Handle map click when interactive
    if (interactive && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        const roundedLat = Math.round(clickLat * 1000000) / 1000000;
        const roundedLng = Math.round(clickLng * 1000000) / 1000000;

        if (markerRef.current) {
          markerRef.current.setLatLng([roundedLat, roundedLng]);
        } else {
          markerRef.current = L.marker([roundedLat, roundedLng], {
            icon: customIcon,
            draggable: true,
          }).addTo(map);
        }

        onLocationSelect(roundedLat, roundedLng);
      });
    }

    // Add GeoJSON layer if provided
    if (geoJson) {
      try {
        const layer = L.geoJSON(geoJson, {
          style: {
            color: '#059669',
            weight: 2,
            opacity: 0.8,
            fillColor: '#10b981',
            fillOpacity: 0.2,
          },
        }).addTo(map);

        map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      } catch (err) {
        console.warn('Failed to parse or render GeoJSON on map', err);
      }
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [centerLat, centerLng, hasPoint, title, zoom, geoJson, interactive]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-sm w-full">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      {interactive && (
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur px-2.5 py-1 rounded shadow-sm text-[10px] text-stone-600 font-medium">
          Click map or drag pin to choose coordinates
        </div>
      )}
    </div>
  );
};
export default GenericMap;
