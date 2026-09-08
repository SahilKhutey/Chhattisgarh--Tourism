import { Capacitor } from '@capacitor/core';

export function isNativeMobile(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return Capacitor.isNativePlatform();
}

export function getPlatformName(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') {
    return 'web';
  }
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') {
    return platform;
  }
  return 'web';
}
