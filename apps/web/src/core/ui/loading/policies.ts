/**
 * Loading Policies for CG Tourism UI/UX
 * Defined as UX timing policies and SLA thresholds, never artificial delays.
 */

export const loadingPolicy = {
  /** Minimum duration (ms) for high-priority blocking indicators to prevent flicker */
  minimumBlockingDuration: 120,

  /** Delay threshold (ms) before rendering a skeleton placeholder */
  skeletonThreshold: 200,

  /** Threshold (ms) beyond which a network request is classified as slow network */
  slowNetworkThreshold: 3000,

  /** Threshold (ms) for operations requiring progressive explanations or retry actions */
  longRunningThreshold: 10000,
} as const;

export type LoadingPolicy = typeof loadingPolicy;
