/**
 * CG Tourism OS — State Lifecycle & Contract Definitions
 * Every UI surface conforms to this deterministic state machine.
 */

export const UI_LIFECYCLE_STATES = [
  'INITIAL',
  'LOADING',
  'READY',
  'EMPTY',
  'ERROR',
  'OFFLINE_SYNCING',
] as const;

export type UILifecycleState = (typeof UI_LIFECYCLE_STATES)[number];

export const ERROR_SEVERITY_LEVELS = [
  'RECOVERABLE',   // Single retry or offline cache available
  'DEGRADED',      // Partial data shown (e.g. text available, photos offline)
  'FATAL',         // Complete surface failure
  'EMERGENCY',     // Safety/SOS system communication interrupted
] as const;

export type ErrorSeverityLevel = (typeof ERROR_SEVERITY_LEVELS)[number];

export interface UIStateContract<TData = unknown> {
  state: UILifecycleState;
  data: TData | null;
  error: {
    message: string;
    code?: string;
    severity?: ErrorSeverityLevel;
    retryable?: boolean;
    cachedFallbackAvailable?: boolean;
    requestId?: string;
  } | null;
  emptyContext?: {
    reason: string;
    suggestedDistrict?: string;
    fallbackTags?: string[];
  } | null;
  isOffline?: boolean;
  lastSyncedAt?: string | null;
}
