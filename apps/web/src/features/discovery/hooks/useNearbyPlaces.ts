"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchNearbyPlaces, DiscoveryPlace } from '../api/discovery-api';

// Raipur coordinates as default Chhattisgarh center fallback
const DEFAULT_CENTER = {
  latitude: 21.2514,
  longitude: 81.6296,
};

export function useNearbyPlaces(initialRadius = 25000) {
  const [radius, setRadius] = useState(initialRadius);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [places, setPlaces] = useState<DiscoveryPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const detectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation(DEFAULT_CENTER);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setPermissionState('granted');
        setLoading(false);
      },
      () => {
        setError('Location access was denied or timed out. Showing places around Raipur.');
        setLocation(DEFAULT_CENTER);
        setPermissionState('denied');
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    if (!location) return;

    let isMounted = true;
    setLoading(true);

    fetchNearbyPlaces({
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
      limit: 30,
    })
      .then((data) => {
        if (isMounted) {
          setPlaces(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load nearby places');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location, radius]);

  return {
    location,
    radius,
    setRadius,
    places,
    loading,
    error,
    permissionState,
    detectLocation,
  };
}
