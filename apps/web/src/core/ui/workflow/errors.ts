import type { WorkflowError, WorkflowErrorKind, ErrorSeverity } from "./types";

export function classifyWorkflowError(
  error: unknown,
  status?: number,
  requestId?: string,
): WorkflowError {
  // 1. Timeout / AbortError
  if (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.message.toLowerCase().includes("timeout"))
  ) {
    return {
      kind: "timeout",
      message: "The connection took too long to respond.",
      retryable: true,
      severity: "recoverable",
      requestId,
    };
  }

  // 2. Offline / Connectivity
  if (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    (error instanceof Error && error.message.toLowerCase().includes("offline"))
  ) {
    return {
      kind: "offline",
      message: "You appear to be offline. Some cached content may still be available.",
      retryable: true,
      severity: "warning",
      requestId,
    };
  }

  // 3. HTTP Status Codes
  if (typeof status === "number") {
    switch (status) {
      case 401:
        return {
          kind: "unauthorized",
          message: "Please sign in to access this feature.",
          retryable: false,
          severity: "recoverable",
          code: "UNAUTHORIZED",
          status,
          requestId,
        };
      case 403:
        return {
          kind: "forbidden",
          message: "You do not have permission to view this item.",
          retryable: false,
          severity: "warning",
          code: "FORBIDDEN",
          status,
          requestId,
        };
      case 404:
        return {
          kind: "not_found",
          message: "We couldn't find what you were looking for.",
          retryable: false,
          severity: "warning",
          code: "NOT_FOUND",
          status,
          requestId,
        };
      case 422:
      case 400:
        return {
          kind: "validation",
          message: "Invalid request. Please check the information provided.",
          retryable: false,
          severity: "warning",
          code: "VALIDATION_ERROR",
          status,
          requestId,
        };
      case 429:
        return {
          kind: "rate_limit",
          message: "High traffic. Please wait a moment before trying again.",
          retryable: true,
          severity: "warning",
          code: "RATE_LIMITED",
          status,
          requestId,
        };
      default:
        if (status >= 500) {
          return {
            kind: "server",
            message: "Our tourism services are momentarily busy. Please try again shortly.",
            retryable: true,
            severity: "recoverable",
            code: "SERVER_ERROR",
            status,
            requestId,
          };
        }
    }
  }

  // 4. Network TypeError
  if (
    error instanceof TypeError &&
    (error.message.includes("fetch") || error.message.includes("network"))
  ) {
    return {
      kind: "network",
      message: "We couldn't connect. Check your internet connection and try again.",
      retryable: true,
      severity: "recoverable",
      requestId,
    };
  }

  // 5. General Error message mapping
  if (error instanceof Error) {
    return {
      kind: "unknown",
      message: error.message || "An unexpected error occurred. Please try again.",
      retryable: true,
      severity: "recoverable",
      requestId,
    };
  }

  return {
    kind: "unknown",
    message: "Something went wrong while retrieving information.",
    retryable: true,
    severity: "recoverable",
    requestId,
  };
}
