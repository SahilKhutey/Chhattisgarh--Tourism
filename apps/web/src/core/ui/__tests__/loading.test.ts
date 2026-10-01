import { loadingPolicy } from "@/core/ui/loading/policies";
import {
  resolveLoadingState,
  transitionLoadingState,
  isInitialLoading,
  isRefreshing,
  canShowCachedData,
} from "@/core/ui/loading/states";

describe("Loading Contracts & Policies", () => {
  describe("loadingPolicy", () => {
    it("defines valid UX thresholds without artificial delays", () => {
      expect(loadingPolicy.minimumBlockingDuration).toBeGreaterThan(0);
      expect(loadingPolicy.skeletonThreshold).toBeGreaterThan(0);
      expect(loadingPolicy.slowNetworkThreshold).toBeGreaterThan(loadingPolicy.skeletonThreshold);
      expect(loadingPolicy.longRunningThreshold).toBeGreaterThan(loadingPolicy.slowNetworkThreshold);
    });
  });

  describe("resolveLoadingState", () => {
    it("returns offline when offline and no data exists", () => {
      const state = resolveLoadingState({ isOffline: true, hasData: false });
      expect(state).toBe("offline");
    });

    it("returns error when fetch failed and no cached data exists", () => {
      const state = resolveLoadingState({ isError: true, hasData: false });
      expect(state).toBe("error");
    });

    it("returns loading during initial fetch with no cached data", () => {
      expect(resolveLoadingState({ isPending: true, hasData: false })).toBe("loading");
      expect(resolveLoadingState({ isFetching: true, hasData: false })).toBe("loading");
    });

    it("returns refreshing when fetching but existing cached data is preserved", () => {
      const state = resolveLoadingState({ isFetching: true, hasData: true });
      expect(state).toBe("refreshing");
    });

    it("returns empty when data exists but collection is empty", () => {
      const state = resolveLoadingState({ hasData: true, isEmpty: true });
      expect(state).toBe("empty");
    });

    it("returns success when data exists and is not empty", () => {
      const state = resolveLoadingState({ hasData: true, isEmpty: false });
      expect(state).toBe("success");
    });

    it("returns idle when no active operation or data exists", () => {
      expect(resolveLoadingState({})).toBe("idle");
    });
  });

  describe("transitionLoadingState", () => {
    it("transitions from idle to loading on START", () => {
      expect(transitionLoadingState("idle", "START")).toBe("loading");
    });

    it("transitions from loading to success on SUCCESS", () => {
      expect(transitionLoadingState("loading", "SUCCESS")).toBe("success");
    });

    it("transitions to refreshing on REFRESH", () => {
      expect(transitionLoadingState("success", "REFRESH")).toBe("refreshing");
    });

    it("transitions to error on FAIL", () => {
      expect(transitionLoadingState("loading", "FAIL")).toBe("error");
    });

    it("transitions to offline on OFFLINE", () => {
      expect(transitionLoadingState("loading", "OFFLINE")).toBe("offline");
    });

    it("resets to idle on RESET", () => {
      expect(transitionLoadingState("success", "RESET")).toBe("idle");
    });
  });

  describe("state helper queries", () => {
    it("differentiates initial blocking loading from background refresh", () => {
      expect(isInitialLoading("loading", false)).toBe(true);
      expect(isInitialLoading("loading", true)).toBe(false);

      expect(isRefreshing("refreshing", true)).toBe(true);
      expect(isRefreshing("loading", true)).toBe(true);
      expect(isRefreshing("loading", false)).toBe(false);
    });

    it("allows showing cached data during transient errors or offline states", () => {
      expect(canShowCachedData("error", true)).toBe(true);
      expect(canShowCachedData("offline", true)).toBe(true);
      expect(canShowCachedData("refreshing", true)).toBe(true);
      expect(canShowCachedData("error", false)).toBe(false);
    });
  });
});
