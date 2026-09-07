import {
  isExpired,
  shouldReplaceCache,
  formatCacheAge,
  CACHE_TTL,
} from "@/lib/offline/cache";

describe("Offline Cache TTL & Age Utilities", () => {
  test("isExpired returns false for fresh timestamp within TTL", () => {
    const now = new Date().toISOString();
    expect(isExpired(now, CACHE_TTL.places)).toBe(false);
  });

  test("isExpired returns true for timestamp older than TTL", () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    expect(isExpired(twoDaysAgo, CACHE_TTL.places)).toBe(true);
  });

  test("isExpired handles invalid timestamp safely", () => {
    expect(isExpired("invalid-date", CACHE_TTL.places)).toBe(true);
  });

  test("shouldReplaceCache prioritizes newer updatedAt over older local timestamp", () => {
    const older = "2026-09-01T10:00:00.000Z";
    const newer = "2026-09-02T10:00:00.000Z";

    expect(shouldReplaceCache(newer, older)).toBe(true);
    expect(shouldReplaceCache(older, newer)).toBe(false);
  });

  test("formatCacheAge produces human readable relative time", () => {
    const justNow = new Date().toISOString();
    expect(formatCacheAge(justNow)).toBe("just now");

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(formatCacheAge(tenMinutesAgo)).toBe("10 min ago");

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatCacheAge(twoHoursAgo)).toBe("2 hours ago");

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatCacheAge(threeDaysAgo)).toBe("3 days ago");
  });
});
