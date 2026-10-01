import type { LoadingState, LoadingEvent } from "./types";

/**
 * State Transition Matrix for UI Loading
 * IDLE -> LOADING -> (SUCCESS | ERROR | OFFLINE)
 * SUCCESS -> REFRESHING -> SUCCESS
 */
export function transitionLoadingState(
  current: LoadingState,
  event: LoadingEvent,
): LoadingState {
  switch (event) {
    case "START":
      return current === "success" ? "refreshing" : "loading";
    case "REFRESH":
      return "refreshing";
    case "SUCCESS":
      return "success";
    case "FAIL":
      return "error";
    case "OFFLINE":
      return "offline";
    case "RESET":
      return "idle";
    default:
      return current;
  }
}

/**
 * Resolves a unified LoadingState from standard data-fetching / React Query flags
 */
export function resolveLoadingState(params: {
  isPending?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  isOffline?: boolean;
  hasData?: boolean;
  isEmpty?: boolean;
}): LoadingState {
  const {
    isPending = false,
    isFetching = false,
    isError = false,
    isOffline = false,
    hasData = false,
    isEmpty = false,
  } = params;

  if (isOffline && !hasData) {
    return "offline";
  }

  if (isError && !hasData) {
    return "error";
  }

  // Initial load when no cached/previous data exists
  if ((isPending || isFetching) && !hasData) {
    return "loading";
  }

  // Background refresh with existing data preserved
  if (isFetching && hasData) {
    return "refreshing";
  }

  if (hasData) {
    return isEmpty ? "empty" : "success";
  }

  return "idle";
}

/**
 * Helper to check if a component is in an initial blocking or skeleton loading state
 */
export function isInitialLoading(state: LoadingState, hasData = false): boolean {
  return state === "loading" && !hasData;
}

/**
 * Helper to check if a component is refreshing with existing data preserved
 */
export function isRefreshing(state: LoadingState, hasData = true): boolean {
  return (state === "refreshing" || state === "loading") && hasData;
}

/**
 * Helper to determine whether cached content should remain visible during errors or offline
 */
export function canShowCachedData(state: LoadingState, hasData: boolean): boolean {
  return hasData && (state === "error" || state === "offline" || state === "refreshing" || state === "success");
}
