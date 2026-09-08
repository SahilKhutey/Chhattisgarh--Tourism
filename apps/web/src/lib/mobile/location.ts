import { Geolocation } from '@capacitor/geolocation';
import { isNativeMobile } from './platform';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export async function getNativeLocation(): Promise<GeoCoordinates> {
  if (typeof window === 'undefined') {
    throw new Error('Location is unavailable during SSR.');
  }

  if (isNativeMobile()) {
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      if (requested.location !== 'granted') {
        throw new Error('Location permission denied.');
      }
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 30_000,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
  }

  return new Promise<GeoCoordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  });
}
