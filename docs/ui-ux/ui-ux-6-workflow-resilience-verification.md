# UI/UX Phase Verification: Workflow, Breakdown, Errors, Timeouts & Non-Loading Screens (Phase 6)

## 1. Overview
UI/UX Phase 6 establishes the canonical resilience layer for CG Tourism OS. It ensures the application never leaves a user wondering whether the system is loading, frozen, offline, or broken.

Philosophy:
```
REQUEST → IDLE → LOADING ──┬──→ SUCCESS (Content)
                           ├──→ EMPTY (EmptyState)
                           ├──→ ERROR / TIMEOUT (Recoverable Error + Retry)
                           └──→ OFFLINE (Cached Guides Available)
```

Non-loading screen principle:
Pages remain structurally useful while independent sections (weather, reviews, map layers) load or recover asynchronously.

---

## 2. Core Architecture & Modules

### 2.1 Workflow State Model (`apps/web/src/core/ui/workflow/`)
1. **`types.ts`**:
   - `WorkflowStatus`: `"idle" | "loading" | "success" | "empty" | "error" | "timeout" | "offline" | "cancelled"`
   - `WorkflowErrorKind`: `"network" | "timeout" | "offline" | "not_found" | "unauthorized" | "forbidden" | "validation" | "rate_limit" | "server" | "unknown"`
   - `WorkflowState<T>`, `WorkflowAction<T>`, `WorkflowError`
2. **`state.ts`**: Initial state creators, type guards (`isWorkflowSuccess`, `isWorkflowError`, `isWorkflowTerminal`, `isWorkflowRetryable`).
3. **`transitions.ts`**: Deterministic state transitions handling `START`, `SUCCEED`, `SET_EMPTY`, `FAIL`, `TIMEOUT`, `CANCEL`, `OFFLINE`, `RETRY`, `RESET`.
4. **`timeout.ts`**: Timeouts with cancellation (`DEFAULT_TIMEOUT_MS: 15s`, `SEARCH_TIMEOUT_MS: 8s`, `MAP_GEO_TIMEOUT_MS: 10s`, `MUTATION_TIMEOUT_MS: 20s`), `createTimeoutController`, `withTimeout`.
5. **`retry.ts`**: Exponential backoff with jitter (`getRetryDelay`), idempotent method guard (`isSafeToAutoRetry` for `GET`/`HEAD`/`OPTIONS` only; never auto-retry non-idempotent mutations), `executeWithRetry`.
6. **`errors.ts`**: Standardized error classifier (`classifyWorkflowError`) handling DOMException `AbortError`, HTTP 401/403/404/422/429/500+, TypeError network issues, offline navigator detection.
7. **`cancellation.ts`**: `createRequestTracker` for superseding in-flight requests and preventing race conditions.
8. **`visibility.ts`**: Independent section tracker (`createSectionTracker`) for multi-part dashboard/destination views.

### 2.2 Canonical Feedback & Recovery Components (`apps/web/src/components/feedback/`)
1. **`Skeleton/`**:
   - `Skeleton.tsx`: Accessible base shimmer with `aria-hidden="true"`, respecting `@media (prefers-reduced-motion: reduce)` in `styles/feedback.css`.
   - `SkeletonText.tsx`: Multi-line proportional width text placeholders.
   - `SkeletonCard.tsx`: Structural cards matching tourism destination cards.
   - `SkeletonImage.tsx`: Aspect-ratio-preserving photo placeholder with subtle icon.
   - `SkeletonMap.tsx`: Observer grid lines and spinning compass indicator.
2. **`ErrorState/`**:
   - `ErrorState.tsx`: Accessible alert container with error reference/request ID, customizable retry button, and fallback action.
   - `NetworkError.tsx`: Dedicated connection recovery view with offline troubleshooting tips.
   - `TimeoutError.tsx`: Time-elapsed indicator with retry and continue browsing actions.
   - `NotFoundState.tsx`: 404 destination not found with compass badge and route suggestions.
3. **`EmptyState/`**:
   - `EmptyState.tsx`: Filter clearing, custom action rendering, and helpful empty messaging.
4. **`Retry/`**:
   - `RetryButton.tsx`: Animated reload icon, loading state, retry attempt counter.
5. **Legacy Consolidation**:
   - `components/states/ErrorState.tsx` & `EmptyState.tsx` delegated to canonical implementations, eliminating duplication.

### 2.3 Route & Map Boundary Integration
1. **Route Boundaries**:
   - `apps/web/src/app/error.tsx`: Re-initialization global error boundary with `ErrorState`.
   - `apps/web/src/app/not-found.tsx`: 404 page using `NotFoundState` pointing to `/explore`.
   - `apps/web/src/app/content/[templateSlug]/[entrySlug]/page.tsx`: 404 fallback using canonical `NotFoundState`.
2. **Map Experience Resilience**:
   - `MapCanvas.tsx`: Added `onLayerError` tracking on `<TileLayer>`.
   - `MapExperience.tsx`: Partial layer failure handling with automatic fallback from failed satellite/terrain tiles to standard topography, non-blocking notification toast, and telemetry.
3. **Content Renderer Resilience**:
   - `ContentRenderer.tsx`: Resilient try/catch per field rendering and empty-state fallback.

---

## 3. Test Suite Verification
- **Total Test Suites**: 146 / 146 passed
- **Total Tests**: 581 / 581 passed (including 34 workflow core tests and 28 feedback component tests)
- **Playwright E2E**:
  - `e2e/resilience/loading.spec.ts`: Smooth loading transitions without layout shift.
  - `e2e/resilience/errors.spec.ts`: 404 and error boundary assertions.

---

## 4. Production Build Verification
- **Command**: `next build --webpack`
- **TypeScript**: 0 errors
- **Webpack Bundle**: 87/87 static & dynamic routes generated successfully
- **Result**: Production-ready resilience architecture validated.
