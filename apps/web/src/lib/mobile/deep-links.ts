import { App } from '@capacitor/app';

export async function registerDeepLinkHandler(
  navigate: (url: string) => void,
) {
  if (typeof window === 'undefined') {
    return;
  }

  await App.addListener('appUrlOpen', ({ url }) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'cg-tourism:') {
        return;
      }
      const path = `${parsed.host}${parsed.pathname}`;
      navigate(`/${path}`);
    } catch {
      // Ignore malformed deep links.
    }
  });
}
