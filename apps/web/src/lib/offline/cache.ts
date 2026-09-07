export const CACHE_TTL = {
  places: 24 * 60 * 60 * 1000,       // 24 hours
  destinations: 24 * 60 * 60 * 1000, // 24 hours
  itineraries: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export function isExpired(cachedAt: string, ttl: number): boolean {
  const timestamp = new Date(cachedAt).getTime();
  if (isNaN(timestamp)) {
    return true;
  }
  return Date.now() - timestamp > ttl;
}

export function shouldReplaceCache(serverUpdatedAt: string, localUpdatedAt: string): boolean {
  const serverTime = new Date(serverUpdatedAt).getTime();
  const localTime = new Date(localUpdatedAt).getTime();
  if (isNaN(serverTime) || isNaN(localTime)) {
    return true;
  }
  return serverTime > localTime;
}

export function formatCacheAge(cachedAt: string): string {
  const timestamp = new Date(cachedAt).getTime();
  if (isNaN(timestamp)) return "recently";
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}
