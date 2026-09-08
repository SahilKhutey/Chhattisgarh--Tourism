import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { isNativeMobile, getPlatformName } from './platform';
import { getNativeLocation, type GeoCoordinates } from './location';

export { isNativeMobile, getPlatformName, getNativeLocation, type GeoCoordinates };

export async function shareNativeContent(input: {
  title: string;
  text: string;
  url?: string;
}): Promise<void> {
  if (!isNativeMobile()) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share(input);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(
        `${input.title}\n${input.text}${input.url ? `\n${input.url}` : ''}`,
      );
    }
    return;
  }
  await Share.share({
    title: input.title,
    text: input.text,
    url: input.url,
    dialogTitle: 'Share CG Tourism',
  });
}

export async function getNativeNetworkState() {
  if (isNativeMobile()) {
    return Network.getStatus();
  }
  return {
    connected: typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true,
    connectionType: 'unknown' as const,
  };
}
