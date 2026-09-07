const memCache = new Map<string, string>();
const MAX_MEM_CACHE = 500;

function makeKey(text: string, source: string, target: string): string {
  return `${source.toLowerCase()}:${target.toLowerCase()}:${text.trim()}`;
}

export function getCachedTranslation(text: string, source: string, target: string): string | null {
  if (!text) return null;
  const key = makeKey(text, source, target);

  // 1. In-memory L1 cache
  if (memCache.has(key)) {
    return memCache.get(key)!;
  }

  // 2. LocalStorage L2 cache (browser only)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`cg_trans_${key}`);
      if (stored) {
        memCache.set(key, stored);
        return stored;
      }
    } catch {
      // Storage unavailable / quota exceeded
    }
  }

  return null;
}

export function setCachedTranslation(
  text: string,
  source: string,
  target: string,
  translated: string,
): void {
  if (!text || !translated) return;
  const key = makeKey(text, source, target);

  if (memCache.size >= MAX_MEM_CACHE) {
    const firstKey = memCache.keys().next().value;
    if (firstKey !== undefined) {
      memCache.delete(firstKey);
    }
  }
  memCache.set(key, translated);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cg_trans_${key}`, translated);
    } catch {
      // Storage unavailable / quota exceeded
    }
  }
}
