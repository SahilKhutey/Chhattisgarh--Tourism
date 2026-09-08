import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  getMobilePlatform,
  isNativeMobile,
  getCurrentLocation,
  getNetworkState,
  shareContent,
  saveLocalValue,
  readLocalValue,
} from '../src/mobile-runtime';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'android'),
    isNativePlatform: vi.fn(() => true),
  },
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn(),
  },
}));

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn(),
  },
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  },
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
  },
}));

describe('mobile runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects Android platform', () => {
    expect(getMobilePlatform()).toBe('android');
    expect(isNativeMobile()).toBe(true);
  });

  it('detects iOS platform', () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValueOnce('ios');
    expect(getMobilePlatform()).toBe('ios');
  });

  it('detects web fallback platform', () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValueOnce('web');
    expect(getMobilePlatform()).toBe('web');
  });

  it('retrieves current high-accuracy coordinates', async () => {
    vi.mocked(Geolocation.checkPermissions).mockResolvedValueOnce({
      location: 'granted',
      coarseLocation: 'granted',
    });
    vi.mocked(Geolocation.getCurrentPosition).mockResolvedValueOnce({
      coords: {
        latitude: 21.25,
        longitude: 81.63,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 123456789,
    });

    const pos = await getCurrentLocation();
    expect(pos.latitude).toBe(21.25);
    expect(pos.longitude).toBe(81.63);
  });

  it('throws error if location permission is denied', async () => {
    vi.mocked(Geolocation.checkPermissions).mockResolvedValueOnce({
      location: 'denied',
      coarseLocation: 'denied',
    });
    vi.mocked(Geolocation.requestPermissions).mockResolvedValueOnce({
      location: 'denied',
      coarseLocation: 'denied',
    });

    await expect(getCurrentLocation()).rejects.toThrow('Location permission was not granted.');
  });

  it('retrieves network status', async () => {
    vi.mocked(Network.getStatus).mockResolvedValueOnce({
      connected: true,
      connectionType: 'wifi',
    });

    const net = await getNetworkState();
    expect(net.connected).toBe(true);
    expect(net.connectionType).toBe('wifi');
  });

  it('invokes native share sheet', async () => {
    await shareContent('Chitrakote Falls', 'Niagara of India', 'https://cgtourism.com/chitrakote');
    expect(Share.share).toHaveBeenCalledWith({
      title: 'Chitrakote Falls',
      text: 'Niagara of India',
      url: 'https://cgtourism.com/chitrakote',
      dialogTitle: 'Share CG Tourism',
    });
  });

  it('persists and retrieves local preferences', async () => {
    await saveLocalValue('theme', 'dark');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'theme', value: 'dark' });

    vi.mocked(Preferences.get).mockResolvedValueOnce({ value: 'dark' });
    const val = await readLocalValue('theme');
    expect(val).toBe('dark');
  });
});
